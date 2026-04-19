import {
  computeRankingCore,
  getGroupScoringAudit,
  getSharedTeamPlacementPoints,
  normalizeTeamPlacementsForResult,
} from '../domain/rankingDomain.js';

function escapeHtml(value) {
  if (typeof globalThis.escapeHtml === 'function') return globalThis.escapeHtml(value);
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}
function fpShort(fp) {
  if (typeof globalThis.fpShort === 'function') return globalThis.fpShort(fp);
  return String(fp?.nickname || fp?.firstName || fp?.name || '?').trim() || '?';
}
function fpName(fp) {
  if (typeof globalThis.fpName === 'function') return globalThis.fpName(fp);
  const first = String(fp?.firstName || '').trim();
  const last = String(fp?.lastName || '').trim();
  const nick = String(fp?.nickname || '').trim();
  return [first, last].filter(Boolean).join(' ') || nick || '?';
}
function fpSub(fp) {
  if (typeof globalThis.fpSub === 'function') return globalThis.fpSub(fp);
  return String(fp?.nickname || '').trim();
}
function fpLines(fp) {
  if (typeof globalThis.fpLines === 'function') return globalThis.fpLines(fp);
  const fullName = [fp?.firstName, fp?.lastName].filter(Boolean).join(' ').trim();
  const nick = String(fp?.nickname || '').trim();
  return [fullName, nick].filter(Boolean);
}
function isSolo(fp) {
  if (typeof globalThis.isSolo === 'function') return globalThis.isSolo(fp);
  return !String(fp?.teamName || '').trim();
}

// Stage 5: Ranking-Popup komplett überarbeitet — sichtbare Inhalte + Newsticker

// ── Standard-Tickersätze ──────────────────────────────────────────────────────
const DEFAULT_TICKER_TEMPLATES = [
  "{WINNER} lässt {LOSER} auf {KONSOLE} keine Chance und kassiert {W_PTS} Punkte!",
  "Knappes Rennen auf {KONSOLE}: {WINNER} setzt sich knapp gegen {LOSER} durch.",
  "{WINNER} dominiert das Match auf {KONSOLE} — {W_PTS} Punkte für den Sieger!",
  "Auf {KONSOLE} heißt es: {WINNER} 1, {LOSER} 2. Starkes Rennen!",
  "{LOSER} kämpft tapfer, aber {WINNER} holt sich die Punkte auf {KONSOLE}.",
  "Überraschung auf {KONSOLE}: {WINNER} schlägt {LOSER} und sichert {W_PTS} Punkte.",
  "{WINNER} und {LOSER} liefern sich ein spannendes Duell — {WINNER} gewinnt!",
  "Im Match auf {KONSOLE} hat {WINNER} die Nase vorn. {W_PTS} Punkte gutgeschrieben.",
  "{WINNER} zeigt auf {KONSOLE}, warum {PRONOMEN} zu den Favoriten zählt.",
  "{LOSER} muss sich geschlagen geben — {WINNER} triumphiert auf {KONSOLE}!",
  "Es war heiß umkämpft auf {KONSOLE}: Am Ende jubelt {WINNER}.",
  "{WINNER} lässt auf {KONSOLE} aufhorchen: souveräner Sieg gegen {LOSER}.",
  "Kein Entkommen für {LOSER}: {WINNER} holt {W_PTS} Punkte auf {KONSOLE}.",
  "{WINNER} hält die Nerven auf {KONSOLE} und fährt als Sieger ins Ziel.",
  "Nach einem packenden Match auf {KONSOLE}: Glückwunsch an {WINNER}!",
  "{WINNER} vs. {LOSER} auf {KONSOLE} — ein Klassiker. Sieger: {WINNER}.",
  "Auf {KONSOLE} entscheidet {WINNER} das Duell mit {W_PTS} Punkten für sich.",
  "{LOSER} liefert eine starke Leistung, {WINNER} ist heute aber besser.",
  "{WINNER} schlägt {LOSER} auf {KONSOLE} — {W_PTS} wertvolle Punkte!",
  "Mit einer überzeugenden Vorstellung gewinnt {WINNER} auf {KONSOLE}.",
  "{WINNER} setzt ein Ausrufezeichen auf {KONSOLE}: {W_PTS} Punkte geholt.",
  "Drama auf {KONSOLE}: {WINNER} schlägt {LOSER} in letzter Sekunde!",
  "{WINNER} übernimmt die Führung nach dem Sieg auf {KONSOLE}.",
  "Erstklassige Leistung von {WINNER} auf {KONSOLE} — {LOSER} chancenlos.",
  "{WINNER} und {LOSER} liefern Unterhaltung pur — {WINNER} holt den Sieg!",
  "Auf {KONSOLE} beweist {WINNER}: Heute ist {PRONOMEN} nicht zu schlagen.",
  "{LOSER} kämpft bis zum Schluss — {WINNER} ist aber eine Klasse für sich.",
  "Solide Performance von {WINNER} auf {KONSOLE}: {W_PTS} Punkte sicher.",
  "{WINNER} schreibt Geschichte auf {KONSOLE} — {LOSER} muss sich beugen.",
  "Ein weiterer Punktgewinn für {WINNER}! Dieses Mal auf {KONSOLE}.",
];

