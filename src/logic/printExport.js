function escapeHtml(value) {
  if (typeof globalThis.escapeHtml === 'function') return globalThis.escapeHtml(value);
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}
function fpShort(fp) {
  if (typeof globalThis.fpShort === 'function') return globalThis.fpShort(fp);
  return String(fp?.nickname || fp?.firstName || fp?.name || '?').trim() || '?';
}
function fpLines(fp) {
  if (typeof globalThis.fpLines === 'function') return globalThis.fpLines(fp);
  const fullName = [fp?.firstName, fp?.lastName].filter(Boolean).join(' ').trim();
  const nick = String(fp?.nickname || '').trim();
  return [fullName, nick].filter(Boolean);
}
function chunkArray(list, size) {
  if (typeof globalThis.chunkArray === 'function') return globalThis.chunkArray(list, size);
  const safeList = Array.isArray(list) ? list : [];
  const safeSize = Math.max(1, Number(size) || 1);
  const chunks = [];
  for (let index = 0; index < safeList.length; index += safeSize) {
    chunks.push(safeList.slice(index, index + safeSize));
  }
  return chunks;
}

// Stage 2b: aus core.js ausgelagerte Druck-/Exportlogik
function openPdfPrintWindow(title, bodyHtml, opts = {}) {
    var _a, _b, _c;
    const pageMode = opts.pageMode === 'landscape' ? 'landscape' : 'portrait';
    const docType = opts.docType || 'generic';
    const fitOnePage = opts.fitOnePage !== false;
    const marginMm = pageMode === 'landscape' ? 8 : 10;
    const pageW = pageMode === 'landscape' ? 297 : 210;
    const pageH = pageMode === 'landscape' ? 210 : 297;
    const innerW = pageW - (marginMm * 2);
    const innerH = pageH - (marginMm * 2);
    const css = `
    @page{size:A4 ${pageMode};margin:${marginMm}mm}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0}
    body{font-family:Arial,sans-serif;color:#111;background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact}
    .pdf-page{width:${innerW}mm;margin:0 auto}
    .pdf-page.fit-one-page{height:${innerH}mm;overflow:hidden}
    .pdf-fit{transform-origin:top left;width:100%}
    .pdf-wrap{padding:0}
    .pdf-top{display:flex;justify-content:space-between;align-items:flex-end;gap:8px;border-bottom:2px solid #d9d9d9;padding-bottom:6px;margin-bottom:8px}
    .pdf-title{font-size:18px;font-weight:700;line-height:1.1}
    .pdf-sub{font-size:10px;color:#555}
    .pdf-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;align-items:start;margin-bottom:8px}
    .pdf-session{border:1.5px solid #d9ddea;border-radius:8px;overflow:hidden;background:#fafbff;break-inside:avoid;page-break-inside:avoid}
    .pdf-session.empty{visibility:hidden}
    .pdf-session-head{background:linear-gradient(135deg,#f1f3fb,#e4eaf8);padding:6px 8px;border-bottom:1px solid #d9ddea}
    .pdf-session-mode{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;line-height:1.15}
    .pdf-session-round{font-size:9px;color:#666;margin-top:2px}
    .pdf-session-body{padding:6px}
    .pdf-match{border:1.5px solid #cfd5e6;border-radius:7px;background:#fff;overflow:hidden;margin-bottom:6px;break-inside:avoid;page-break-inside:avoid}
    .pdf-match:last-child{margin-bottom:0}
    .pdf-match-head{display:flex;justify-content:space-between;align-items:center;gap:6px;background:linear-gradient(135deg,#d8b24c,#f3de95);padding:4px 7px;border-bottom:1px solid #c59a28}
    .pdf-match-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#1d1a10;line-height:1.15}
    .pdf-match-track{font-size:10px;font-weight:700;color:#1d1a10;text-align:right;line-height:1.15}
    .pdf-match-body{padding:5px 7px}
    .pdf-players{display:flex;flex-direction:column;gap:3px}
    .pdf-players.two-col{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px}
    .pdf-team{border-bottom:1px solid #eceff6;padding-bottom:3px;margin-bottom:3px}
    .pdf-team:last-child{border-bottom:none;padding-bottom:0;margin-bottom:0}
    .pdf-team-title{font-size:9px;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:2px}
    .pdf-player{display:flex;flex-direction:column;gap:1px;padding:1px 0}
    .pdf-player-main{font-size:10px;font-weight:700;line-height:1.15}
    .pdf-player-sub{font-size:8px;color:#666;line-height:1.15}
    .pdf-rules{display:flex;flex-direction:column;gap:8px}
    .pdf-rule{border:1.5px solid #d9ddea;border-radius:8px;padding:8px 10px;break-inside:avoid;page-break-inside:avoid}
    .pdf-rule-title{font-size:12px;font-weight:700;margin-bottom:4px;line-height:1.2}
    .pdf-rule-text{font-size:10px;line-height:1.35}
    .pdf-rule-detail{font-size:9px;line-height:1.35;color:#555;margin-top:4px}
    body.schedule .pdf-title{font-size:16px}
    body.schedule .pdf-sub{font-size:9px}
    body.schedule .pdf-top{margin-bottom:6px;padding-bottom:5px}
    body.schedule .pdf-grid{gap:6px;margin-bottom:6px}
    body.schedule .pdf-session-head{padding:5px 7px}
    body.schedule .pdf-session-mode{font-size:9px}
    body.schedule .pdf-session-round{font-size:8px}
    body.schedule .pdf-session-body{padding:5px}
    body.schedule .pdf-match{margin-bottom:5px}
    body.schedule .pdf-match-head{padding:4px 6px}
    body.schedule .pdf-match-title{font-size:8px}
    body.schedule .pdf-match-track{font-size:9px}
    body.schedule .pdf-match-body{padding:4px 6px}
    body.schedule .pdf-players{gap:2px}
    body.schedule .pdf-players.two-col{gap:3px 7px}
    body.schedule .pdf-team-title{font-size:8px}
    body.schedule .pdf-player-main{font-size:9px}
    body.schedule .pdf-player-sub{font-size:7.5px}
    body.rules .pdf-title{font-size:17px}
    body.rules .pdf-rule-title{font-size:11px}
    body.rules .pdf-rule-text{font-size:9.5px}
    body.rules .pdf-rule-detail{font-size:8.5px}
  `;
    const script = `<script>
    window.__pdfReady=false;
    function fitPdfToA4(){
      try{
        const page=document.querySelector('.pdf-page');
        const fit=document.querySelector('.pdf-fit');
        if(!page||!fit){window.__pdfReady=true;return;}
        if(page.classList.contains('fit-one-page')){
          fit.style.transform='scale(1)';
          const pageW=page.clientWidth;
          const pageH=page.clientHeight;
          const naturalW=Math.max(fit.scrollWidth,fit.getBoundingClientRect().width);
          const naturalH=Math.max(fit.scrollHeight,fit.getBoundingClientRect().height);
          const scale=Math.min(pageW/naturalW,pageH/naturalH,1);
          fit.style.transform='scale('+scale+')';
          fit.style.width=(100/scale)+'%';
        }
      }catch(err){
        console.error(err);
      }finally{
        window.__pdfReady=true;
      }
    }
    window.addEventListener('load',()=>setTimeout(fitPdfToA4,80));
  <\/script>`;
    const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"/><title>${escapeHtml(title)}</title><style>${css}</style></head><body class="pdf-doc ${escapeHtml(docType)}"><div class="pdf-page ${fitOnePage ? 'fit-one-page' : ''}"><div class="pdf-fit"><div class="pdf-wrap">${bodyHtml}</div></div></div>${script}</body></html>`;
    const oldFrame = document.getElementById('pdf-print-frame');
    if (oldFrame)
        oldFrame.remove();
    const iframe = document.createElement('iframe');
    iframe.id = 'pdf-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);
    const doc = (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document;
    if (!doc) {
        alert('Die Druckansicht konnte nicht geöffnet werden.');
        iframe.remove();
        return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    const doPrint = () => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
        catch (err) {
            console.error(err);
            alert('Die Druckansicht konnte nicht gestartet werden.');
        }
        finally {
            setTimeout(() => iframe.remove(), 1500);
        }
    };
    const waitForPdf = () => {
        let tries = 0;
        const tick = () => {
            var _a;
            tries++;
            if (((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.__pdfReady) || tries > 60) {
                setTimeout(doPrint, 120);
            }
            else {
                setTimeout(tick, 50);
            }
        };
        tick();
    };
    if (((_c = (_b = iframe.contentWindow) === null || _b === void 0 ? void 0 : _b.document) === null || _c === void 0 ? void 0 : _c.readyState) === 'complete') {
        setTimeout(waitForPdf, 120);
    }
    else {
        iframe.onload = () => setTimeout(waitForPdf, 120);
    }
}
function buildPdfPlayerHtml(fp) {
    const lines = (fp ? fpLines(fp) : []).map(line => `<div class="pdf-player-sub">${escapeHtml(line)}</div>`).join('');
    return `<div class="pdf-player"><div class="pdf-player-main">${escapeHtml(fp ? fpShort(fp) : '?')}</div>${lines}</div>`;
}
function buildPdfMatchHtml(group, idx, fps, includeTracks) {
    const fpMap = Object.fromEntries((fps || []).map(f => [f.id, f]));
    const headTrack = includeTracks && (group === null || group === void 0 ? void 0 : group.track) ? `<div class="pdf-match-track">${escapeHtml(group.track)}</div>` : '';
    if (group === null || group === void 0 ? void 0 : group.teamMode) {
        const size = group.teamSize || 1;
        const teams = Array.from({ length: Math.ceil((group.fps || []).length / size) }, (_, ti) => (group.fps || []).slice(ti * size, (ti + 1) * size));
        return `<div class="pdf-match">
      <div class="pdf-match-head"><div class="pdf-match-title">Match ${idx + 1}</div>${headTrack}</div>
      <div class="pdf-match-body">
        ${teams.map((team, ti) => `<div class="pdf-team"><div class="pdf-team-title">Team ${ti + 1}</div>${team.map(fid => buildPdfPlayerHtml(fpMap[fid])).join('')}</div>`).join('')}
      </div>
    </div>`;
    }
    const players = ((group === null || group === void 0 ? void 0 : group.fps) || []).map(fid => fpMap[fid]).filter(Boolean);
    const listClass = players.length > 12 ? 'pdf-players two-col' : 'pdf-players';
    return `<div class="pdf-match">
    <div class="pdf-match-head"><div class="pdf-match-title">Match ${idx + 1}</div>${headTrack}</div>
    <div class="pdf-match-body"><div class="${listClass}">${players.map(fp => buildPdfPlayerHtml(fp)).join('')}</div></div>
  </div>`;
}
function exportSchedulePdf({ sessions, fps, consoleName, consoleEmoji, includeTracks }) {
    if (!sessions || !sessions.length) {
        alert('Für diese Konsole ist noch kein Spielplan vorhanden.');
        return;
    }
    const rows = chunkArray(sessions, 3);
    const body = `
    <div class="pdf-top">
      <div>
        <div class="pdf-title">${escapeHtml(`${consoleEmoji || ''} ${consoleName || 'Spielplan'}`.trim())}</div>
        <div class="pdf-sub">Spielplan · ${includeTracks ? 'mit Streckenangabe' : 'ohne Streckenangabe'}</div>
      </div>
      <div class="pdf-sub">${escapeHtml(new Date().toLocaleString('de-DE'))}</div>
    </div>
    ${rows.map(row => `<div class="pdf-grid">
      ${row.map(sess => `<div class="pdf-session">
        <div class="pdf-session-head">
          <div class="pdf-session-mode">${escapeHtml(sess.modeName || 'Modus')}</div>
          <div class="pdf-session-round">Runde ${escapeHtml(sess.round)}${sess.totalRounds > 1 ? ` / ${escapeHtml(sess.totalRounds)}` : ''}</div>
        </div>
        <div class="pdf-session-body">
          ${(sess.groups || []).map((group, idx) => buildPdfMatchHtml(group, idx, fps, includeTracks)).join('')}
        </div>
      </div>`).join('')}
      ${Array.from({ length: 3 - row.length }).map(() => `<div class="pdf-session empty"></div>`).join('')}
    </div>`).join('')}
  `;
    openPdfPrintWindow(`${consoleName || 'Spielplan'} PDF`, body, { pageMode: 'landscape', fitOnePage: true, docType: 'schedule' });
}
function exportRulesPdf(rules) {
    const safeRules = (rules || []).filter(rule => (rule.title || rule.text || rule.detail));
    if (!safeRules.length) {
        alert('Es sind noch keine Spielregeln angelegt.');
        return;
    }
    const body = `
    <div class="pdf-top">
      <div>
        <div class="pdf-title">Spielregeln</div>
        <div class="pdf-sub">Druckansicht / PDF</div>
      </div>
      <div class="pdf-sub">${escapeHtml(new Date().toLocaleString('de-DE'))}</div>
    </div>
    <div class="pdf-rules">
      ${safeRules.map((rule, idx) => `<div class="pdf-rule">
        <div class="pdf-rule-title">${escapeHtml(rule.title || `Regel ${idx + 1}`)}</div>
        ${rule.text ? `<div class="pdf-rule-text">${escapeHtml(rule.text)}</div>` : ''}
        ${rule.detail ? `<div class="pdf-rule-detail">${escapeHtml(rule.detail)}</div>` : ''}
      </div>`).join('')}
    </div>
  `;
    openPdfPrintWindow('Spielregeln PDF', body, { pageMode: 'portrait', fitOnePage: true, docType: 'rules' });
}
// Pick a random enabled track for a given console+mode type


export {
  openPdfPrintWindow,
  buildPdfPlayerHtml,
  buildPdfMatchHtml,
  exportSchedulePdf,
  exportRulesPdf
};