// ── Ticker-Konfiguration aus orgaData ──────────────────────────────────────────
function getTickerTemplates(orgaData) {
  const custom = (orgaData && orgaData.tickerTemplates);
  if (Array.isArray(custom) && custom.length > 0) return custom;
  return DEFAULT_TICKER_TEMPLATES;
}
function getTickerSpeed(orgaData) {
  const s = orgaData && orgaData.tickerSpeed;
  const n = parseFloat(s);
  return (!isNaN(n) && n > 0) ? n : 80; // px/s, Standard 80
}

// ── Abgeschlossene Matches für Ticker extrahieren ─────────────────────────────
function buildTickerItems(fps, schedule, results, orgaData) {
  if (!schedule || !fps) return [];
  const templates = getTickerTemplates(orgaData);
  const items = [];
  const fpMap = Object.fromEntries((fps || []).map(f => [f.id, f]));

  (schedule || []).forEach(sess => {
    (sess.groups || []).forEach(grp => {
      const res = results && results[grp.id];
      if (!res) return;
      const konsoleName = sess.consoleName || sess.consoleId || '?';

      const audit = typeof getGroupScoringAudit === 'function' ? getGroupScoringAudit(grp, res) : null;
      if (audit && !audit.isScorable) return;
      if (grp.teamMode) {
        const placements = audit ? audit.normalizedPlacements : (typeof normalizeTeamPlacementsForResult === 'function'
          ? normalizeTeamPlacementsForResult(grp, res)
          : { ...((res && res.teamPlacements) || {}) });
        const winnerEntry = Object.entries(placements).find(([, placement]) => parseInt(placement, 10) === 1);
        const wt = winnerEntry ? parseInt(winnerEntry[0], 10) : (res && res.winningTeam != null ? parseInt(res.winningTeam, 10) : null);
        if (!Number.isFinite(wt)) return;
        const teamSize = grp.teamSize || 1;
        const winnerFpIds = grp.fps.filter((_, i) => Math.floor(i / teamSize) === wt);
        const loserFpIds  = grp.fps.filter((_, i) => Math.floor(i / teamSize) !== wt);
        const winnerNames = [...new Set(winnerFpIds.map(id => { const f = fpMap[id]; return f ? (f.teamName || fpShort(f)) : '?'; }))];
        const loserNames  = [...new Set(loserFpIds.map(id => { const f = fpMap[id]; return f ? (f.teamName || fpShort(f)) : '?'; }))];
        const winner = winnerNames[0] || 'Team A';
        const loser  = loserNames[0]  || 'Team B';
        const winnerPts = typeof getSharedTeamPlacementPoints === 'function'
          ? getSharedTeamPlacementPoints((grp && grp.points) || [], 1, teamSize)
          : ((grp.points && grp.points[0]) || '5');
        const tpl = templates[Math.floor(Math.random() * templates.length)];
        items.push(tpl
          .replace(/{WINNER}/g, winner)
          .replace(/{LOSER}/g, loser)
          .replace(/{KONSOLE}/g, konsoleName)
          .replace(/{W_PTS}/g, winnerPts)
          .replace(/{PRONOMEN}/g, 'das Team')
        );
      } else {
        // Solo-Match: placements
        const placements = audit ? audit.normalizedPlacements : (res.placements || {});
        const ranked = grp.fps
          .filter(id => placements[id] != null)
          .sort((a, b) => placements[a] - placements[b]);
        if (ranked.length < 2) return;
        const winnerId = ranked[0];
        const loserId  = ranked[1];
        const wFp = fpMap[winnerId];
        const lFp = fpMap[loserId];
        if (!wFp || !lFp) return;
        const winner = fpShort(wFp);
        const loser  = fpShort(lFp);
        const pts = (grp.points && grp.points[0]) || '5';
        const pronomen = 'er/sie';
        const tpl = templates[Math.floor(Math.random() * templates.length)];
        items.push(tpl
          .replace(/{WINNER}/g, winner)
          .replace(/{LOSER}/g, loser)
          .replace(/{KONSOLE}/g, konsoleName)
          .replace(/{W_PTS}/g, pts)
          .replace(/{PRONOMEN}/g, pronomen)
        );
      }
    });
  });

  // Mische die Items damit es abwechslungsreich bleibt
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}


function trimPopupRankLabel(text, max = 20) {
  const value = String(text || '').trim();
  return value.length > max ? value.slice(0, Math.max(1, max - 1)) + '…' : value;
}
function popupFpSlotLabel(fp, fps = []) {
  if (!fp) return '???';
  if (fp.teamName) return fp.teamName;
  const idx = fps.indexOf(fp);
  const slotNum = idx >= 0 ? idx + 1 : 1;
  const p0 = fp.players && fp.players[0];
  if (!p0 || !p0.dbPlayerId) return p0 ? (p0.name || `Spieler ${String(slotNum).padStart(2,'0')}`) : `Spieler ${String(slotNum).padStart(2,'0')}`;
  return `Spieler ${String(slotNum).padStart(2,'0')}`;
}
function resolvePopupEntryDisplay(e, meta) {
  const fps = meta?.fps || [];
  const isTeam = e.type === 'team';
  if (isTeam) {
    const teamFps = fps.filter(f => f.teamName === e.teamName);
    const teamMembers = teamFps.length
      ? teamFps.flatMap(f => fpLines(f)).join(' · ')
      : (e.sub || '');
    return { title: trimPopupRankLabel(e.name || 'Team', 20), subtitle: teamMembers || (e.sub || '') };
  }
  const fp = fps.find(f => String(f.id) === String(e.fpId || ''));
  if (fp) {
    const p0 = fp.players && fp.players[0];
    const slotName = popupFpSlotLabel(fp, fps);
    const nickname = (p0 && p0.nickname) ? p0.nickname : null;
    const realName = (p0 && p0.dbPlayerId) ? (p0.name || '') : null;
    const title = nickname || slotName;
    const subtitle = nickname
      ? (realName || '')
      : (realName && realName !== title ? realName : (fpLines(fp).join(' · ') || ''));
    return { title: trimPopupRankLabel(title, 24), subtitle };
  }
  return { title: trimPopupRankLabel(e.name || '', 20), subtitle: e.sub || '' };
}
function popupCleanText(value) {
  return String(value == null ? '' : value).trim();
}
function formatPopupPerson(person) {
  const name = popupCleanText(person?.name);
  const nick = popupCleanText(person?.nickname);
  if (name && nick) return `${name} "${nick}"`;
  return name || nick || '';
}
function resolvePopupConsoleDisplay(fp) {
  if (!fp) return { title: '???', subtitle: '' };
  const players = Array.isArray(fp.players) ? fp.players.filter(Boolean) : [];
  const first = players[0] || {};
  const firstName = popupCleanText(first.name);
  const firstNick = popupCleanText(first.nickname);
  const teamName = popupCleanText(fp.teamName);
  const title = teamName
    ? trimPopupRankLabel(teamName, 24)
    : trimPopupRankLabel(firstNick || firstName || fpShort(fp), 24);
  return { title, subtitle: '' };
}
function popupConsoleProgress(meta, fpId, cid) {
  const st = (((meta?.conStats || {})[fpId] || {})[cid]) || { done: 0, total: 0 };
  return {
    done: !!st.total && st.done === st.total,
    text: `${st.done || 0}/${st.total || 0} Konsole`,
  };
}

// ── Hauptfunktion: Popup-State aufbauen ───────────────────────────────────────
function buildRankingPopupState(fps, schedule, results, stechenBlocks = [], stechenTimes = {}, view = 'gesamt', orgaData) {
  if (!schedule) return { title: 'Rangliste', view, sections: [], meta: null, ticker: [] };
  const core = computeRankingCore(fps, schedule, results, stechenBlocks, stechenTimes);
  const totalLeft  = core.gesamtEntries.slice(0, 12).map(e => ({ rank: e.rank, type: e.type, name: e.name, sub: e.sub, pts: e.pts, fpId: e.fp?.id || '', teamName: e.type === 'team' ? e.name : '' }));
  const totalRight = core.gesamtEntries.slice(12, 24).map(e => ({ rank: e.rank, type: e.type, name: e.name, sub: e.sub, pts: e.pts, fpId: e.fp?.id || '', teamName: e.type === 'team' ? e.name : '' }));
  const soloLeft   = core.soloRank.slice(0, 12).map(fp => ({ rank: fp.rank, type: 'solo', name: fpName(fp), sub: fpSub(fp), pts: fp.pts, fpId: fp.fp?.id || fp.id || '' }));
  const soloRight  = core.soloRank.slice(12).map(fp  => ({ rank: fp.rank, type: 'solo', name: fpName(fp), sub: fpSub(fp), pts: fp.pts, fpId: fp.fp?.id || fp.id || '' }));
  const teamEntries = core.teamRank.map(x => ({ rank: x.rank, type: 'team', name: x.t, teamName: x.t, sub: x.members.flatMap(f => f.players.map(p => p.nickname ? `${p.name} "${p.nickname}"` : p.name)).join(' · '), pts: x.pts }));
  const sections = [];
  if (view === 'gesamt') {
    sections.push({ title: '🏆 Plätze 1–12', entries: totalLeft });
    if (totalRight.length) sections.push({ title: 'Plätze 13–24', entries: totalRight });
  }
  if (view === 'solo') {
    sections.push({ title: '👤 Einzelwertung (1–12)', entries: soloLeft });
    if (soloRight.length) sections.push({ title: 'Plätze 13–24', entries: soloRight });
  }
  if (view === 'team') {
    sections.push({ title: '👥 Teamwertung', entries: teamEntries });
  }
  if (view === 'konsolen') {
    sections.push({ title: 'Konsolenranking', isKonsolenGrid: true, columns: core.conRankings.map(group => ({ cid: group.cid, emoji: group.emoji, name: group.name, entries: group.rank.map(({ f, pts, rank }) => ({ rank, type: isSolo(f) ? 'solo' : 'team', name: fpShort(f), sub: isSolo(f) ? fpSub(f) : '', pts, fpId: f.id || '', cid: group.cid })) })) });
  }
  const ticker = buildTickerItems(fps, schedule, results, orgaData);
  const tickerSpeed = getTickerSpeed(orgaData);
  const soloRankMap = Object.fromEntries((core.soloRank || []).map(fp => [String(((fp.fp || fp).id || '')), fp.rank]));
  const teamRankMap = Object.fromEntries((core.teamRank || []).map(team => [team.t, team.rank]));
  return {
    title: view === 'gesamt' ? 'Gesamtranking' : view === 'solo' ? 'Einzelranking' : view === 'team' ? 'Teamranking' : 'Konsolenranking',
    view, sections,
    meta: { conStats: core.conStats, consoleOrder: core.consoleOrder, fps, conPts: core.conPts || {}, teamConPts: core.teamConPts || {}, soloRankMap, teamRankMap },
    ticker, tickerSpeed,
  };
}

// ── Einzelner Popup-Eintrag als HTML ─────────────────────────────────────────
function rankingPopupEntryHtml(e, meta, view = 'gesamt') {
  const conStats = meta?.conStats || {};
  const consoleOrder = meta?.consoleOrder || [];
  const fps = meta?.fps || [];
  const conPts = meta?.conPts || {};
  const teamConPts = meta?.teamConPts || {};
  const soloRankMap = meta?.soloRankMap || {};
  const teamRankMap = meta?.teamRankMap || {};
  const isTeam = e.type === 'team';
  const fpId = e.fpId;
  const myStats = fpId ? conStats[fpId] : {};
  const teamFps = isTeam ? (fps || []).filter(f => f.teamName === e.teamName) : [];
  const teamStats = {};
  if (isTeam) {
    consoleOrder.forEach(cid => {
      let done = 0, total = 0;
      teamFps.forEach(f => {
        const st = (conStats[f.id] || {})[cid] || { done: 0, total: 0 };
        done += st.done;
        total += st.total;
      });
      teamStats[cid] = { done, total };
    });
  }
  const statsToShow = fpId ? myStats : teamStats;
  const pointText = Number.isInteger(e.pts) ? String(e.pts) : String((e.pts || 0).toFixed(1));
  const rankLabel = e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : '#' + e.rank;
  const display = resolvePopupEntryDisplay(e, meta);
  const subtitleText = view === 'gesamt'
    ? (isTeam
        ? (teamRankMap[e.teamName] ? `Teamwertung · Platz ${teamRankMap[e.teamName]}` : 'Teamwertung')
        : (soloRankMap[String(fpId || '')] ? `Einzelwertung · Platz ${soloRankMap[String(fpId || '')]}` : 'Einzelwertung'))
    : display.subtitle;
  const leaderFlags = (() => {
    const data = isTeam ? (teamConPts || {}) : (conPts || {});
    const entryKey = isTeam ? e.teamName : String(fpId || '');
    const map = {};
    (consoleOrder || []).forEach(cid => {
      const entries = Object.entries((data && data[cid]) || {});
      const maxPts = Math.max(0, ...entries.map(([, pts]) => Number(pts) || 0));
      if (!maxPts) return;
      if (isTeam) {
        if ((Number((((teamConPts || {})[cid] || {})[e.teamName]) || 0)) === maxPts) map[cid] = true;
      } else {
        if ((Number((((conPts || {})[cid] || {})[entryKey]) || 0)) === maxPts) map[cid] = true;
      }
    });
    return map;
  })();
  const badges = (Object.keys(statsToShow).length && consoleOrder.length)
    ? consoleOrder.map(cid => {
        const st = statsToShow[cid] || { done: 0, total: 0 };
        if (!st.total) return '';
        const all = st.done === st.total;
        const lbl = RANKING_SHORT_NAME[cid] || cid;
        const isLeader = view === 'gesamt' && !!leaderFlags[cid];
        return `<span class="rnk-console-chip${all ? ' done' : ''}${isLeader ? ' leader' : ''}">${escapeHtml(lbl)}&nbsp;${st.done}/${st.total}</span>`;
      }).join('')
    : '';
  return `<div class="rnk-entry${e.rank <= 3 ? ` r${e.rank}` : ''}">
    <div class="rnk-b1"><span class="rnum">${rankLabel}</span></div>
    <div class="rnk-b2">
      <div class="rnk-b2-top">
        <div class="rnk-b2-left">
          <span class="rname" title="${escapeHtml(display.title)}">${escapeHtml(display.title)}</span>
          <span class="rnk-typetag ${isTeam ? 'team' : 'solo'}">${isTeam ? 'T' : 'S'}</span>
        </div>
        ${badges ? `<div class="rnk-b2-chips">${badges}</div>` : ''}
      </div>
      ${subtitleText ? `<div class="rsub" title="${escapeHtml(subtitleText || '')}">${escapeHtml(subtitleText)}</div>` : ''}
    </div>
    <div class="rnk-b3"><div class="rnk-b3-inner"><span class="rpts">${escapeHtml(pointText)}</span><span class="rpts-p">Punkte</span></div></div>
  </div>`;
}

// ── Popup-HTML-Shell ──────────────────────────────────────────────────────────
function rankingPopupShellHtml() {
  const baseHref = escapeHtml((typeof window !== 'undefined' && window.location && window.location.href)
    ? String(new URL('./', window.location.href))
    : '');
  const stylesheetHref = (typeof window !== 'undefined' && window.__MKWC_MAIN_STYLESHEET__)
    ? String(window.__MKWC_MAIN_STYLESHEET__)
    : 'styles/main.css';
  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"/><title>Rangliste · MKWC</title><base href="${baseHref}"/><link rel="stylesheet" href="${esc(stylesheetHref)}"/><style>
:root{
  color-scheme: light;
  --bg:#dceaf4;
  --nav:#10101c;
  --card:#ffffff;
  --card2:#f5f5fa;
  --bord:#e0e0ee;
  --bord2:#d0d0e0;
  --red:#e60012;
  --red2:#ff1a2e;
  --gold:#c8960a;
  --gold2:#f5c518;
  --blue:#0070e0;
  --blue2:#2f8fff;
  --blue3:#0a4fa3;
  --green:#0a8a3a;
  --muted:#7070a0;
  --dk:#0c0c14;
  --dt:#111;
  --ds:#555;
  --fp:'Press Start 2P',monospace;
  --fb:'Inter',sans-serif;
  --fd:'Space Grotesk',sans-serif;
}
*{box-sizing:border-box}
html, body{
  width:100%;
  height:100%;
  margin:0;
  padding:0;
  overflow:hidden;
  background:#dceaf4 !important;
  color:var(--dk) !important;
}
body{
  font-family:var(--fb) !important;
  line-height:1.45;
  letter-spacing:.01em;
}
.stage{
  position:fixed;
  inset:0;
  display:flex;
  align-items:flex-start;
  justify-content:center;
  padding:12px;
  overflow:hidden;
  background:#dceaf4;
}
.screen{
  width:1600px;
  height:900px;
  transform-origin:top center;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.head{
  display:flex;
  align-items:center;
  gap:12px;
  padding:2px 2px 0;
  flex-shrink:0;
}
.head-title{
  font-family:var(--fd);
  font-size:18px;
  font-weight:700;
  color:var(--dk);
  letter-spacing:.02em;
}
.head-right{ margin-left:auto; }
.hbtn{
  display:inline-flex;
  align-items:center;
  gap:7px;
  padding:8px 12px;
  border-radius:8px;
  border:1.5px solid var(--bord2);
  background:#fff8e0;
  color:#8a6000;
  font-family:var(--fd);
  font-size:9px;
  letter-spacing:.8px;
  cursor:pointer;
  box-shadow:0 2px 10px rgba(0,0,0,.08);
}
.hbtn:hover{
  border-color:#ffd966;
  color:#6d4d00;
  transform:translateY(-1px);
}
.body{
  flex:1;
  min-height:0;
  display:flex;
  flex-direction:column;
}
.pgrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  flex:1;
  min-height:0;
  align-items:stretch;
}
.pgrid > .rnk-block,
.pgrid > .rnk-grid,
.pgrid > .con-grid{
  min-height:0;
}
.con-grid{
  grid-auto-rows:1fr;
}
.ticker{
  flex-shrink:0;
  height:36px;
  display:flex;
  align-items:center;
  overflow:hidden;
  border:1px solid var(--bord);
  background:#fff;
  border-radius:12px;
  box-shadow:0 8px 20px rgba(10,12,30,.08);
}
.ticker-label{
  background:linear-gradient(180deg, #ff6a7b 0%, #e60012 100%);
  color:#fff;
  font-family:var(--fd);
  font-size:10px;
  font-weight:700;
  letter-spacing:1px;
  padding:0 12px;
  height:100%;
  display:flex;
  align-items:center;
  flex-shrink:0;
  text-transform:uppercase;
}
.ticker-track{flex:1;overflow:hidden;position:relative;height:100%}
.ticker-inner{position:relative;width:100%;height:100%}
.ticker-span{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  white-space:nowrap;
  font-size:14px;
  color:var(--dk);
  will-change:transform;
}
.empty{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:160px;
  border:1px dashed var(--bord2);
  border-radius:12px;
  background:#ffffffaa;
  color:var(--muted);
  font-family:var(--fd);
}
  </style></head><body>
    <div class="stage"><div class="screen">
      <div class="head"><div class="head-title" id="title">Rangliste</div><div class="head-right"><button class="hbtn" onclick="window.close()">Schließen</button></div></div>
      <div class="body"><div class="pgrid" id="root"></div></div>
      <div class="ticker"><div class="ticker-label">Ticker</div><div class="ticker-track"><div class="ticker-inner" id="ticker"></div></div></div>
    </div></div>
    <script>
      (function(){
        function fit(){
          var stage=document.querySelector('.stage'); var screen=document.querySelector('.screen'); if(!stage||!screen) return;
          var w=window.innerWidth-24, h=window.innerHeight-24; var s=Math.min(w/1600,h/900); if(!isFinite(s)||s<=0) s=1;
          screen.style.transform='scale('+s+')';
        }
        window.addEventListener('resize', fit); fit();
        window._startTicker = function(items, speed){
          var root=document.getElementById('ticker'); if(!root) return;
          root.innerHTML='';
          speed = speed || 80;
          var x = root.clientWidth;
          items = Array.isArray(items) ? items.slice() : [];
          var idx = 0;
          function mount(text){
            var el=document.createElement('div'); el.className='ticker-span'; el.textContent=text;
            root.appendChild(el);
            var rw = root.clientWidth; var ew = el.offsetWidth;
            x = rw;
            function step(){
              x -= speed/60;
              el.style.left = x + 'px';
              if(x < -ew - 20){
                el.remove();
                idx = (idx + 1) % items.length;
                mount(items[idx] || '');
                return;
              }
              requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
          }
          if(items.length){ mount(items[0]); }
        };
      })();
    </script>
  </body></html>`;
}

// ── Popup-Inhalt als HTML ─────────────────────────────────────────────────────
function rankingPopupContentHtml(state) {
  const sections = (state?.sections || []).map(section => {
    if (section.isKonsolenGrid) {
      const cols = section.columns || [];
      const colHtml = cols.map(col => {
        const rows = col.entries.slice(0, 24).map(e => {
          const r = e.rank;
          const lbl = r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : '#' + r;
          const fp = (state?.meta?.fps || []).find(x => String(x.id) === String(e.fpId || ''));
          const display = resolvePopupConsoleDisplay(fp);
          const pointText = Number.isInteger(e.pts) ? String(e.pts) : String((e.pts || 0).toFixed(1));
          return `<div class="ce${r <= 3 ? ` ce-r${r}` : ''}">
            <div class="ce-b1"><span class="cerank">${lbl}</span></div>
            <div class="ce-b2">
              <div class="ce-b2-top">
                <div class="cename" title="${escapeHtml(display.title)}">${escapeHtml(display.title)}</div>
              </div>
            </div>
            <div class="ce-b3"><span class="cepts">${escapeHtml(pointText)}</span><span class="cepts-p">Punkte</span></div>
          </div>`;
        }).join('');
        return `<div class="con-col"><div class="con-col-hdr">${escapeHtml(col.emoji + ' ' + col.name)}</div><div class="con-entries-wrap">${rows || '<div class="empty">–</div>'}</div></div>`;
      }).join('');
      const cols_n = Math.max(1, Math.min(cols.length, 6));
      return `<div class="con-grid" style="grid-template-columns:repeat(${cols_n}, minmax(0,1fr))">${colHtml}</div>`;
    }
    const entries = (section.entries || []);
    const listHtml = entries.length
      ? entries.map(e => rankingPopupEntryHtml(e, state.meta, state.view)).join('')
      : '<div class="empty">Noch keine Ergebnisse</div>';
    return `<div class="rnk-block"><div class="rnk-block-hdr">${escapeHtml(section.title)}</div><div class="rnk-entries-wrap">${listHtml}</div></div>`;
  }).join('');
  return sections || '<div class="empty" style="padding:40px;font-size:18px;text-align:center;grid-column:span 2">Noch keine Ergebnisse</div>';
}

// ── Popup-Window rendern ──────────────────────────────────────────────────────
function ensureRankingPopupWindow(popupRef, unique) {
  let win = popupRef.current;
  const name = unique ? 'mkwc_pin_' + Date.now() : 'mkwc_ranking_popup';
  if (!win || win.closed || unique) {
    const sw = window.screen?.availWidth || 1440;
    const sh = window.screen?.availHeight || 900;
    const features = `popup=yes,width=${Math.max(1280,sw-80)},height=${Math.max(760,sh-80)},left=40,top=40,resizable=yes,scrollbars=no`;
    win = window.open('', name, features);
    if (!win) return null;
    if (!unique) popupRef.current = win;
    try { win.document.open(); win.document.write(rankingPopupShellHtml()); win.document.close(); } catch(e){}
  }
  return win;
}

function renderRankingPopupWindow(win, state) {
  if (!win || win.closed) return false;
  try {
    if (!win.document.getElementById('root')) {
      win.document.open(); win.document.write(rankingPopupShellHtml()); win.document.close();
    }
    const root = win.document.getElementById('root');
    const titleEl = win.document.getElementById('title');
    if (root) root.innerHTML = rankingPopupContentHtml(state);
    if (titleEl) titleEl.textContent = state?.title || 'Rangliste';
    win.document.title = (state?.title || 'Rangliste') + ' · Mario Kart World Cup';
    // Ticker starten
    const spd = state?.tickerSpeed || 80;
    if (win._startTicker && state?.ticker?.length) {
      win._startTicker(state.ticker, spd);
    } else {
      setTimeout(() => { if(win._startTicker && state?.ticker?.length) win._startTicker(state.ticker, spd); }, 500);
    }
    return true;
  } catch(e) { return false; }
}


export {
  getTickerTemplates,
  getTickerSpeed,
  buildTickerItems,
  trimPopupRankLabel,
  popupFpSlotLabel,
  resolvePopupEntryDisplay,
  popupCleanText,
  formatPopupPerson,
  resolvePopupConsoleDisplay,
  popupConsoleProgress,
  buildRankingPopupState,
  rankingPopupEntryHtml,
  rankingPopupShellHtml,
  rankingPopupContentHtml,
  ensureRankingPopupWindow,
  renderRankingPopupWindow
};
