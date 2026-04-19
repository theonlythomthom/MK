import React from 'react';
import MatchHeader from './components/MatchHeader.jsx';
import CompactPlacementCard from './components/CompactPlacementCard.jsx';
import ScheduleSessionCard from './components/ScheduleSessionCard.jsx';

const { useState, useEffect, useMemo, useRef } = React;

function TeilnehmerTab({ fps, setFps, playerDb }) {
    const allTeams = useMemo(() => [...new Set(fps.map(f => f.teamName).filter(Boolean))], [fps]);
    const soloCount = useMemo(() => fps.filter(f => !String((f === null || f === void 0 ? void 0 : f.teamName) || '').trim()).length, [fps]);
    const dbPlayers = (playerDb === null || playerDb === void 0 ? void 0 : playerDb.players) || [];
    const playerOptions = useMemo(() => dbPlayers
        .map(p => ({ id: String(p.id), label: fullPlayerName(p), nickname: (p.nickname || '').trim() }))
        .filter(p => p.label)
        .sort((a, b) => pSort(a.label, b.label)), [dbPlayers]);
    const takenPlayerIds = useMemo(() => new Set(fps
        .flatMap(f => ((f === null || f === void 0 ? void 0 : f.players) || []).map(pl => String((pl === null || pl === void 0 ? void 0 : pl.dbPlayerId) || '').trim()))
        .filter(Boolean)), [fps]);
    function pSort(a, b) { return a.localeCompare(b, 'de'); }
    const add = () => {
        const nid = Math.max(0, ...fps.map(f => f.id)) + 1;
        setFps(p => [...p, { id: nid, teamName: '', players: [normalizeFpPlayer({ name: '', nickname: '', dbPlayerId: '' }, nid)] }]);
    };
    const rem = id => setFps(p => p.filter(f => f.id !== id));
    const upd = (id, field, val) => setFps(p => p.map(f => f.id === id ? { ...f, [field]: val } : f));
    const addPl = id => setFps(p => p.map(f => f.id === id && f.players.length < 3 ? { ...f, players: [...f.players, normalizeFpPlayer({ name: '', nickname: '', dbPlayerId: '' }, f.players.length + 1)] } : f));
    const remPl = (fid, pi) => setFps(p => p.map(f => f.id === fid ? { ...f, players: f.players.filter((_, i) => i !== pi) } : f));
    const setPlayerFromDb = (fid, pi, playerId) => {
        const pid = String(playerId || '').trim();
        setFps(prev => prev.map(f => {
            if (f.id !== fid)
                return f;
            return {
                ...f,
                players: f.players.map((pl, i) => {
                    if (i !== pi)
                        return pl;
                    if (!pid)
                        return normalizeFpPlayer({ ...pl, dbPlayerId: '', name: '', nickname: '' }, pi + 1);
                    const record = dbPlayers.find(p => String(p.id) === pid);
                    return record ? applyPlayerRecordToSlot(record, pl) : normalizeFpPlayer({ ...pl, dbPlayerId: '', name: '', nickname: '' }, pi + 1);
                })
            };
        }));
    };
    return (React.createElement("div", null,
        React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, "\uD83C\uDFCE Fahrerpl\u00E4tze"),
                React.createElement("div", { className: "flex g2 fca" },
                    React.createElement("span", { className: "chip" },
                        fps.length,
                        " Pl\u00E4tze \u00B7 ",
                        fps.reduce((s, f) => s + f.players.length, 0),
                        " Fahrer"),
                    React.createElement("span", { className: "chip chip-b" },
                        allTeams.length,
                        " Team"),
                    React.createElement("span", { className: "chip chip-s" },
                        soloCount,
                        " Solo"),
                    React.createElement("button", { className: "btn bp", onClick: add }, "+ Platz"))),
            !playerOptions.length && (React.createElement("div", { className: "alert", style: { marginTop: 10 } },
                React.createElement("span", null, "\u26A0\uFE0F"),
                React.createElement("div", null,
                    "Lege zuerst unter ",
                    React.createElement("strong", null, "Zahnrad \u2192 Spielerdaten"),
                    " mindestens eine Person an. Erst danach kannst du Fahrerpl\u00E4tze ausw\u00E4hlen."))),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 8 } }, fps.map((fp, fi) => {
                const col = fp.teamName ? tc(fp.teamName, allTeams) : null;
                return (React.createElement("div", { key: fp.id, className: "fpc", style: { margin: 0, ...(col ? { borderColor: `${col}60` } : {}) } },
                    React.createElement("div", { className: "fpch", style: { background: '#f5f5fa', borderBottom: '1px solid var(--bord)' } },
                        React.createElement("span", { style: { fontFamily: 'var(--fd)', fontWeight: 700, color: 'var(--dk)', fontSize: 11, minWidth: 22 } },
                            "#",
                            fi + 1),
                        React.createElement("div", { style: { flex: 1, position: 'relative' } },
                            React.createElement("input", { type: "text", value: fp.teamName, onChange: e => upd(fp.id, 'teamName', e.target.value), placeholder: "Teamname (optional)", list: `tl${fp.id}`, style: { borderColor: col || 'var(--bord2)', color: col || 'var(--dk)', fontWeight: 700, background: '#fff', borderRadius: 5 } }),
                            React.createElement("datalist", { id: `tl${fp.id}` }, allTeams.map(t => React.createElement("option", { key: t, value: t })))),
                        React.createElement("button", { className: "bic", onClick: () => rem(fp.id) }, "\u2715")),
                    React.createElement("div", { className: "fpcb" },
                        fp.players.map((p, pi) => {
                            const currentPlayerId = String(p.dbPlayerId || '').trim();
                            const linkedOpt = playerOptions.find(opt => String(opt.id) === currentPlayerId);
                            const availablePlayerOptions = playerOptions.filter(opt => String(opt.id) === currentPlayerId || !takenPlayerIds.has(String(opt.id)));
                            const shownName = shortNameLabel((linkedOpt === null || linkedOpt === void 0 ? void 0 : linkedOpt.label) || p.name || '', 25);
                            const shownNick = shortNameLabel((linkedOpt === null || linkedOpt === void 0 ? void 0 : linkedOpt.nickname) || p.nickname || '', 16);
                            return (React.createElement("div", { key: pi, className: "fp-row", style: { alignItems: 'stretch' } },
                                React.createElement("span", { className: "fp-sub", style: { paddingTop: 8 } }, fp.players.length > 1 ? `Fahrer ${pi + 1}` : 'Fahrer'),
                                React.createElement("div", { style: { flex: 1, display: 'grid', gridTemplateColumns: shownNick ? 'minmax(25ch,1fr) minmax(0,150px)' : 'minmax(25ch,1fr)', gap: 6, alignItems: 'center' } },
                                    React.createElement("div", { className: "fp-select-wrap" },
                                        React.createElement("select", { className: "fp-select", value: currentPlayerId, onChange: e => setPlayerFromDb(fp.id, pi, e.target.value), title: linkedOpt?.label || shownName || '', style: { width: '100%', minWidth: '25ch', maxWidth: '100%' } },
                                            React.createElement("option", { value: "" }, availablePlayerOptions.length ? 'Bitte Person auswählen' : 'Keine freien Personen mehr'),
                                            availablePlayerOptions.map(opt => React.createElement("option", { key: opt.id, value: opt.id, title: opt.label }, opt.label)))),
                                    String(p.dbPlayerId || '').trim() && shownNick && (React.createElement("div", { style: { padding: '6px 10px', borderRadius: 8, border: '1px solid #f2d47b', background: '#fff8d8', color: '#7a5a00', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' } }, shownNick))),
                                fp.players.length > 1 ? React.createElement("button", { className: "bic", onClick: () => remPl(fp.id, pi), style: { alignSelf: 'center' } }, "\u2715") : React.createElement("div", { style: { width: 28 } })));
                        }),
                        fp.players.length < 3 && React.createElement("button", { className: "btn bs bsm mt1", onClick: () => addPl(fp.id) }, "+ Fahrer"))));
            })),
            fps.length === 0 && React.createElement("div", { style: { textAlign: 'center', padding: 28, color: 'var(--muted)', fontSize: 13 } }, "Noch keine Fahrerpl\u00E4tze."))));
}
// ── Konsolen
// ── Konsolen ───────────────────────────────────────────────────────────────
function KonsolenTab({ consoles, setConsoles }) {
    const [editModal, setEditModal] = useState(null); // {cid,mid,mode} | null
    const [renameConsoleModal, setRenameConsoleModal] = useState(null); // {id,name}
    const [addMode, setAddMode] = useState(null); // cid or null
    const [newMode, setNewMode] = useState({ name: '', desc: '', sf: '4ffa', rounds: 1, attempts: 1, trackDrawMode: 'track', scoringMode: 'individual', points: [5, 3, 1, 0] });
    const [addCon, setAddCon] = useState(false);
    const [newCon, setNewCon] = useState({ id: '', name: '', game: '', emoji: '🎮' });
    const modeFmt = (mode) => getModeFormatMeta(mode) || { pc: Array.isArray(mode === null || mode === void 0 ? void 0 : mode.points) ? mode.points.length : 0, team: false, ts: 1, teamCount: 1 };
    const modeScoringMode = (mode) => getModeScoringMode(mode, modeFmt(mode));
    const modePointSlotCount = (mode) => getModePointSlotCount(mode, modeFmt(mode), modeScoringMode(mode));
    const normalizeModeForUi = (mode) => {
        const fmt = modeFmt(mode);
        const scoringMode = modeScoringMode(mode);
        return { ...mode, scoringMode, points: normalizeModePoints(mode, mode.points, fmt, scoringMode) };
    };
    const updateModeWith = (cid, mid, mapper) => setConsoles(p => p.map(c => c.id === cid ? { ...c, modes: c.modes.map(m => m.id === mid ? normalizeModeForUi(mapper(normalizeModeForUi(m))) : m) } : c));
    const togC = id => setConsoles(p => p.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    const togM = (cid, mid) => setConsoles(p => p.map(c => c.id === cid ? { ...c, modes: c.modes.map(m => m.id === mid ? { ...m, enabled: !m.enabled } : m) } : c));
    const setR = (cid, mid, v) => updateModeWith(cid, mid, m => ({ ...m, rounds: Math.max(1, Math.min(10, parseInt(v) || 1)) }));
    const setFmt = (cid, mid, fid) => updateModeWith(cid, mid, m => ({ ...m, sf: fid }));
    const setScoringMode = (cid, mid, value) => updateModeWith(cid, mid, m => ({ ...m, scoringMode: value }));
    const setDrawMode = (cid, mid, val) => updateModeWith(cid, mid, m => ({ ...m, trackDrawMode: val }));
    const setPt = (cid, mid, i, v) => updateModeWith(cid, mid, m => ({ ...m, points: m.points.map((pt, pi) => pi === i ? Math.max(0, parseInt(v) || 0) : pt) }));
    const setAttempts = (cid, mid, v) => updateModeWith(cid, mid, m => ({ ...m, attempts: typeof normalizeAttemptCount === 'function' ? normalizeAttemptCount(v) : Math.max(1, parseInt(v, 10) || 1) }));
    const delM = (cid, mid) => { if (!confirm('Modus löschen?'))
        return; setConsoles(p => p.map(c => c.id === cid ? { ...c, modes: c.modes.filter(m => m.id !== mid) } : c)); };
    const delC = id => { if (!confirm('Konsole löschen?'))
        return; setConsoles(p => p.filter(c => c.id !== id)); };
    const updM = (cid, mid, field, val) => updateModeWith(cid, mid, m => ({ ...m, [field]: val }));
    const updC = (id, field, val) => setConsoles(p => p.map(c => c.id === id ? { ...c, [field]: val } : c));
    const doAddMode = (cid) => {
        if (!newMode.name.trim())
            return;
        const mid = cid + '_' + Date.now();
        const draft = normalizeModeForUi({ id: mid, name: newMode.name, desc: newMode.desc, af: Object.keys(FMT), sf: newMode.sf, rounds: parseInt(newMode.rounds) || 1, attempts: typeof normalizeAttemptCount === 'function' ? normalizeAttemptCount(newMode.attempts) : Math.max(1, parseInt(newMode.attempts, 10) || 1), trackDrawMode: newMode.trackDrawMode || 'track', scoringMode: newMode.scoringMode || 'individual', enabled: true, points: newMode.points });
        setConsoles(p => p.map(c => c.id === cid ? { ...c, modes: [...c.modes, draft] } : c));
        setAddMode(null);
        setNewMode({ name: '', desc: '', sf: '4ffa', rounds: 1, attempts: 1, trackDrawMode: 'track', scoringMode: 'individual', points: [5, 3, 1, 0] });
    };
    const doAddCon = () => {
        if (!newCon.id.trim() || !newCon.name.trim())
            return;
        setConsoles(p => [...p, { id: newCon.id.toLowerCase().replace(/\s/g, '_'), name: newCon.name, game: newCon.game, emoji: newCon.emoji, enabled: true, modes: [] }]);
        setAddCon(false);
        setNewCon({ id: '', name: '', game: '', emoji: '🎮' });
    };
    const sorted = [...consoles].sort((a, b) => (CONSOLE_YEARS[a.id] || 9999) - (CONSOLE_YEARS[b.id] || 9999));
    const lbl = { fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 };
    return (React.createElement("div", null,
        sorted.map(con => (React.createElement("div", { key: con.id, className: `conc${con.enabled ? ' on' : ''}` },
            React.createElement("div", { className: "conh", onClick: () => togC(con.id) },
                React.createElement("div", { className: "cont" },
                    React.createElement("span", { style: { fontSize: 20 } }, con.emoji),
                    React.createElement("div", null,
                        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                            React.createElement("span", null, con.name),
                            React.createElement("button", { className: "bic", style: { fontSize: 10, padding: '1px 6px' }, onClick: e => { e.stopPropagation(); setRenameConsoleModal({ id: con.id, name: con.name }); } }, "\u270E"),
                            React.createElement("button", { className: "bic", style: { fontSize: 10, padding: '1px 6px', color: 'var(--red)' }, onClick: e => { e.stopPropagation(); delC(con.id); } }, "\u2715")),
                        React.createElement("div", { className: "cong" }, con.game))),
                React.createElement("div", { className: "flex g2 fca" },
                    con.enabled && React.createElement("span", { className: "chip chip-r", style: { fontSize: 9 } },
                        con.modes.filter(m => m.enabled).length,
                        "/",
                        con.modes.length,
                        " Modi"),
                    React.createElement("button", { className: `tog${con.enabled ? ' on' : ''}`, onClick: e => { e.stopPropagation(); togC(con.id); } }))),
            con.enabled && (React.createElement("div", { style: { padding: '0 0 8px' } },
                con.modes.map(mode => {
                    var _a;
                    const normalizedMode = normalizeModeForUi(mode);
                    const fmt = modeFmt(normalizedMode);
                    const scoringMode = modeScoringMode(normalizedMode);
                    const pointSlotCount = modePointSlotCount(normalizedMode);
                    const solo = normalizedMode.af.length === 1;
                    const drawModeVal = normalizedMode.trackDrawMode || inferTrackDrawMode(normalizedMode.name, normalizedMode.id);
                    const allowedDrawModes = Array.isArray(normalizedMode.drawModes) && normalizedMode.drawModes.length ? normalizedMode.drawModes : [drawModeVal];
                    const allowedScoringModes = fmt.team
                        ? (Array.isArray(normalizedMode.scoringModes) && normalizedMode.scoringModes.length ? normalizedMode.scoringModes : ['individual', 'team']).filter(v => v === 'individual' || v === 'team')
                        : ['individual'];
                    const isTimeTrial = typeof isTimeTrialMode === 'function' ? isTimeTrialMode(normalizedMode) : false;
                    const modeAttempts = typeof normalizeAttemptCount === 'function' ? normalizeAttemptCount(normalizedMode.attempts) : Math.max(1, parseInt(normalizedMode.attempts, 10) || 1);
                    return (React.createElement("div", { key: normalizedMode.id, style: { borderBottom: '1.5px solid #d9ddea', padding: '10px 16px' } },
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: `auto 1fr auto ${fmt.team ? 'auto ' : ''}auto auto ${isTimeTrial ? 'auto ' : ''}auto`, gap: 12, alignItems: 'start' } },
                            React.createElement("button", { className: `tog${normalizedMode.enabled ? ' on' : ''}`, onClick: () => togM(con.id, normalizedMode.id), style: { marginTop: 3 } }),
                            React.createElement("div", null,
                                React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: 'var(--dk)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                    normalizedMode.name,
                                    fmt.team && React.createElement("span", { className: "chip chip-b", style: { fontSize: 8 } },
                                        "TEAM ",
                                        fmt.ts,
                                        "v",
                                        fmt.ts),
                                    fmt.team && React.createElement("span", { className: "chip", style: { fontSize: 8 } }, scoringMode === 'team' ? 'TEAMWERTUNG' : 'EINZELWERTUNG'),
                                    isTimeTrial && React.createElement("span", { className: "chip chip-r", style: { fontSize: 8 } }, "ZEIT")),
                                React.createElement("div", { style: { fontSize: 12, color: 'var(--muted)', marginTop: 2 } }, normalizedMode.desc)),
                            normalizedMode.enabled && React.createElement("div", { style: { textAlign: 'center' } },
                                React.createElement("div", { style: lbl }, "Format"),
                                solo ? React.createElement("span", { className: "chip", style: { fontSize: 10 } }, ((_a = FMT[normalizedMode.sf]) === null || _a === void 0 ? void 0 : _a.label) || normalizedMode.sf)
                                    : React.createElement("select", { value: normalizedMode.sf, onChange: e => setFmt(con.id, normalizedMode.id, e.target.value), style: { width: 120, fontSize: 12, padding: '5px 6px' } }, normalizedMode.af.map(f => { var _a; return React.createElement("option", { key: f, value: f }, ((_a = FMT[f]) === null || _a === void 0 ? void 0 : _a.label) || f); }))),
                            normalizedMode.enabled && fmt.team && React.createElement("div", { style: { textAlign: 'center' } },
                                React.createElement("div", { style: lbl }, "Wertung"),
                                allowedScoringModes.length <= 1
                                    ? React.createElement("span", { className: "chip", style: { fontSize: 10 } }, allowedScoringModes[0] === 'team' ? 'Nur Team-Platz' : 'Jeder Fahrer einzeln')
                                    : React.createElement("select", { value: scoringMode, onChange: e => setScoringMode(con.id, normalizedMode.id, e.target.value), style: { width: 138, fontSize: 12, padding: '5px 6px' } },
                                        allowedScoringModes.includes('individual') && React.createElement("option", { value: "individual" }, "Jeder Fahrer einzeln"),
                                        allowedScoringModes.includes('team') && React.createElement("option", { value: "team" }, "Nur Team-Platz"))),
                            normalizedMode.enabled && React.createElement("div", { style: { textAlign: 'center' } },
                                React.createElement("div", { style: lbl }, "Losung"),
                                allowedDrawModes.length <= 1
                                    ? React.createElement("span", { className: "chip", style: { fontSize: 10 } }, DRAW_MODES[allowedDrawModes[0]] || allowedDrawModes[0])
                                    : React.createElement("select", { value: drawModeVal, onChange: e => setDrawMode(con.id, normalizedMode.id, e.target.value), style: { width: 132, fontSize: 12, padding: '5px 6px' } },
                                        allowedDrawModes.map(drawId => React.createElement("option", { key: drawId, value: drawId }, DRAW_MODES[drawId] || drawId)))),
                            normalizedMode.enabled && React.createElement("div", { style: { textAlign: 'center' } },
                                React.createElement("div", { style: lbl }, "Runden"),
                                React.createElement("input", { type: "number", inputMode: "numeric", autoComplete: "off", spellCheck: false, value: normalizedMode.rounds, min: "1", max: "10", onChange: e => setR(con.id, normalizedMode.id, e.target.value), "aria-label": `${normalizedMode.name} Runden`, style: { width: 52, textAlign: 'center', padding: '5px' } })),
                            normalizedMode.enabled && isTimeTrial && React.createElement("div", { style: { textAlign: 'center' } },
                                React.createElement("div", { style: lbl }, "Versuche"),
                                React.createElement("input", { type: "number", inputMode: "numeric", autoComplete: "off", spellCheck: false, value: modeAttempts, min: "1", max: "10", onChange: e => setAttempts(con.id, normalizedMode.id, e.target.value), "aria-label": `${normalizedMode.name} Versuche`, style: { width: 62, textAlign: 'center', padding: '5px' } })),
                            React.createElement("div", { style: { display: 'flex', gap: 4, alignItems: 'center', marginTop: 3 } },
                                React.createElement("button", { className: "bic", style: { fontSize: 10, padding: '2px 7px' }, title: "Bearbeiten", onClick: () => setEditModal({ cid: con.id, mid: normalizedMode.id, mode: { ...normalizedMode } }) }, "✎"),
                                React.createElement("button", { className: "bic", style: { fontSize: 10, padding: '2px 7px', color: 'var(--red)' }, title: "Löschen", onClick: () => delM(con.id, normalizedMode.id) }, "✕"))),
                        normalizedMode.enabled && (React.createElement("div", { style: { marginTop: 8, paddingLeft: 32, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                            React.createElement("div", { style: lbl }, `Punkte (${pointSlotCount} Felder):`),
                            normalizedMode.points.map((pt, i) => (React.createElement("div", { key: i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 } },
                                React.createElement("span", { style: { fontSize: 8, color: 'var(--muted)', fontFamily: 'var(--fd)' } },
                                    i + 1,
                                    "."),
                                React.createElement("input", { type: "number", inputMode: "numeric", autoComplete: "off", spellCheck: false, value: pt, min: "0", max: "999", onChange: e => setPt(con.id, normalizedMode.id, i, e.target.value), "aria-label": `${normalizedMode.name} Punkte Platz ${i + 1}`, style: { width: 50, textAlign: 'center', fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 13, padding: '4px 2px' } }))))))));
                }),
                addMode === con.id
                    ? React.createElement("div", { style: { padding: '12px 16px', background: 'var(--card2)', borderTop: '1px solid var(--bord)' } },
                        React.createElement("div", { style: { fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 11, marginBottom: 10, color: 'var(--dk)' } }, "Neuer Modus"),
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 } },
                            React.createElement("div", null,
                                React.createElement("div", { style: lbl }, "Name"),
                                React.createElement("input", { type: "text", value: newMode.name, onChange: e => setNewMode(p => ({ ...p, name: e.target.value })), placeholder: "Modus-Name" })),
                            React.createElement("div", null,
                                React.createElement("div", { style: lbl }, "Beschreibung"),
                                React.createElement("input", { type: "text", value: newMode.desc, onChange: e => setNewMode(p => ({ ...p, desc: e.target.value })), placeholder: "Kurze Beschreibung" })),
                            React.createElement("div", null,
                                React.createElement("div", { style: lbl }, "Format"),
                                React.createElement("select", { value: newMode.sf, onChange: e => setNewMode(p => normalizeModeForUi({ ...p, sf: e.target.value })) }, Object.entries(FMT).map(([k, v]) => React.createElement("option", { key: k, value: k }, v.label)))),
                            (modeFmt(newMode).team) && React.createElement("div", null,
                                React.createElement("div", { style: lbl }, "Wertung"),
                                React.createElement("select", { value: modeScoringMode(newMode), onChange: e => setNewMode(p => normalizeModeForUi({ ...p, scoringMode: e.target.value })) },
                                    React.createElement("option", { value: "individual" }, "Jeder Fahrer einzeln"),
                                    React.createElement("option", { value: "team" }, "Nur Team-Platz"))),
                            React.createElement("div", null,
                                React.createElement("div", { style: lbl }, "Losung"),
                                React.createElement("select", { value: newMode.trackDrawMode, onChange: e => setNewMode(p => ({ ...p, trackDrawMode: e.target.value })) },
                                    React.createElement("option", { value: "track" }, DRAW_MODES.track),
                                    React.createElement("option", { value: "cup" }, DRAW_MODES.cup),
                                    React.createElement("option", { value: "route" }, DRAW_MODES.route))),
                            React.createElement("div", null,
                                React.createElement("div", { style: lbl }, "Runden"),
                                React.createElement("input", { type: "number", min: "1", max: "10", value: newMode.rounds, onChange: e => setNewMode(p => ({ ...p, rounds: e.target.value })) })),
                            React.createElement("div", null,
                                React.createElement("div", { style: lbl }, "Versuche (Zeitfahren)"),
                                React.createElement("input", { type: "number", min: "1", max: "10", value: newMode.attempts, onChange: e => setNewMode(p => ({ ...p, attempts: e.target.value })) }))),
                        React.createElement("div", { style: { display: 'flex', gap: 8 } },
                            React.createElement("button", { className: "btn bp bsm", onClick: () => doAddMode(con.id) }, "+ Hinzuf\u00FCgen"),
                            React.createElement("button", { className: "btn bs bsm", onClick: () => setAddMode(null) }, "Abbrechen")))
                    : React.createElement("div", { style: { padding: '8px 16px' } },
                        React.createElement("button", { className: "btn bs bsm", onClick: () => setAddMode(con.id) }, "+ Modus hinzuf\u00FCgen"))))))),
        addCon
            ? React.createElement("div", { className: "card", style: { marginTop: 12 } },
                React.createElement("div", { className: "card-hdr" },
                    React.createElement("span", { className: "ctitle" }, "Neue Konsole")),
                React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 } },
                    React.createElement("div", null,
                        React.createElement("div", { style: lbl }, "ID (z.B. \"gb\")"),
                        React.createElement("input", { type: "text", value: newCon.id, onChange: e => setNewCon(p => ({ ...p, id: e.target.value })), placeholder: "kurze ID" })),
                    React.createElement("div", null,
                        React.createElement("div", { style: lbl }, "Name"),
                        React.createElement("input", { type: "text", value: newCon.name, onChange: e => setNewCon(p => ({ ...p, name: e.target.value })), placeholder: "Konsolenname" })),
                    React.createElement("div", null,
                        React.createElement("div", { style: lbl }, "Spiel (Jahr)"),
                        React.createElement("input", { type: "text", value: newCon.game, onChange: e => setNewCon(p => ({ ...p, game: e.target.value })), placeholder: "Mario Kart XY (20XX)" })),
                    React.createElement("div", null,
                        React.createElement("div", { style: lbl }, "Emoji"),
                        React.createElement("input", { type: "text", value: newCon.emoji, onChange: e => setNewCon(p => ({ ...p, emoji: e.target.value })), style: { width: 80 } }))),
                React.createElement("div", { style: { display: 'flex', gap: 8 } },
                    React.createElement("button", { className: "btn bp", onClick: doAddCon }, "+ Konsole hinzuf\u00FCgen"),
                    React.createElement("button", { className: "btn bs", onClick: () => setAddCon(false) }, "Abbrechen")))
            : React.createElement("button", { className: "btn bp", style: { marginTop: 12 }, onClick: () => setAddCon(true) }, "+ Konsole hinzuf\u00FCgen"),
        editModal && React.createElement(Modal, { title: `✎ Modus bearbeiten: ${editModal.mode.name}`, confirmLabel: "Speichern", onCancel: () => setEditModal(null), onConfirm: () => { const normalizedDraft = normalizeModeForUi(editModal.mode); updateModeWith(editModal.cid, editModal.mid, () => ({ ...normalizedDraft })); setEditModal(null); }, maxWidth: 620 },
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Name"),
                    React.createElement("input", { type: "text", value: editModal.mode.name, onChange: e => setEditModal(m => ({ ...m, mode: { ...m.mode, name: e.target.value } })), style: { marginTop: 4 } })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Beschreibung"),
                    React.createElement("input", { type: "text", value: editModal.mode.desc, onChange: e => setEditModal(m => ({ ...m, mode: { ...m.mode, desc: e.target.value } })), style: { marginTop: 4 } })),
                React.createElement("div", { style: { display: 'grid', gridTemplateColumns: modeFmt(editModal.mode).team ? '1fr 1fr 1fr 1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 10 } },
                    React.createElement("div", null,
                        React.createElement("div", { className: "fp-player-label" }, "Format"),
                        React.createElement("select", { value: editModal.mode.sf, onChange: e => setEditModal(m => ({ ...m, mode: normalizeModeForUi({ ...m.mode, sf: e.target.value }) })), style: { marginTop: 4 } }, Object.entries(FMT).map(([k, v]) => React.createElement("option", { key: k, value: k }, v.label)))),
                    modeFmt(editModal.mode).team && React.createElement("div", null,
                        React.createElement("div", { className: "fp-player-label" }, "Wertung"),
                        React.createElement("select", { value: modeScoringMode(editModal.mode), onChange: e => setEditModal(m => ({ ...m, mode: normalizeModeForUi({ ...m.mode, scoringMode: e.target.value }) })), style: { marginTop: 4 } },
                            React.createElement("option", { value: "individual" }, "Jeder Fahrer einzeln"),
                            React.createElement("option", { value: "team" }, "Nur Team-Platz"))),
                    React.createElement("div", null,
                        React.createElement("div", { className: "fp-player-label" }, "Losung"),
                        React.createElement("select", { value: editModal.mode.trackDrawMode || 'track', onChange: e => setEditModal(m => ({ ...m, mode: { ...m.mode, trackDrawMode: e.target.value } })), style: { marginTop: 4 } },
                            React.createElement("option", { value: "track" }, DRAW_MODES.track),
                            React.createElement("option", { value: "cup" }, DRAW_MODES.cup))),
                    React.createElement("div", null,
                        React.createElement("div", { className: "fp-player-label" }, "Runden"),
                        React.createElement("input", { type: "number", min: "1", max: "10", value: editModal.mode.rounds, onChange: e => setEditModal(m => ({ ...m, mode: { ...m.mode, rounds: parseInt(e.target.value) || 1 } })), style: { marginTop: 4 } })),
                    React.createElement("div", null,
                        React.createElement("div", { className: "fp-player-label" }, "Versuche"),
                        React.createElement("input", { type: "number", min: "1", max: "10", value: editModal.mode.attempts || 1, onChange: e => setEditModal(m => ({ ...m, mode: { ...m.mode, attempts: parseInt(e.target.value, 10) || 1 } })), style: { marginTop: 4 } }))),
                React.createElement("div", { style: { padding: '10px 12px', borderRadius: 8, background: 'var(--card2)', border: '1px solid var(--bord2)' } },
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 } }, "Punkte-Schema"),
                    React.createElement("div", { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
                        React.createElement("span", { className: "chip", style: { fontSize: 9 } }, `${modePointSlotCount(editModal.mode)} Felder`),
                        modeFmt(editModal.mode).team && React.createElement("span", { className: "chip", style: { fontSize: 9 } }, modeScoringMode(editModal.mode) === 'team' ? 'Team-Plätze' : 'Fahrer-Plätze'),
                        React.createElement("span", { style: { fontSize: 11, color: 'var(--muted)' } }, "Die eigentlichen Punktefelder bearbeitest du direkt in der Modusliste.")))),
        renameConsoleModal && React.createElement(Modal, { title: "\u270E Konsole umbenennen", confirmLabel: "Speichern", onCancel: () => setRenameConsoleModal(null), onConfirm: () => { const n = (renameConsoleModal.name || '').trim(); if (!n)
                return; updC(renameConsoleModal.id, 'name', n); setRenameConsoleModal(null); }, maxWidth: 460 },
            React.createElement("div", null,
                React.createElement("div", { className: "fp-player-label" }, "Konsolenname"),
                React.createElement("input", { type: "text", value: renameConsoleModal.name, onChange: e => setRenameConsoleModal(m => ({ ...m, name: e.target.value })), autoFocus: true, style: { marginTop: 4 } }))))));
}
// ── Strecken Tab ──────────────────────────────────────────────────────────────



function StreckenTab({ trackEnabled, setTrackEnabled }) {
    const [openCon, setOpenCon] = useState(null);
    const [customData, setCustomData] = useState({});
    const [newTrack, setNewTrack] = useState({});
    const [promptModal, setPromptModal] = useState(null);
    const safeTrackEnabled = trackEnabled && typeof trackEnabled === 'object' ? trackEnabled : {};
    const setTracks = typeof setTrackEnabled === 'function' ? setTrackEnabled : (() => { });
    const catalog = Array.isArray(STRECKEN_DB) ? STRECKEN_DB : [];

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }

    const PromptDialog = typeof Modal === 'function'
        ? Modal
        : function FallbackModal({
            title,
            children,
            onCancel,
            onConfirm,
            confirmLabel = 'OK',
            confirmColor = 'var(--blue)',
            maxWidth = 420,
        }) {
            return (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(5,5,18,.75)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        backdropFilter: 'blur(3px)',
                    }}
                    onClick={(e) => e.target === e.currentTarget && onCancel()}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 16,
                            width: '100%',
                            maxWidth,
                            boxShadow: '0 24px 60px rgba(0,0,0,.35)',
                            border: '1px solid rgba(0,0,0,.08)',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                padding: '14px 16px',
                                borderBottom: '1px solid var(--bord2)',
                                fontFamily: 'var(--fd)',
                                fontWeight: 700,
                                color: 'var(--dk)',
                            }}
                        >
                            {title || 'Hinweis'}
                        </div>
                        <div style={{ padding: 16 }}>{children}</div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 8,
                                padding: '0 16px 16px',
                            }}
                        >
                            <button className="btn bs" onClick={onCancel}>Abbrechen</button>
                            <button
                                className="btn bp"
                                style={{ background: confirmColor, borderColor: confirmColor }}
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

    function getModeCups(mode) { return safeArray(mode && mode.cups); }
    function getModeRoutes(mode) { return safeArray(mode && mode.routes); }
    function getCustomModes(conId) { return safeArray(((customData && customData.modes) || {})[conId]); }
    function getCustomCups(conId, modeId) { return safeArray(((customData && customData.cups) || {})[`${conId}.${modeId}`]); }
    function getCustomTracks(cupKey) { return safeArray(((customData && customData.tracks) || {})[cupKey]); }

    function toggle(key) {
        setTracks((prev) => {
            const base = prev && typeof prev === 'object' ? prev : {};
            return { ...base, [key]: !(base[key] !== false) };
        });
    }

    function toggleAll(keys, val) {
        const safeKeys = safeArray(keys).filter(Boolean);
        setTracks((prev) => {
            const base = prev && typeof prev === 'object' ? prev : {};
            const next = { ...base };
            safeKeys.forEach((k) => {
                next[k] = val;
            });
            return next;
        });
    }

    function addCustomTrack(cupKey, name) {
        const safeName = String(name || '').trim();
        if (!safeName) return;
        const k = `${cupKey}.${safeName}`;
        setTracks((prev) => {
            const base = prev && typeof prev === 'object' ? prev : {};
            return { ...base, [k]: true };
        });
        setCustomData((prev) => ({
            ...prev,
            tracks: {
                ...((prev && prev.tracks) || {}),
                [cupKey]: [...getCustomTracks(cupKey), safeName],
            },
        }));
        setNewTrack((prev) => ({ ...prev, [cupKey]: '' }));
    }

    function removeCustomTrack(cupKey, name) {
        const k = `${cupKey}.${name}`;
        setTracks((prev) => {
            const base = prev && typeof prev === 'object' ? prev : {};
            const next = { ...base };
            delete next[k];
            return next;
        });
        setCustomData((prev) => ({
            ...prev,
            tracks: {
                ...((prev && prev.tracks) || {}),
                [cupKey]: getCustomTracks(cupKey).filter((track) => track !== name),
            },
        }));
    }

    function addCustomCup(conId, modeId, cupName) {
        const safeName = String(cupName || '').trim();
        if (!safeName) return;
        const cupId = `custom_${Date.now()}`;
        const key = `${conId}.${modeId}`;
        setCustomData((prev) => ({
            ...prev,
            cups: {
                ...((prev && prev.cups) || {}),
                [key]: [...getCustomCups(conId, modeId), { id: cupId, name: safeName, tracks: [], source: 'base' }],
            },
        }));
    }

    function deleteCustomCup(conId, modeId, cupId) {
        const key = `${conId}.${modeId}`;
        setCustomData((prev) => ({
            ...prev,
            cups: {
                ...((prev && prev.cups) || {}),
                [key]: getCustomCups(conId, modeId).filter((cup) => cup.id !== cupId),
            },
        }));
    }

    function addCustomMode(conId, modeName) {
        const safeName = String(modeName || '').trim();
        if (!safeName) return;
        const modeId = `custom_mode_${Date.now()}`;
        setCustomData((prev) => ({
            ...prev,
            modes: {
                ...((prev && prev.modes) || {}),
                [conId]: [...getCustomModes(conId), { id: modeId, name: safeName, cups: [], note: '', refModeIds: [] }],
            },
        }));
    }

    function ownCupKeysForMode(con, mode) {
        const result = [];
        const knockoutMode = typeof isKnockoutMode === 'function' ? isKnockoutMode(mode) : !!(mode && mode.knockout);
        const allCups = knockoutMode ? [] : [...getModeCups(mode), ...getCustomCups(con.id, mode.id)];
        allCups.forEach((cup) => {
            const cupKey = `${con.id}.${mode.id}.${cup.id}`;
            const allTracks = [...safeArray(cup && cup.tracks), ...getCustomTracks(cupKey)];
            allTracks.forEach((track) => result.push(`${cupKey}.${track}`));
        });
        return result;
    }

    function renderTrackChip(cupKey, track, isCustomTrack) {
        const key = `${cupKey}.${track}`;
        const on = safeTrackEnabled[key] !== false;
        return (
            <div
                key={track}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    background: on ? '#e8f4ff' : 'var(--bord2)',
                    border: `1px solid ${on ? '#b0d4f0' : '#ccc'}`,
                    borderRadius: 5,
                    padding: '3px 6px',
                    fontSize: 11,
                }}
            >
                <span
                    style={{ color: on ? 'var(--blue)' : 'var(--muted)', fontWeight: on ? 700 : 400, cursor: 'pointer' }}
                    onClick={() => toggle(key)}
                >
                    {track}
                </span>
                {isCustomTrack ? (
                    <>
                        <span
                            style={{ color: '#aaa', fontSize: 9, cursor: 'pointer', padding: '1px 3px' }}
                            title="Umbenennen"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPromptModal({
                                    title: '✎ Strecke umbenennen',
                                    label: 'Streckenname',
                                    value: track,
                                    onConfirm: (nextName) => {
                                        const safeName = String(nextName || '').trim();
                                        if (!safeName || safeName === track) return;
                                        const newKey = `${cupKey}.${safeName}`;
                                        setTracks((prev) => {
                                            const base = prev && typeof prev === 'object' ? prev : {};
                                            const next = { ...base };
                                            next[newKey] = base[key] !== false;
                                            delete next[key];
                                            return next;
                                        });
                                        setCustomData((prev) => ({
                                            ...prev,
                                            tracks: {
                                                ...((prev && prev.tracks) || {}),
                                                [cupKey]: getCustomTracks(cupKey).map((item) => item === track ? safeName : item),
                                            },
                                        }));
                                    },
                                });
                            }}
                        >
                            ✎
                        </span>
                        <span
                            style={{ color: '#ccc', fontSize: 9, cursor: 'pointer', padding: '1px 3px' }}
                            title="Entfernen"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeCustomTrack(cupKey, track);
                            }}
                        >
                            ✕
                        </span>
                    </>
                ) : null}
            </div>
        );
    }

    function renderCupCard(con, mode, cup, customCups) {
        const cupKey = `${con.id}.${mode.id}.${cup.id}`;
        const isCustomCup = safeArray(customCups).some((item) => item.id === cup.id);
        const customTracks = getCustomTracks(cupKey);
        const allTracks = [...safeArray(cup && cup.tracks), ...customTracks];
        const cupKeys = allTracks.map((track) => `${cupKey}.${track}`);
        const allOn = cupKeys.length > 0 && cupKeys.every((key) => safeTrackEnabled[key] !== false);
        const unlockHint = typeof getCupUnlockHint === 'function' ? getCupUnlockHint(con.id, mode, cup) : '';
        const sourceLabel = typeof getCupSourceLabel === 'function' ? getCupSourceLabel(cup && cup.source) : 'Basis';

        return (
            <div
                key={cup.id}
                style={{
                    background: 'var(--card2)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    marginBottom: 6,
                    border: '1px solid var(--bord2)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                        gap: 8,
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 10, color: 'var(--dk)' }}>
                            {cup.name}
                        </span>
                        <span className="chip" style={{ fontSize: 9 }}>{sourceLabel}</span>
                        {isCustomCup ? (
                            <>
                                <button
                                    className="bic"
                                    style={{ fontSize: 9 }}
                                    onClick={() => setPromptModal({
                                        title: '✎ Cup umbenennen',
                                        label: 'Cup-Name',
                                        value: cup.name,
                                        onConfirm: (nextName) => {
                                            const safeName = String(nextName || '').trim();
                                            if (!safeName) return;
                                            setCustomData((prev) => ({
                                                ...prev,
                                                cups: {
                                                    ...((prev && prev.cups) || {}),
                                                    [`${con.id}.${mode.id}`]: getCustomCups(con.id, mode.id).map((item) => item.id === cup.id ? { ...item, name: safeName } : item),
                                                },
                                            }));
                                        },
                                    })}
                                >
                                    ✎
                                </button>
                                <button
                                    className="bic"
                                    style={{ fontSize: 9, color: 'var(--red)' }}
                                    onClick={() => deleteCustomCup(con.id, mode.id, cup.id)}
                                >
                                    ✕
                                </button>
                            </>
                        ) : null}
                    </div>
                    {cupKeys.length > 0 ? (
                        <button className="btn bs bsm" style={{ fontSize: 9 }} onClick={() => toggleAll(cupKeys, !allOn)}>
                            {allOn ? 'Alle aus' : 'Alle an'}
                        </button>
                    ) : null}
                </div>

                {unlockHint ? (
                    <div style={{ marginBottom: 6, color: 'var(--muted)', fontSize: 11, lineHeight: 1.35 }}>
                        {unlockHint}
                    </div>
                ) : null}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {allTracks.map((track) => renderTrackChip(cupKey, track, customTracks.includes(track)))}
                    <div key="add-track" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="+ Strecke"
                            value={newTrack[cupKey] || ''}
                            onChange={(e) => setNewTrack((prev) => ({ ...prev, [cupKey]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomTrack(cupKey, newTrack[cupKey] || '')}
                            style={{ width: 132, fontSize: 11, padding: '3px 7px', border: '1px dashed var(--bord2)', borderRadius: 5 }}
                        />
                        <button className="btn bs bsm" onClick={() => addCustomTrack(cupKey, newTrack[cupKey] || '')}>+</button>
                    </div>
                </div>
            </div>
        );
    }

    function renderModeBlock(con, mode, allModes, customModes) {
        const isCustomMode = safeArray(customModes).some((item) => item.id === mode.id);
        const knockoutMode = typeof isKnockoutMode === 'function' ? isKnockoutMode(mode) : !!(mode && mode.knockout);
        const customCups = knockoutMode ? [] : getCustomCups(con.id, mode.id);
        const ownCups = knockoutMode ? [] : [...getModeCups(mode), ...customCups];
        const refModeNames = [];
        const routes = getModeRoutes(mode);

        safeArray(mode && mode.refModeIds).forEach((refId) => {
            const found = safeArray(allModes).find((item) => item && item.id === refId) || safeArray(con && con.modes).find((item) => item && item.id === refId);
            const name = String((found && found.name) || '').trim();
            if (name && !refModeNames.includes(name)) refModeNames.push(name);
        });

        return (
            <div key={mode.id} style={{ marginBottom: 14, borderTop: '1px solid var(--bord2)', paddingTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 12, color: 'var(--dk)' }}>{mode.name}</span>
                    {!knockoutMode && !getModeCups(mode).length && customCups.length > 0 ? (
                        <span className="chip" style={{ fontSize: 9 }}>Nur benutzerdefiniert</span>
                    ) : null}
                    {isCustomMode ? (
                        <button
                            className="bic"
                            style={{ fontSize: 9, color: 'var(--red)' }}
                            onClick={() => setCustomData((prev) => ({
                                ...prev,
                                modes: {
                                    ...((prev && prev.modes) || {}),
                                    [con.id]: getCustomModes(con.id).filter((item) => item.id !== mode.id),
                                },
                            }))}
                        >
                            ✕ Löschen
                        </button>
                    ) : null}
                    {!knockoutMode ? (
                        <button
                            className="btn bs bsm"
                            onClick={() => setPromptModal({
                                title: '➕ Cup hinzufügen',
                                label: 'Cup-Name',
                                value: '',
                                onConfirm: (name) => addCustomCup(con.id, mode.id, name),
                            })}
                        >
                            + Cup
                        </button>
                    ) : null}
                </div>

                {mode && mode.note ? (
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 6, lineHeight: 1.4 }}>{mode.note}</div>
                ) : null}

                {refModeNames.length > 0 ? (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: .8, color: 'var(--muted)', textTransform: 'uppercase' }}>
                            Verwendet Strecken aus:
                        </span>
                        {refModeNames.map((name) => (
                            <span key={name} className="chip" style={{ fontSize: 9 }}>{name}</span>
                        ))}
                    </div>
                ) : null}

                {ownCups.map((cup) => renderCupCard(con, mode, cup, customCups))}

                {!ownCups.length && !routes.length ? (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Keine eigene Cup-Struktur hinterlegt.</div>
                ) : null}

                {routes.length > 0 ? (
                    <>
                        <div style={{ color: 'var(--muted)', fontSize: 11, lineHeight: 1.4, marginTop: 4 }}>
                            {knockoutMode
                                ? `${routes.length} feste K.O.-Tour-Rallyes mit eigener Zuordnung.`
                                : `${routes.length} feste Verläufe hinterlegt.`}
                        </div>
                        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                            {routes.map((route) => {
                                const sequenceText = typeof getRouteSequenceText === 'function'
                                    ? getRouteSequenceText(route)
                                    : String((route && route.text) || '');

                                return (
                                    <div
                                        key={(route && route.id) || (route && route.name) || `${mode.id}-route`}
                                        style={{
                                            background: 'var(--card2)',
                                            borderRadius: 6,
                                            padding: '8px 10px',
                                            border: '1px solid var(--bord2)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <span
                                                style={{
                                                    fontFamily: 'var(--fd)',
                                                    fontWeight: 700,
                                                    fontSize: 10,
                                                    color: 'var(--muted)',
                                                    letterSpacing: .6,
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {knockoutMode ? 'K.O.-Tour' : 'Verlauf'}
                                            </span>
                                            <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 10, color: 'var(--dk)' }}>
                                                {(route && route.name) || 'Ohne Namen'}
                                            </span>
                                        </div>
                                        {sequenceText ? (
                                            <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.4 }}>{sequenceText}</div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : null}
            </div>
        );
    }

    const consoleCards = catalog
        .slice()
        .sort((a, b) => (CONSOLE_YEARS[String(a.id)] || 9999) - (CONSOLE_YEARS[String(b.id)] || 9999))
        .map((con) => {
            const isOpen = openCon === con.id;
            const customModes = getCustomModes(con.id);
            const allModes = [...safeArray(con && con.modes), ...customModes];
            const conKeys = [];
            allModes.forEach((mode) => {
                ownCupKeysForMode(con, mode).forEach((key) => conKeys.push(key));
            });
            const enabledCount = conKeys.filter((key) => safeTrackEnabled[key] !== false).length;

            return (
                <div key={con.id} className={`conc${isOpen ? ' on' : ''}`} style={{ marginBottom: 12 }}>
                    <div className="conh" onClick={() => setOpenCon(isOpen ? null : con.id)}>
                        <div className="cont">
                            <span style={{ fontSize: 20 }}>{con.emoji}</span>
                            <div>
                                <div>{con.name}</div>
                                <div className="cong">{con.game}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className="chip chip-r" style={{ fontSize: 9 }}>{enabledCount}/{conKeys.length} aktiv</span>
                            <button
                                className="btn bs bsm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAll(conKeys, true);
                                }}
                            >
                                Alle an
                            </button>
                            <button
                                className="btn bs bsm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAll(conKeys, false);
                                }}
                            >
                                Alle aus
                            </button>
                        </div>
                    </div>

                    {isOpen ? (
                        <div style={{ padding: '8px 14px 12px' }}>
                            {allModes.map((mode) => renderModeBlock(con, mode, allModes, customModes))}
                            <button
                                className="btn bs bsm"
                                onClick={() => setPromptModal({
                                    title: '➕ Modus hinzufügen',
                                    label: 'Modus-Name',
                                    value: '',
                                    onConfirm: (name) => addCustomMode(con.id, name),
                                })}
                            >
                                + Modus hinzufügen
                            </button>
                        </div>
                    ) : null}
                </div>
            );
        });

    return (
        <div>
            <div className="card mb3">
                <div className="card-hdr">
                    <span className="ctitle">🗺️ Modi & Strecken</span>
                    <span className="chip chip-b" style={{ fontSize: 9 }}>Modi, Cups, Strecken & K.O.-Verläufe</span>
                </div>
                <div style={{ color: 'var(--ds)', fontSize: 13, lineHeight: 1.45 }}>
                    Grand Prix nutzt Cups, Zeitrennen und Versus nutzen Strecken, und K.O.-Tour bleibt als eigener Rallye-Modus mit separater Zuordnung und fester Streckenabfolge erhalten.
                    Freischaltbare Inhalte zeigen ihren Freischalt-Hinweis direkt im jeweiligen Eintrag.
                </div>
            </div>

            {consoleCards}

            {promptModal ? (
                <PromptDialog
                    title={promptModal.title}
                    confirmLabel="Speichern"
                    onCancel={() => setPromptModal(null)}
                    onConfirm={() => {
                        const value = String((promptModal && promptModal.value) || '').trim();
                        if (!value) return;
                        if (promptModal && typeof promptModal.onConfirm === 'function') {
                            promptModal.onConfirm(value);
                        }
                        setPromptModal(null);
                    }}
                    maxWidth={460}
                >
                    <div>
                        <div className="fp-player-label">{promptModal.label}</div>
                        <input
                            type="text"
                            value={promptModal.value}
                            onChange={(e) => setPromptModal((modalState) => ({ ...modalState, value: e.target.value }))}
                            autoFocus
                            style={{ marginTop: 4 }}
                        />
                    </div>
                </PromptDialog>
            ) : null}
        </div>
    );
}

// ── Speichern Tab ─────────────────────────────────────────────────────────────


function SpeichernTab({ persist }) {
    const { filename, setFilename, saveToFile, loadFromFile } = persist;
    const [saveName, setSaveName] = useState(filename || 'mkwc-turnier');
    const [working, setWorking] = useState(false);

    useEffect(() => {
        if (filename) setSaveName(filename);
    }, [filename]);

    async function chooseFolder() {
        setWorking(true);
        try {
            await persist.chooseStorageFolder();
        } finally {
            setWorking(false);
        }
    }

    async function reconnectFolder() {
        setWorking(true);
        try {
            await persist.reconnectRememberedFolder(true);
        } finally {
            setWorking(false);
        }
    }

    async function saveNow() {
        setWorking(true);
        try {
            await persist.managedSaveNow('manual-button', true);
        } finally {
            setWorking(false);
        }
    }

    async function loadCurrent() {
        setWorking(true);
        try {
            await persist.loadManagedCurrent({ askPermission: true });
        } finally {
            setWorking(false);
        }
    }

    async function loadBackup(name) {
        setWorking(true);
        try {
            await persist.loadManagedBackup(name, { askPermission: true });
        } finally {
            setWorking(false);
        }
    }

    async function loadLatestBackup() {
        setWorking(true);
        try {
            const ok = await persist.loadLatestManagedBackup({ askPermission: true });
            if (!ok) alert('Es wurde noch kein Backup im verbundenen Ordner gefunden.');
        } finally {
            setWorking(false);
        }
    }

    async function disconnectFolder() {
        setWorking(true);
        try {
            await persist.clearRememberedFolder();
        } finally {
            setWorking(false);
        }
    }

    const cardS = {
        background: '#fff',
        border: '1px solid var(--bord)',
        borderRadius: 10,
        padding: 20,
        marginBottom: 12,
    };
    const lbl = {
        fontFamily: 'var(--fd)',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'var(--muted)',
        marginBottom: 5,
        display: 'block',
    };
    const pill = (text, variant = 'neutral') => {
        const styles = {
            neutral: { background: '#f0f0ff', borderColor: '#c0c0ee', color: 'var(--muted)' },
            good: { background: '#f0fff4', borderColor: '#b7f5c8', color: 'var(--green)' },
            warn: { background: '#fff8e0', borderColor: '#ffd966', color: '#8a6000' },
            bad: { background: '#fff0f0', borderColor: '#ffcccc', color: 'var(--red)' },
        };
        const s = styles[variant] || styles.neutral;

        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    borderRadius: 999,
                    border: `1px solid ${s.borderColor}`,
                    background: s.background,
                    color: s.color,
                    fontSize: 10,
                    fontFamily: 'var(--fd)',
                    letterSpacing: .8,
                    whiteSpace: 'nowrap',
                }}
            >
                {text}
            </span>
        );
    };

    const backups = persist.backups || [];
    const latestBackupName = persist.latestBackupName || (backups[0] && backups[0].name) || '';
    const latestFiveBackups = backups.slice(0, 5);

    function parseBackupMeta(name) {
        const match = String(name || '').match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})_(\d{3})_(.+)\.json$/i);
        if (!match) return { label: name || 'Unbekanntes Backup', detail: 'Zeitstempel nicht lesbar' };
        const [, y, mo, d, h, mi, s, ms, base] = match;
        const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), Number(ms));
        const label = Number.isNaN(dt.getTime()) ? `${d}.${mo}.${y} ${h}:${mi}:${s}` : dt.toLocaleString('de-DE');
        const dataset = String(base || '').replace(/_/g, ' ').trim();
        return {
            label,
            detail: dataset ? `Datensatz: ${dataset}` : 'Datensatz ohne Namen',
        };
    }

    const storagePills = [
        persist.storageSupported ? pill('Ordnerspeicher bereit', 'good') : pill('Ordnerspeicher nicht unterstützt', 'bad'),
        persist.storageConnected
            ? pill(`Verbunden: ${persist.storageFolderLabel || persist.defaultStorageFolderName || 'Speicher'}`, 'good')
            : persist.storageReconnectNeeded
                ? pill('Ordner gemerkt · Bestätigung nötig', 'warn')
                : pill('Noch nicht verbunden', 'neutral'),
        persist.autosave ? pill(`Auto-Save ${persist.autosaveDelay}s`, 'good') : pill('Auto-Save aus', 'warn'),
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
            <div style={cardS}>
                <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 13, color: 'var(--dk)', marginBottom: 8 }}>
                    💾 Speicherkomfort
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {storagePills}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div style={{ background: 'var(--card2)', border: '1px solid var(--bord2)', borderRadius: 8, padding: 12 }}>
                        <div style={lbl}>Letztes Ordner-Speichern</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dk)', wordBreak: 'break-word' }}>
                            {persist.lastManagedSave || 'Noch nichts im Ordner gespeichert'}
                        </div>
                    </div>
                    <div style={{ background: 'var(--card2)', border: '1px solid var(--bord2)', borderRadius: 8, padding: 12 }}>
                        <div style={lbl}>Neuestes Backup</div>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: latestBackupName ? 'var(--dk)' : 'var(--muted)',
                                wordBreak: 'break-word',
                            }}
                        >
                            {latestBackupName || 'Noch kein Backup vorhanden'}
                        </div>
                    </div>
                </div>

                <div className="alert alert-i" style={{ marginBottom: 12 }}>
                    <div>ℹ️</div>
                    <div>
                        <strong>Status:</strong> {persist.storageStatus || '–'}
                        <div style={{ marginTop: 4 }}>
                            Standardordner in diesem Paket: <strong>./Speicher</strong>
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--ds)', marginBottom: 14, lineHeight: 1.55 }}>
                    Hier arbeitet die App mit einem festen Ordner. Dort liegt immer eine <strong>current.json</strong> und zusätzlich ein Backup-Ordner mit den <strong>20 letzten Versionen</strong>. Der Browser merkt sich den gewählten Ordner für den nächsten Start.
                </div>

                <span style={lbl}>Datensatzname</span>
                <input
                    type="text"
                    value={saveName}
                    onChange={(e) => {
                        setSaveName(e.target.value);
                        setFilename(e.target.value);
                    }}
                    placeholder="z. B. MarioKartWorldCup2026"
                    style={{ marginBottom: 12 }}
                />

                <span style={lbl}>Aktiver Ordner</span>
                <input
                    type="text"
                    readOnly
                    value={persist.storageFolderLabel || ''}
                    placeholder="Noch kein Speicherordner verbunden"
                    style={{
                        marginBottom: 12,
                        background: 'var(--card2)',
                        color: persist.storageFolderLabel ? 'var(--dk)' : 'var(--muted)',
                    }}
                />

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <button className="btn bp" onClick={chooseFolder} disabled={working || !persist.storageSupported}>Ordner wählen</button>
                    <button className="btn bs" onClick={reconnectFolder} disabled={working || !persist.storageSupported}>Ordner erneut verbinden</button>
                    <button className="btn bs" onClick={saveNow} disabled={working || !persist.storageFolderLabel}>Jetzt speichern</button>
                    <button className="btn bd" onClick={disconnectFolder} disabled={working || !persist.storageFolderLabel}>Verknüpfung lösen</button>
                </div>

                {persist.storageReconnectNeeded ? (
                    <div className="alert" style={{ marginBottom: 12 }}>
                        <div>⚠️</div>
                        <div>
                            <strong>Gemerkter Ordner gefunden.</strong> Nach dem Neustart braucht der Browser hier meist noch einen Bestätigungsklick. Danach wird <strong>current.json</strong> sofort geladen.
                            <div style={{ marginTop: 8 }}>
                                <button className="btn bp" onClick={reconnectFolder} disabled={working}>
                                    Gemerkten Ordner verbinden & laden
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <button className={`tog${persist.autosave ? ' on' : ''}`} onClick={() => persist.setAutosave((a) => !a)} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dk)' }}>
                        {persist.autosave ? 'Automatisches Speichern aktiv' : 'Automatisches Speichern aus'}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                        <span style={lbl}>Speichern nach letzter Änderung</span>
                        <input
                            type="number"
                            min="0.4"
                            max="10"
                            step="0.1"
                            value={persist.autosaveDelay}
                            onChange={(e) => persist.setAutosaveDelay(parseFloat(e.target.value) || 1)}
                            style={{ width: 90 }}
                        />
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>in Sekunden</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.55, display: 'flex', alignItems: 'end' }}>
                        Beispiel: Du trägst einen Platz im Spielplan ein → kurz danach wird
                        <strong style={{ color: 'var(--dk)', margin: '0 4px' }}>current.json</strong>
                        aktualisiert und ein neues Backup angelegt.
                    </div>
                </div>
            </div>

            <div style={cardS}>
                <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 13, color: 'var(--dk)', marginBottom: 8 }}>
                    📜 Ordnerinhalt
                </div>

                <div style={{ fontSize: 12, color: 'var(--ds)', marginBottom: 14, lineHeight: 1.55 }}>
                    Die App arbeitet mit einem laufenden Stand und zusätzlichen Sicherungen. So kannst du jederzeit auf eine ältere Version zurückgehen.
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <button className="btn bs" onClick={loadCurrent} disabled={working || !persist.storageFolderLabel}>current.json laden</button>
                    <button className="btn bs" onClick={loadLatestBackup} disabled={working || !persist.storageFolderLabel}>Neuestes Backup laden</button>
                    <button className="btn bs" onClick={() => persist.refreshBackups()} disabled={working || !persist.storageFolderLabel}>Backups aktualisieren</button>
                    <button className="btn bs" onClick={loadFromFile}>JSON-Datei importieren</button>
                    <button className="btn bs" onClick={() => saveToFile(saveName || 'mkwc-turnier')}>JSON-Datei exportieren</button>
                </div>

                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                    Im Ordner bleiben immer nur die <strong style={{ color: 'var(--dk)' }}>20 neuesten Backups</strong>. Oben stehen die letzten <strong style={{ color: 'var(--dk)' }}>5 Sicherungen</strong> als Schnellzugriff.
                </div>

                {latestFiveBackups.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 12 }}>
                        {latestFiveBackups.map((entry, index) => {
                            const meta = parseBackupMeta(entry.name);
                            return (
                                <div
                                    key={`quick_${entry.name}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 12px',
                                        background: index === 0 ? '#fff8e0' : '#f7f8ff',
                                        borderRadius: 8,
                                        border: index === 0 ? '1px solid #ffd966' : '1px solid var(--bord2)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: 999,
                                            background: index === 0 ? '#f5c518' : 'var(--card2)',
                                            color: index === 0 ? '#251300' : 'var(--muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontFamily: 'var(--fd)',
                                            fontWeight: 700,
                                            fontSize: 11,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: 'var(--dk)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {index === 0 ? `Neueste Sicherung · ${meta.label}` : meta.label}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--muted)',
                                                marginTop: 2,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {meta.detail}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: 'var(--muted)',
                                                marginTop: 3,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {entry.name}
                                        </div>
                                    </div>
                                    <button className="btn bs bsm" onClick={() => loadBackup(entry.name)}>Laden</button>
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                {backups.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Noch keine Backups im verbundenen Ordner gefunden.
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                fontFamily: 'var(--fd)',
                                fontSize: 10,
                                letterSpacing: 1,
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                                marginBottom: 6,
                            }}
                        >
                            Alle Sicherungen
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflow: 'auto', paddingRight: 4 }}>
                            {backups.map((entry, index) => {
                                const meta = parseBackupMeta(entry.name);
                                return (
                                    <div
                                        key={entry.name}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '8px 10px',
                                            background: index === 0 ? '#fff8e0' : 'var(--card2)',
                                            borderRadius: 6,
                                            border: index === 0 ? '1px solid #ffd966' : '1px solid var(--bord2)',
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: 'var(--dk)',
                                                    fontWeight: 700,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {index === 0 ? `Neueste Sicherung · ${meta.label}` : meta.label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: 'var(--muted)',
                                                    marginTop: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {entry.name}
                                            </div>
                                        </div>
                                        <button className="btn bs bsm" onClick={() => loadBackup(entry.name)}>Laden</button>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Begegnungen ────────────────────────────────────────────────────────────
function BegegnungenTab({ fps, schedule, results = {} }) {
    const fpMap = useMemo(() => Object.fromEntries(fps.map(f => [f.id, f])), [fps]);
    const allTeams = useMemo(() => [...new Set(fps.map(f => f.teamName).filter(Boolean))], [fps]);
    const [openFp, setOpenFp] = useState(null);
    const enc = useMemo(() => {
        if (!schedule)
            return {};
        const raw = {};
        fps.forEach(f => { raw[f.id] = new Map(); });
        schedule.forEach(s => s.groups.forEach(g => {
            for (let i = 0; i < g.fps.length; i++)
                for (let j = 0; j < g.fps.length; j++) {
                    if (i === j)
                        continue;
                    const a = g.fps[i], b = g.fps[j];
                    if (!raw[a])
                        raw[a] = new Map();
                    if (!raw[a].has(b))
                        raw[a].set(b, []);
                    raw[a].get(b).push({ sid: s.id, emoji: s.consoleEmoji, cname: s.consoleName, mn: s.modeName, r: s.round, gid: g.id, fid: b, allFps: g.fps });
                }
        }));
        const out = {};
        fps.forEach(f => { out[f.id] = [...(raw[f.id] || new Map()).entries()].map(([o, ss]) => ({ o, c: ss.length, ss })).sort((a, b) => b.c - a.c); });
        return out;
    }, [fps, schedule]);
    const stats = useMemo(() => {
        if (!schedule)
            return null;
        let mx = 0, mn = Infinity, tp = 0, tm = 0;
        fps.forEach(f => { (enc[f.id] || []).forEach(e => { mx = Math.max(mx, e.c); mn = Math.min(mn, e.c); tm += e.c; tp++; }); });
        return { mx, mn: mn === Infinity ? 0 : mn, up: Math.round(tp / 2), avg: tp ? (tm / tp).toFixed(1) : 0 };
    }, [enc, fps, schedule]);
    if (!schedule)
        return React.createElement("div", { className: "alert alert-i" },
                    React.createElement("div", null, "Standardordner in diesem Paket: ./Speicher"), "\u2139\uFE0F Spielplan generieren zuerst.");
    return (React.createElement("div", null,
        stats && React.createElement("div", { className: "card mb3", style: { padding: '12px 16px' } },
            React.createElement("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } }, [['Paarungen', stats.up, 'var(--dt)'], ['Ø Treffen', stats.avg, 'var(--gold)'], ['Max', stats.mx, stats.mx > 3 ? 'var(--red)' : 'var(--green)'], ['Min', stats.mn, 'var(--muted)']].map(([l, v, c]) => (React.createElement("div", { key: l, style: { background: 'var(--card2)', border: '1px solid var(--bord)', borderRadius: 7, padding: '8px 14px', flex: 1, minWidth: 80, textAlign: 'center' } },
                React.createElement("div", { style: { fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 18, color: c } }, v),
                React.createElement("div", { style: { fontSize: 9, color: 'var(--muted)', marginTop: 2, fontFamily: 'var(--fd)', letterSpacing: 1, textTransform: 'uppercase' } }, l)))))),
        fps.map(fp => {
            const es = enc[fp.id] || [];
            const tot = es.reduce((s, e) => s + e.c, 0);
            const col = fp.teamName ? tc(fp.teamName, allTeams) : null;
            const isOpen = openFp === fp.id;
            return (React.createElement("div", { key: fp.id, style: { marginBottom: 6 } },
                React.createElement("div", { style: { background: isOpen ? '#fff' : 'var(--card2)', border: `1.5px solid ${isOpen ? (col || 'var(--red)') : 'var(--bord)'}`, borderRadius: isOpen ? '8px 8px 0 0' : '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none', transition: 'all .15s' }, onClick: () => setOpenFp(isOpen ? null : fp.id) },
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("div", { style: { fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 13, color: col || 'var(--dk)', display: 'flex', alignItems: 'center', gap: 6 } },
                            fpName(fp),
                            !isSolo(fp) && React.createElement("span", { className: "chip-t chip", style: { fontSize: 8 } }, "T")),
                        fpSub(fp) && React.createElement("div", { style: { fontSize: 11, color: 'var(--muted)', marginTop: 2 } }, fpSub(fp))),
                    React.createElement("div", { style: { display: 'flex', gap: 6, alignItems: 'center' } },
                        React.createElement("span", { className: "chip", style: { fontSize: 9 } },
                            es.length,
                            " Gegner"),
                        schedule && (() => {
                            const allGroups = schedule.flatMap(x => x.groups);
                            const myGroups = allGroups.filter(g => g.fps.includes(fp.id));
                            const doneCnt = myGroups.filter(g => { const r2 = results[g.id]; return r2 && (typeof isScoredGroupResultComplete === 'function' ? isScoredGroupResultComplete(g, r2) : (g.teamMode ? Object.keys(r2.teamPlacements || {}).length >= Math.ceil(g.fps.length / (g.teamSize || 1)) : g.fps.every(id => (r2.placements || {})[id] != null))); }).length;
                            return React.createElement("span", { className: "chip", style: { fontSize: 9, background: doneCnt === myGroups.length && myGroups.length > 0 ? '#f0fff4' : 'var(--card2)', borderColor: doneCnt === myGroups.length && myGroups.length > 0 ? '#b7f5c8' : 'var(--bord2)', color: doneCnt === myGroups.length && myGroups.length > 0 ? 'var(--green)' : 'var(--ds)' } },
                                doneCnt,
                                "/",
                                myGroups.length,
                                " Rennen");
                        })(),
                        React.createElement("span", { style: { color: 'var(--muted)', fontSize: 12, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-block' } }, "\u25B8"))),
                isOpen && (React.createElement("div", { style: { background: '#fff', border: '1.5px solid var(--bord)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px 14px' } },
                    React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 } }, es.map(({ o, c, ss }) => {
                        const op = fpMap[o];
                        const oc = (op === null || op === void 0 ? void 0 : op.teamName) ? tc(op.teamName, allTeams) : null;
                        const cntColor = c >= 4 ? 'var(--red)' : c >= 3 ? '#c8960a' : c >= 2 ? 'var(--dk)' : 'var(--muted)';
                        return (React.createElement("div", { key: o, style: { background: 'var(--card2)', border: '1px solid var(--bord2)', borderRadius: 7, padding: '10px 12px' } },
                            React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 } },
                                React.createElement("div", null,
                                    React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: 'var(--dk)', display: 'flex', alignItems: 'center', gap: 5 } },
                                        fpShort(op),
                                        !isSolo(op) && React.createElement("span", { className: "chip-t chip", style: { fontSize: 7 } }, "T")),
                                    fpSub(op) && React.createElement("div", { style: { fontSize: 10, color: 'var(--muted)', marginTop: 1 } }, fpSub(op))),
                                React.createElement("div", { style: { fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 15, color: cntColor } },
                                    c,
                                    "\u00D7")),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 3 } }, ss.map((s, si) => {
                                var _a;
                                const gr = schedule === null || schedule === void 0 ? void 0 : schedule.flatMap(x => x.groups).find(g => g.id === s.gid);
                                const r2 = results[s.gid];
                                const audit = (gr && r2 && typeof getGroupScoringAudit === 'function') ? getGroupScoringAudit(gr, r2) : null;
                                const played = !!(audit ? audit.isScorable : (r2 && ((gr === null || gr === void 0 ? void 0 : gr.teamMode) ? Object.keys(r2.teamPlacements || {}).length >= Math.ceil((((_a = gr.fps) === null || _a === void 0 ? void 0 : _a.length) || 0) / (gr.teamSize || 1)) : gr === null || gr === void 0 ? void 0 : gr.fps.every(id => (r2.placements || {})[id] != null))));
                                const partial = !played && !!(audit ? audit.hasAnyPlacement : (r2 && gr && gr.fps.some(id => (r2.placements || {})[id] != null)));
                                // isTeammate: same team chunk in same match
                                const isTeammate = (() => {
                                    if (!(gr === null || gr === void 0 ? void 0 : gr.teamMode) || !fp)
                                        return false;
                                    const sz = gr.teamSize || 1;
                                    const myIdx = gr.fps.indexOf(fp.id);
                                    const oppIdx = gr.fps.indexOf(o); // o = opponent id from outer loop
                                    if (myIdx < 0 || oppIdx < 0)
                                        return false;
                                    return Math.floor(myIdx / sz) === Math.floor(oppIdx / sz);
                                })();
                                const state = played ? 'done' : partial ? 'partial' : 'open';
                                const { light, lightBg } = getMatchAmpelColors(state);
                                return (React.createElement("div", { key: si, style: { background: lightBg, border: `1.5px solid ${light}`, borderRadius: 5, padding: '5px 8px', display: 'flex', alignItems: 'flex-start', gap: 6 } },
                                    React.createElement("div", { style: { width: 10, height: 10, borderRadius: '50%', background: light, flexShrink: 0, marginTop: 2 } }),
                                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                                        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' } },
                                            React.createElement("span", { style: { fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 9, color: 'var(--dk)' } }, s.cname),
                                            React.createElement("span", { style: { fontFamily: 'var(--fd)', fontSize: 8, color: 'var(--muted)' } },
                                                "R",
                                                s.r),
                                            isTeammate && React.createElement("span", { style: { fontFamily: 'var(--fd)', fontSize: 8, background: '#fff8dc', color: '#8a6000', border: '1px solid #f5c518', borderRadius: 3, padding: '1px 4px' } }, "Mein Team")),
                                        React.createElement("div", { style: { fontSize: 10, color: 'var(--ds)', marginTop: 1 } }, s.mn))));
                            }))));
                    }))))));
        })));
}

// ── Match Card ─────────────────────────────────────────────────────────────
function getMatchCompletionState(group, result) {
    const res = result || {};
    if (typeof getGroupScoringAudit === 'function') {
        const audit = getGroupScoringAudit(group, res);
        if (audit.isScorable)
            return 'done';
        if (audit.hasAnyPlacement)
            return 'partial';
        return 'open';
    }
    if (group.teamMode) {
        const teamCount = Math.ceil(group.fps.length / (group.teamSize || 1));
        const filled = Object.keys(res.teamPlacements || {}).filter(k => (res.teamPlacements || {})[k] != null).length;
        if (filled <= 0) return 'open';
        if (filled < teamCount) return 'partial';
        return 'done';
    }
    const filled = group.fps.filter(id => (res.placements || {})[id] != null).length;
    if (filled <= 0) return 'open';
    if (filled < group.fps.length) return 'partial';
    return 'done';
}
function getMatchAmpelColors(state) {
    return state === 'done'
        ? { light: '#17a34a', lightBg: '#f3fff6' }
        : state === 'partial'
            ? { light: '#f5c518', lightBg: '#fff9e8' }
            : { light: '#e60012', lightBg: '#fff4f6' };
}

function getScheduleThemeId(session, fallbackConsole = null) {
    const text = [
        session === null || session === void 0 ? void 0 : session.consoleId,
        session === null || session === void 0 ? void 0 : session.consoleName,
        fallbackConsole === null || fallbackConsole === void 0 ? void 0 : fallbackConsole.id,
        fallbackConsole === null || fallbackConsole === void 0 ? void 0 : fallbackConsole.name,
        ...(((session === null || session === void 0 ? void 0 : session.groups) || []).map(group => group && group.track).filter(Boolean))
    ].join(' ').toLowerCase();
    if (/snes|super\s*mario\s*kart/.test(text))
        return 'snes';
    if (/n64/.test(text))
        return 'n64';
    if (/gba/.test(text))
        return 'gba';
    if (/gamecube|\bgc\b/.test(text))
        return 'gc';
    if (/\bds\b/.test(text))
        return 'ds';
    if (/\bwii\b/.test(text))
        return 'wii';
    if (/3ds/.test(text))
        return '3ds';
    if (/wii\s*u|wiiu/.test(text))
        return 'wiiu';
    if (/switch\s*2|switch2/.test(text))
        return 'switch2';
    if (/\bswitch\b/.test(text))
        return 'switch';
    if (/tour/.test(text))
        return 'tour';
    return 'generic';
}
function getScheduleThemeHint(themeId) {
    const hints = {
        snes: 'Retro-Speedway · SNES-Driftkulisse',
        n64: 'Weite Kurven · 64-Bit-Arcade-Vibe',
        gba: 'Handheld-Remix · Speedline-Look',
        gc: 'Neo-Arcade · Double-Dash-Energie',
        ds: 'Urban Sprint · klare Richtungswechsel',
        wii: 'Boost Flow · trickreiche Linien',
        '3ds': 'Panorama-Speed · moderne Retro-Mixe',
        wiiu: 'HD Circuit · saubere Turbokanten',
        switch: 'Festival Grid · moderne Rennkulisse',
        switch2: 'World Tour Grid · dynamische Rennszene',
        tour: 'City Run · Spotlight-Nachtkulisse',
        generic: 'Rennszene · Fokus auf Strecke & Flow'
    };
    return hints[themeId] || hints.generic;
}
function getScheduleTrackPreview(session, limit = 4) {
    const tracks = [];
    ((session === null || session === void 0 ? void 0 : session.groups) || []).forEach(group => {
        const track = String((group === null || group === void 0 ? void 0 : group.track) || '').trim();
        if (track && !tracks.includes(track))
            tracks.push(track);
    });
    if (!tracks.length)
        return '';
    const preview = tracks.slice(0, Math.max(1, limit));
    return preview.join(' · ') + (tracks.length > preview.length ? ' · …' : '');
}
function shouldUseCompactPlacementCard(group) {
    const isTimeTrial = typeof isTimeTrialMode === 'function' ? isTimeTrialMode(group) : !!(group === null || group === void 0 ? void 0 : group.timeTrial);
    return !((group === null || group === void 0 ? void 0 : group.teamMode) === true) && !isTimeTrial && (((group === null || group === void 0 ? void 0 : group.fps) || []).length > 12);
}

function autoCompletePlacementsForGroup(group, groupState) {
    const nextGroup = { ...(groupState || {}) };
    if ((((group === null || group === void 0 ? void 0 : group.timeTrial) === true) || (typeof isTimeTrialMode === 'function' ? isTimeTrialMode(group) : false)) && !(group === null || group === void 0 ? void 0 : group.teamMode)) {
        nextGroup.timeTrials = typeof normalizeTimeTrialEntriesForResult === 'function'
            ? normalizeTimeTrialEntriesForResult(group, nextGroup)
            : (((nextGroup === null || nextGroup === void 0 ? void 0 : nextGroup.timeTrials) || {}));
        return nextGroup;
    }
    if (group === null || group === void 0 ? void 0 : group.teamMode) {
        const teamCount = Math.ceil(((group === null || group === void 0 ? void 0 : group.fps) || []).length / (((group === null || group === void 0 ? void 0 : group.teamSize) || 1)));
        const placements = { ...((nextGroup === null || nextGroup === void 0 ? void 0 : nextGroup.teamPlacements) || {}) };
        const values = Array.from({ length: teamCount }, (_, i) => placements[i] != null ? parseInt(placements[i], 10) : null);
        const emptyCount = values.filter(v => v == null).length;
        const filled = values.filter(v => Number.isFinite(v));
        const unique = new Set(filled);
        if (teamCount > 1 && emptyCount === 1 && unique.size === teamCount - 1) {
            const missingRank = Array.from({ length: teamCount }, (_, i) => i + 1).find(v => !unique.has(v));
            const missingIdx = values.findIndex(v => v == null);
            if (missingRank != null && missingIdx >= 0)
                placements[missingIdx] = missingRank;
        }
        nextGroup.teamPlacements = placements;
        return nextGroup;
    }
    const ids = (group === null || group === void 0 ? void 0 : group.fps) || [];
    const placements = { ...((nextGroup === null || nextGroup === void 0 ? void 0 : nextGroup.placements) || {}) };
    const values = ids.map(id => placements[id] != null ? parseInt(placements[id], 10) : null);
    const emptyCount = values.filter(v => v == null).length;
    const filled = values.filter(v => Number.isFinite(v));
    const unique = new Set(filled);
    if (ids.length > 1 && emptyCount === 1 && unique.size === ids.length - 1) {
        const missingRank = Array.from({ length: ids.length }, (_, i) => i + 1).find(v => !unique.has(v));
        const missingIdx = values.findIndex(v => v == null);
        if (missingRank != null && missingIdx >= 0)
            placements[ids[missingIdx]] = missingRank;
    }
    nextGroup.placements = placements;
    return nextGroup;
}
function updateGroupPlacementState(setResults, group, patch, allowAutoComplete = true) {
    setResults(prev => {
        const prevGroup = (prev && prev[group.id]) || {};
        let nextGroup = { ...prevGroup, ...patch };
        if (allowAutoComplete)
            nextGroup = autoCompletePlacementsForGroup(group, nextGroup);
        return { ...prev, [group.id]: nextGroup };
    });
}
function getTimeTrialAttemptCountForGroup(group) {
    return typeof normalizeAttemptCount === 'function'
        ? normalizeAttemptCount(group === null || group === void 0 ? void 0 : group.attempts)
        : Math.max(1, parseInt(group === null || group === void 0 ? void 0 : group.attempts, 10) || 1);
}
function normalizeTimeTrialEntriesForMatch(group, result) {
    if (typeof normalizeTimeTrialEntriesForResult === 'function')
        return normalizeTimeTrialEntriesForResult(group, result);
    const ids = ((group && group.fps) || []);
    const attempts = getTimeTrialAttemptCountForGroup(group);
    const source = (((result === null || result === void 0 ? void 0 : result.timeTrials) || {}));
    const out = {};
    ids.forEach(fid => {
        const list = Array.isArray(source[fid]) ? source[fid] : [];
        out[fid] = Array.from({ length: attempts }, (_, index) => ({
            mm: String((((list[index] || {}).mm) || '')).replace(/[^0-9]/g, '').slice(0, 2),
            ss: String((((list[index] || {}).ss) || '')).replace(/[^0-9]/g, '').slice(0, 2),
            ms: String((((list[index] || {}).ms) || '')).replace(/[^0-9]/g, '').slice(0, 3),
        }));
    });
    return out;
}
function isCompleteTimeTrialEntry(entry) {
    return typeof isTimeFieldEntryComplete === 'function'
        ? isTimeFieldEntryComplete(entry)
        : !!entry && String(entry.mm || '').length >= 1 && String(entry.ss || '').length >= 1 && String(entry.ms || '').length >= 1;
}
function parseTimeTrialEntry(entry) {
    if (typeof parseTimeFieldEntry === 'function')
        return parseTimeFieldEntry(entry);
    if (!isCompleteTimeTrialEntry(entry))
        return null;
    const mm = parseInt(entry.mm, 10) || 0;
    const ss = parseInt(entry.ss, 10) || 0;
    const msFrac = Number(`0.${entry.ms}`);
    return mm * 60 + ss + (Number.isFinite(msFrac) ? msFrac : 0);
}
function formatTimeTrialEntry(entry) {
    return typeof formatTimeFieldEntry === 'function'
        ? formatTimeFieldEntry(entry)
        : (isCompleteTimeTrialEntry(entry) ? `${entry.mm}:${entry.ss}.${entry.ms}` : '–');
}
function getTimeTrialPreview(group, result) {
    const ids = ((group && group.fps) || []);
    const attempts = getTimeTrialAttemptCountForGroup(group);
    const entriesByFp = normalizeTimeTrialEntriesForMatch(group, result);
    const rows = ids.map(fid => {
        const attemptsList = entriesByFp[fid] || [];
        const completeEntries = attemptsList
            .map((entry, index) => ({ entry, index, time: parseTimeTrialEntry(entry) }))
            .filter(item => item.time != null);
        const completeCount = completeEntries.length;
        const bestTime = completeEntries.length ? Math.min(...completeEntries.map(item => item.time)) : null;
        const internalRanks = {};
        if (completeEntries.length) {
            const sorted = [...completeEntries].sort((a, b) => a.time - b.time);
            sorted.forEach((item, rankIndex) => {
                internalRanks[item.index] = rankIndex + 1;
            });
        }
        const bestEntry = completeEntries.length ? [...completeEntries].sort((a, b) => a.time - b.time)[0].entry : null;
        return {
            fid,
            attempts: attemptsList,
            completeCount,
            bestTime,
            bestText: bestEntry ? formatTimeTrialEntry(bestEntry) : '–',
            internalRanks
        };
    });
    const audit = typeof getGroupScoringAudit === 'function' ? getGroupScoringAudit(group, result || {}) : null;
    const placements = (audit && audit.normalizedPlacements) || {};
    const awarded = (audit && audit.awarded) || {};
    const scoredRows = rows.filter(row => row.placement != null || row.points != null || row.bestTime != null).length;
    return {
        attempts,
        rows: rows.map(row => ({
            ...row,
            placement: placements[row.fid] != null ? placements[row.fid] : null,
            points: awarded[row.fid] != null ? awarded[row.fid] : null
        })),
        scoredRows,
        allEntered: rows.length > 0 && rows.every(row => row.completeCount > 0),
        isValid: audit ? audit.isValid : true,
        issues: audit ? audit.issues || [] : [],
        warnings: audit ? audit.warnings || [] : []
    };
}
function updateTimeTrialAttemptState(setResults, group, fid, attemptIndex, field, value) {
    const digits = field === 'ms' ? 3 : 2;
    const clean = String(value == null ? '' : value).replace(/[^0-9]/g, '').slice(0, digits);
    setResults(prev => {
        const prevGroup = (prev && prev[group.id]) || {};
        const normalized = normalizeTimeTrialEntriesForMatch(group, prevGroup);
        const list = [...(normalized[fid] || [])];
        list[attemptIndex] = { ...(list[attemptIndex] || { mm: '', ss: '', ms: '' }), [field]: clean };
        return {
            ...prev,
            [group.id]: {
                ...prevGroup,
                timeTrials: {
                    ...((prevGroup && prevGroup.timeTrials) || {}),
                    [fid]: list
                }
            }
        };
    });
}


function MatchCard({ group, idx, fps, results, setResults }) {
    const fpMap = useMemo(() => Object.fromEntries(fps.map(f => [f.id, f])), [fps]);
    const [placementFxKey, setPlacementFxKey] = useState('');
    const placementFxTimer = useRef(null);

    useEffect(() => () => {
        if (placementFxTimer.current && typeof clearTimeout === 'function') {
            clearTimeout(placementFxTimer.current);
        }
    }, []);

    const triggerPlacementFx = (key) => {
        setPlacementFxKey(key);
        if (placementFxTimer.current && typeof clearTimeout === 'function') {
            clearTimeout(placementFxTimer.current);
        }
        if (typeof setTimeout === 'function') {
            placementFxTimer.current = setTimeout(() => setPlacementFxKey(prev => prev === key ? '' : prev), 560);
        }
    };

    const placementRowClass = (key, active = false) => `placement-row${active ? ' is-selected' : ''}${placementFxKey === key ? ' is-changed' : ''}`;
    const placementSelectClass = (active = false) => `placement-select${active ? ' is-filled' : ''}`;
    const res = results[group.id] || {};

    const setP = (fid, val) => {
        updateGroupPlacementState(
            setResults,
            group,
            { placements: { ...((results[group.id] || {}).placements || {}), [fid]: val ? parseInt(val, 10) : null } },
            !!val
        );
        triggerPlacementFx(`solo:${fid}`);
    };

    const status = getMatchCompletionState(group, res);
    const done = status === 'done';

    const badge = (fp) => (
        !isSolo(fp)
            ? <span style={{ fontSize: 7, fontFamily: 'var(--fd)', fontWeight: 700, color: '#8a6000', background: '#fff8dc', border: '1px solid #f5c518', borderRadius: 3, padding: '1px 3px' }}>T</span>
            : <span style={{ fontSize: 7, fontFamily: 'var(--fd)', fontWeight: 700, color: '#5050c0', background: '#f0f0ff', border: '1px solid #c0c0ee', borderRadius: 3, padding: '1px 3px' }}>S</span>
    );

    if (group.teamMode) {
        const sz = group.teamSize;
        const teams = Array.from({ length: Math.ceil(group.fps.length / sz) }, (_, ti) => group.fps.slice(ti * sz, (ti + 1) * sz));

        return (
            <div className={`mc time-trial-card${done ? ' done' : ''}`} style={{ '--match-order': idx }}>
                <MatchHeader title={`Match ${idx + 1}`} track={group.track} status={status} />
                {teams.map((team, ti) => {
                    const teamPlacements = typeof normalizeTeamPlacementsForResult === 'function'
                        ? normalizeTeamPlacementsForResult(group, res)
                        : (res.teamPlacements || {});
                    const teamPl = teamPlacements[ti] ?? '';
                    const takenT = teams.map((_, i) => teamPlacements[i]).filter((v, i) => i !== ti && v != null);
                    const tpc = teamPl === 1 ? '#c8960a' : teamPl === 2 ? '#888' : teamPl === 3 ? '#9a5000' : 'var(--muted)';

                    return (
                        <div
                            key={ti}
                            className={placementRowClass(`team:${ti}`, !!teamPl)}
                            style={{ borderBottom: '1.5px solid #d9ddea', paddingBottom: 4, marginBottom: 4 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: 8, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' }}>
                                    Team {ti + 1}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    {teamPl && (
                                        <span style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 11, color: tpc }}>
                                            {teamPl === 1 ? '🥇' : teamPl === 2 ? '🥈' : teamPl === 3 ? '🥉' : `${teamPl}.`}
                                        </span>
                                    )}
                                    <select
                                        className={placementSelectClass(!!teamPl)}
                                        style={{ width: 40, fontSize: 11, padding: '2px', border: '1px solid var(--bord2)', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
                                        value={teamPl}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            updateGroupPlacementState(
                                                setResults,
                                                group,
                                                { teamPlacements: { ...((results[group.id] || {}).teamPlacements || {}), [ti]: v ? parseInt(v, 10) : null } },
                                                !!v
                                            );
                                            triggerPlacementFx(`team:${ti}`);
                                        }}
                                    >
                                        <option value="">–</option>
                                        {teams.map((_, i) => {
                                            const disabled = takenT.includes(i + 1);
                                            return (
                                                <option key={i + 1} value={i + 1} disabled={disabled}>
                                                    {i + 1}.{disabled ? '✗' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            {team.map((fid) => {
                                const fp = fpMap[fid];
                                if (!fp) return null;
                                const subText = fpLines(fp).join(' · ');

                                return (
                                    <div key={fid} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, padding: '3px 0', minWidth: 0 }}>
                                        <div className="match-player-line">
                                            <span className="match-player-name" title={fpShort(fp)}>{fpShort(fp)}</span>
                                            {badge(fp)}
                                        </div>
                                        {subText && <span className="match-player-sub" title={subText}>{subText}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (shouldUseCompactPlacementCard(group)) {
        return (
            <CompactPlacementCard
                group={group}
                idx={idx}
                fps={fps}
                results={results}
                setResults={setResults}
                status={status}
                fpShort={fpShort}
                fpLines={fpLines}
                updateGroupPlacementState={updateGroupPlacementState}
            />
        );
    }

    if (((group?.timeTrial === true) || (typeof isTimeTrialMode === 'function' ? isTimeTrialMode(group) : false)) && !group.teamMode) {
        const preview = getTimeTrialPreview(group, res);

        return (
            <div className={`mc${done ? ' done' : ''}`}>
                <MatchHeader title={`Match ${idx + 1}`} track={group.track} status={status} />
                {preview.rows.map((row) => {
                    const fp = fpMap[row.fid];
                    if (!fp) return null;

                    const pl = row.placement;
                    const pts = row.points;
                    const pc = pl === 1 ? '#c8960a' : pl === 2 ? '#888' : pl === 3 ? '#9a5000' : 'var(--muted)';
                    const subText = fpLines(fp).join(' · ');

                    return (
                        <div
                            key={row.fid}
                            className={`placement-row time-trial-row${pl ? ' is-selected' : ''}`}
                            style={{ display: 'flex', alignItems: 'stretch', padding: '6px 0', borderBottom: '1.5px solid #d9ddea', gap: 8 }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="match-player-line">
                                    {pl && (
                                        <span style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 12, color: pc, minWidth: 18, flexShrink: 0 }}>
                                            {pl}.
                                        </span>
                                    )}
                                    <span className="match-player-name" title={fpShort(fp)}>{fpShort(fp)}</span>
                                    {badge(fp)}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 5 }}>
                                    {row.attempts.map((attempt, attemptIndex) => {
                                        const attemptRank = row.internalRanks ? row.internalRanks[attemptIndex] : null;
                                        const attemptRankColor = attemptRank === 1 ? '#c8960a' : attemptRank === 2 ? '#888' : attemptRank === 3 ? '#9a5000' : 'var(--muted)';

                                        return (
                                            <div key={`${row.fid}_${attemptIndex}`} className="tt-attempt-row" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                                                <span style={{ fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: .7, color: 'var(--muted)', minWidth: 28 }}>
                                                    V{attemptIndex + 1}
                                                </span>
                                                <input
                                                    className="tt-input"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    maxLength={2}
                                                    placeholder="00"
                                                    value={attempt.mm}
                                                    onChange={(ev) => updateTimeTrialAttemptState(setResults, group, row.fid, attemptIndex, 'mm', ev.target.value)}
                                                    aria-label={`${fpShort(fp)} Versuch ${attemptIndex + 1} Minuten`}
                                                    style={{ width: 36, textAlign: 'center', padding: '4px 3px', fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 12 }}
                                                />
                                                <span style={{ color: 'var(--ds)', fontWeight: 900, fontSize: 14 }}>:</span>
                                                <input
                                                    className="tt-input"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    maxLength={2}
                                                    placeholder="00"
                                                    value={attempt.ss}
                                                    onChange={(ev) => updateTimeTrialAttemptState(setResults, group, row.fid, attemptIndex, 'ss', ev.target.value)}
                                                    aria-label={`${fpShort(fp)} Versuch ${attemptIndex + 1} Sekunden`}
                                                    style={{ width: 36, textAlign: 'center', padding: '4px 3px', fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 12 }}
                                                />
                                                <span style={{ color: 'var(--ds)', fontWeight: 900, fontSize: 14 }}>.</span>
                                                <input
                                                    className="tt-input tt-input-ms"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    maxLength={3}
                                                    placeholder="000"
                                                    value={attempt.ms}
                                                    onChange={(ev) => updateTimeTrialAttemptState(setResults, group, row.fid, attemptIndex, 'ms', ev.target.value)}
                                                    aria-label={`${fpShort(fp)} Versuch ${attemptIndex + 1} Millisekunden`}
                                                    style={{ width: 44, textAlign: 'center', padding: '4px 3px', fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 12 }}
                                                />
                                                {attemptRank ? (
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            borderRadius: 999,
                                                            border: `1px solid ${attemptRank === 1 ? '#f5c518' : attemptRank === 2 ? '#d0d0d0' : '#d4a97a'}`,
                                                            background: attemptRank === 1 ? '#fff8dc' : attemptRank === 2 ? '#fafafa' : '#fdf9f5',
                                                            color: attemptRankColor,
                                                            padding: '2px 6px',
                                                            fontSize: 9,
                                                            fontFamily: 'var(--fd)',
                                                            fontWeight: 800,
                                                            lineHeight: 1
                                                        }}
                                                    >
                                                        #{attemptRank}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>–</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {subText && (
                                    <div className="match-player-sub" title={subText} style={{ marginTop: 5 }}>
                                        {subText}
                                    </div>
                                )}
                            </div>

                            <div style={{ minWidth: 88, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 4, paddingRight: 2 }}>
                                <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--fd)', letterSpacing: .7, textTransform: 'uppercase' }}>Bestzeit</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: 12, fontWeight: 800, color: row.bestTime != null ? '#8a6000' : 'var(--muted)' }}>{row.bestText}</div>
                                <div style={{ fontSize: 10, color: pts != null ? '#8a6000' : 'var(--muted)', textAlign: 'right' }}>{pl ? `${pl}. Platz` : '—'}</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: 11, fontWeight: 800, color: pts != null ? '#8a6000' : 'var(--muted)' }}>{pts != null ? `${pts}p` : '–'}</div>
                            </div>
                        </div>
                    );
                })}

                <div style={{ paddingTop: 6, fontSize: 10, color: preview.isValid ? (preview.scoredRows > 0 ? 'var(--green)' : 'var(--muted)') : 'var(--red)' }}>
                    {!preview.isValid
                        ? (preview.issues[0] || '⚠ Bestzeiten enthalten Gleichstand und können noch nicht gewertet werden.')
                        : preview.scoredRows > 0
                            ? `✓ Live-Wertung aktiv · ${preview.scoredRows}/${preview.rows.length} Fahrerplätze aktuell mit Zeit in der Wertung.`
                            : `Noch keine Zeit eingetragen · maximal ${preview.attempts} Versuch${preview.attempts === 1 ? '' : 'e'} pro Fahrerplatz.`}
                </div>
            </div>
        );
    }

    return (
        <div className={`mc${done ? ' done' : ''}`} style={{ '--match-order': idx }}>
            <MatchHeader title={`Match ${idx + 1}`} track={group.track} status={status} />
            {group.fps.map((fid) => {
                const fp = fpMap[fid];
                if (!fp) return null;

                const pl = (res.placements || {})[fid] ?? '';
                const taken = group.fps.filter(id => id !== fid).map(id => (res.placements || {})[id]).filter(Boolean);
                const pts = pl ? (group.points[pl - 1] ?? 0) : null;
                const pc = pl === 1 ? '#c8960a' : pl === 2 ? '#888' : pl === 3 ? '#9a5000' : 'var(--muted)';
                const subText = fpLines(fp).join(' · ');

                return (
                    <div
                        key={fid}
                        className={placementRowClass(`solo:${fid}`, !!pl)}
                        style={{ display: 'flex', alignItems: 'center', padding: '4px 0', borderBottom: '1.5px solid #d9ddea', gap: 6 }}
                    >
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {pl && (
                                <span style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 12, color: pc, minWidth: 18, flexShrink: 0 }}>
                                    {pl}.
                                </span>
                            )}
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="match-player-line">
                                    <span className="match-player-name" title={fpShort(fp)}>{fpShort(fp)}</span>
                                    {badge(fp)}
                                </div>
                                {subText && <div className="match-player-sub" title={subText}>{subText}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {pts !== null && (
                                <span style={{ fontFamily: 'var(--fd)', fontSize: 10, color: '#8a6000', minWidth: 24, textAlign: 'right', fontWeight: 800 }}>
                                    {pts}p
                                </span>
                            )}
                            <select
                                className={placementSelectClass(!!pl)}
                                style={{ width: 48, fontSize: 11, padding: '3px 2px', border: '2px solid #9099c0', borderRadius: 6, background: '#eef1ff', cursor: 'pointer', fontWeight: 700, color: '#1a1a3e' }}
                                value={pl}
                                onChange={(e) => setP(fid, e.target.value)}
                            >
                                <option value="">–</option>
                                {group.fps.map((_, i) => {
                                    const disabled = taken.includes(i + 1);
                                    return (
                                        <option key={i + 1} value={i + 1} disabled={disabled}>
                                            {i + 1}.{disabled ? '✗' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Spielplan Tab ─────────────────────────────────────────────────────────────
function SpielplanTab({ fps, consoles, schedule, setSchedule, results, setResults, stechenBlocks, setStechenBlocks, stechenTimes, setStechenTimes, trackEnabled, spTab, setSpTab, password, requestConfirm }) {
    var _a;
    const enabled = useMemo(() => consoles.filter(c => c.enabled && c.modes.some(m => m.enabled)), [consoles]);
    const cid = (spTab && spTab !== 'stechen') ? spTab : ((!spTab || spTab === 'stechen') ? (_a = enabled[0]) === null || _a === void 0 ? void 0 : _a.id : null);
    const currentConsole = useMemo(() => consoles.find(c => c.id === cid) || enabled.find(c => c.id === cid) || null, [consoles, enabled, cid]);
    const sessions = useMemo(() => schedule ? schedule.filter(s => s.consoleId === cid) : [], [schedule, cid]);
    const tot = useMemo(() => schedule ? schedule.reduce((s, x) => s + x.groups.length, 0) : 0, [schedule]);
    const don = useMemo(() => { if (!schedule)
        return 0; return schedule.reduce((s, x) => s + x.groups.filter(g => { const r = results[g.id]; return r && (typeof isScoredGroupResultComplete === 'function' ? isScoredGroupResultComplete(g, r) : (() => { const nT = Math.ceil(g.fps.length / (g.teamSize || 1)); return g.teamMode ? Object.keys((r === null || r === void 0 ? void 0 : r.teamPlacements) || {}).filter(k => r.teamPlacements[k] != null).length >= nT : g.fps.every(id => ((r === null || r === void 0 ? void 0 : r.placements) || {})[id] != null); })()); }).length, 0); }, [schedule, results]);
    function doGen() { if (fps.length < 2)
        return alert('Mindestens 2 Fahrerplätze!'); setStechenBlocks([]); setStechenTimes({}); setResults({}); setSchedule(buildSchedule(fps, consoles, trackEnabled)); }
    const gen = () => requestConfirm(doGen, schedule ? 'regenerate' : 'generate');
    if (!schedule)
        return (React.createElement("div", { style: { background: '#fff', border: '2px dashed #ffaaaa', borderRadius: 12, padding: 48, textAlign: 'center' } },
            React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 700, color: 'var(--dk)', marginBottom: 10 } }, "\uD83C\uDFC1 Spielplan generieren"),
            React.createElement("div", { style: { color: 'var(--ds)', fontSize: 14, marginBottom: 24 } }, "Fahrerpl\u00E4tze eintragen \u00B7 Konsolen konfigurieren \u00B7 dann hier generieren."),
            React.createElement("button", { className: "btn bp", style: { fontSize: 13, padding: '12px 28px' }, onClick: gen }, "\uD83C\uDFAE Spielplan generieren"),
            React.createElement("div", { style: { color: 'var(--muted)', fontSize: 12, marginTop: 12 } },
                fps.length,
                " Fahrerpl\u00E4tze \u00B7 ",
                enabled.reduce((s, c) => s + c.modes.filter(m => m.enabled).length, 0),
                " aktive Modi")));
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex fjb fca mb3", style: { flexWrap: 'wrap', gap: 10 } },
            React.createElement("div", { className: "flex fca g3" },
                React.createElement("span", { className: "chip" },
                    don,
                    "/",
                    tot,
                    " Matches"),
                React.createElement("div", { className: "pbar" },
                    React.createElement("div", { className: "pbfill", style: { width: `${tot ? don / tot * 100 : 0}%` } })),
                don === tot && tot > 0 && React.createElement("span", { className: "chip chip-g" }, "\u2713 Fertig!")),
            React.createElement("div", { className: "flex g2", style: { flexWrap: 'wrap' } },
                spTab !== 'stechen' && spTab !== 'begegnungen' && sessions.length > 0 && React.createElement(React.Fragment, null,
                    React.createElement("button", { className: "btn bs bsm", onClick: () => exportSchedulePdf({ sessions, fps, consoleName: (currentConsole === null || currentConsole === void 0 ? void 0 : currentConsole.name) || 'Spielplan', consoleEmoji: (currentConsole === null || currentConsole === void 0 ? void 0 : currentConsole.emoji) || '', includeTracks: true }) }, "\uD83E\uDDFE PDF mit Strecke"),
                    React.createElement("button", { className: "btn bs bsm", onClick: () => exportSchedulePdf({ sessions, fps, consoleName: (currentConsole === null || currentConsole === void 0 ? void 0 : currentConsole.name) || 'Spielplan', consoleEmoji: (currentConsole === null || currentConsole === void 0 ? void 0 : currentConsole.emoji) || '', includeTracks: false }) }, "\uD83E\uDDFE PDF ohne Strecke")),
                React.createElement("button", { className: "btn bs bsm", onClick: gen }, "\uD83D\uDD04 Neu"),
                React.createElement("button", { className: "btn bd bsm", onClick: () => requestConfirm(() => { setSchedule(null); setResults({}); setStechenBlocks([]); setStechenTimes({}); }, 'regenerate') }, "\u2715 Reset"))),
        React.createElement("div", { className: "sn", style: { justifyContent: 'space-between' } },
            React.createElement("div", { style: { display: 'flex', gap: 5, flexWrap: 'wrap' } },
                enabled.map(con => { const ss = schedule.filter(s => s.consoleId === con.id); const t = ss.reduce((s, x) => s + x.groups.length, 0); const d = ss.reduce((s, x) => s + x.groups.filter(g => { const r = results[g.id]; return r && (typeof isScoredGroupResultComplete === 'function' ? isScoredGroupResultComplete(g, r) : (() => { const nT = Math.ceil(g.fps.length / (g.teamSize || 1)); return g.teamMode ? Object.keys((r === null || r === void 0 ? void 0 : r.teamPlacements) || {}).filter(k => r.teamPlacements[k] != null).length >= nT : g.fps.every(id => ((r === null || r === void 0 ? void 0 : r.placements) || {})[id] != null); })()); }).length, 0); return React.createElement("button", { key: con.id, className: `snb${cid === con.id && spTab !== 'stechen' && spTab !== 'begegnungen' ? ' on' : ''}`, onClick: () => setSpTab(con.id) },
                con.emoji,
                " ",
                con.name,
                " ",
                React.createElement("span", { style: { opacity: .7, marginLeft: 3, fontSize: 9 } },
                    d,
                    "/",
                    t)); }),
            React.createElement("button", { className: `snb${spTab === 'stechen' ? ' on' : ''}`, style: { borderColor: 'rgba(230,0,18,.4)', color: spTab === 'stechen' ? 'white' : 'var(--red)', background: spTab === 'stechen' ? 'var(--red)' : 'rgba(230,0,18,.06)' }, onClick: () => setSpTab('stechen') }, "\u26A1 Stechen")),
            React.createElement("button", { className: `snb${spTab === 'begegnungen' ? ' on' : ''}`, style: { borderColor: 'rgba(0,100,200,.4)', color: spTab === 'begegnungen' ? 'white' : 'var(--blue,#1060c0)', background: spTab === 'begegnungen' ? 'var(--blue,#1060c0)' : 'rgba(0,100,200,.06)', flexShrink: 0 }, onClick: () => setSpTab('begegnungen') }, "\uD83E\uDD1D Begegnungen")),
        spTab === 'begegnungen' && React.createElement(BegegnungenTab, { fps: fps, schedule: schedule, results: results }),
        spTab === 'stechen' && React.createElement(StechenTab, { fps: fps, schedule: schedule, results: results, stechenBlocks: stechenBlocks, setStechenBlocks: setStechenBlocks, stechenTimes: stechenTimes, setStechenTimes: setStechenTimes }),
        spTab !== 'stechen' && spTab !== 'begegnungen' && (() => {
            const rows = [sessions];
            return (React.createElement("div", { className: "schedule-board" }, rows.map((row, rowIdx) => (React.createElement("div", { key: `session_row_${rowIdx}`, className: "schedule-row" },
                row.map((sess, sessIdx) => (React.createElement(ScheduleSessionCard, { key: sess.id, sess: sess, fps: fps, results: results, setResults: setResults, currentConsole: currentConsole, order: rowIdx * 8 + sessIdx, getScheduleThemeId: getScheduleThemeId, getScheduleTrackPreview: getScheduleTrackPreview, getScheduleThemeHint: getScheduleThemeHint, MatchCardComponent: MatchCard }))),
                null)))));
        })()));
}

function StechenTab({ fps, schedule, results, stechenBlocks, setStechenBlocks, stechenTimes, setStechenTimes }) {
    const allTeams = useMemo(() => [...new Set(fps.map(f => f.teamName).filter(Boolean))], [fps]);
    const rankingBase = useMemo(() => computeRankingCore(fps, schedule, results, [], {}), [fps, schedule, results]);
    const fpPts = useMemo(
        () => Object.fromEntries(
            ((rankingBase?.gesamtEntries) || [])
                .filter(e => e?.type === 'solo')
                .map(e => [String(e?.fp?.id || e?.fpId || ''), Number(e.pts) || 0])
        ),
        [rankingBase]
    );
    const teamPts = useMemo(
        () => Object.fromEntries(((rankingBase?.teamRank) || []).map(entry => [entry.t, Number(entry.pts) || 0])),
        [rankingBase]
    );
    const conPts = rankingBase?.conPts || {};
    const tracksIndex = typeof TRACKS !== 'undefined' && TRACKS ? TRACKS : {};
    const stechenScale = Array.isArray(typeof STECHEN_PTS !== 'undefined' ? STECHEN_PTS : null)
        ? STECHEN_PTS
        : [3, 2, 1];
    const resolveStechenPts = typeof stechenPts === 'function'
        ? stechenPts
        : (rank) => stechenScale[rank - 1] ?? 0;

    function findTies() {
        const newBlocks = [];

        function tieGroups(entries) {
            const byPts = {};
            entries.forEach((entry) => {
                const key = entry.pts;
                if (!byPts[key]) byPts[key] = [];
                byPts[key].push(entry);
            });
            return Object.entries(byPts)
                .filter(([, arr]) => arr.length > 1 && parseFloat(arr[0].pts) > 0)
                .map(([pts, entries]) => ({ pts: parseFloat(pts), entries }));
        }

        const soloEntries = fps
            .filter(f => !f.teamName)
            .map(f => ({ label: fpName(f), sub: fpLines(f).join(' · '), pts: fpPts[f.id] || 0, key: `s${f.id}` }));

        const teamEntries = allTeams.map((team) => ({
            label: team,
            sub: fps.filter(f => f.teamName === team).map(f => fpShort(f)).join(' · '),
            pts: teamPts[team] || 0,
            key: `t${team}`,
        }));

        tieGroups([...soloEntries, ...teamEntries]).forEach(({ pts, entries }) => {
            newBlocks.push({ id: `gesamt_${pts}`, title: 'Gesamtranking', pts, entries, fixedConsole: null });
        });

        tieGroups(
            fps.filter(f => !f.teamName).map(f => ({
                label: fpName(f),
                sub: fpLines(f).join(' · '),
                pts: fpPts[f.id] || 0,
                key: `s${f.id}`,
            }))
        ).forEach(({ pts, entries }) => {
            newBlocks.push({ id: `solo_${pts}`, title: 'Einzelwertung', pts, entries, fixedConsole: null });
        });

        tieGroups(
            allTeams.map((team) => ({
                label: team,
                sub: fps.filter(f => f.teamName === team).map(f => fpShort(f)).join(' · '),
                pts: teamPts[team] || 0,
                key: `t${team}`,
            }))
        ).forEach(({ pts, entries }) => {
            newBlocks.push({ id: `team_${pts}`, title: 'Teamwertung', pts, entries, fixedConsole: null });
        });

        if (schedule) {
            [...new Set(schedule.map(s => s.consoleId))].forEach((cid) => {
                const sess = schedule.find(s => s.consoleId === cid);
                const conName = sess?.consoleName || cid;
                const trackKey = Object.keys(tracksIndex).find(key => tracksIndex[key].name === conName) || cid;

                tieGroups(
                    fps.map(f => ({
                        label: fpName(f),
                        sub: fpLines(f).join(' · '),
                        pts: (conPts[cid] || {})[f.id] || 0,
                        key: `c${cid}_${f.id}`,
                    }))
                ).forEach(({ pts, entries }) => {
                    newBlocks.push({
                        id: `con_${cid}_${pts}`,
                        title: `Konsolenranking: ${conName}`,
                        pts,
                        entries,
                        fixedConsole: trackKey,
                    });
                });
            });
        }

        const seen = new Set();
        const unique = newBlocks.filter((block) => {
            if (seen.has(block.id)) return false;
            seen.add(block.id);
            return true;
        });

        return unique.map((block) => {
            if (block.fixedConsole) {
                const tracks = tracksIndex[block.fixedConsole]?.tracks || [];
                return { ...block, drawnConsole: block.fixedConsole, drawnTrack: tracks.length ? pickRandom(tracks) : '?' };
            }

            const availableConsoles = Object.keys(tracksIndex);
            const drawnConsole = availableConsoles.length ? pickRandom(availableConsoles) : null;
            const drawnTrack = drawnConsole ? pickRandom((tracksIndex[drawnConsole]?.tracks) || []) : '?';
            return { ...block, drawnConsole, drawnTrack };
        });
    }

    const basePtsKey = useMemo(() => JSON.stringify({ fpPts, teamPts, conPts }), [fpPts, teamPts, conPts]);

    useEffect(() => {
        if (!schedule) return;
        const newBlocks = findTies();
        setStechenBlocks((prev) => {
            const existingIds = new Set(prev.map(b => b.id));
            const toAdd = newBlocks.filter(b => !existingIds.has(b.id));
            return toAdd.length ? [...prev, ...toAdd] : prev;
        });
    }, [basePtsKey]);

    function rerollBlock(blockId) {
        setStechenBlocks((prev) => prev.map((block) => {
            if (block.id !== blockId) return block;
            if (block.fixedConsole) {
                const tracks = tracksIndex[block.fixedConsole]?.tracks || [];
                return { ...block, drawnTrack: tracks.length ? pickRandom(tracks) : '?' };
            }
            const availableConsoles = Object.keys(tracksIndex);
            const drawnConsole = availableConsoles.length ? pickRandom(availableConsoles) : null;
            const drawnTrack = drawnConsole ? pickRandom((tracksIndex[drawnConsole]?.tracks) || []) : '?';
            return { ...block, drawnConsole, drawnTrack };
        }));
    }

    function setTime(blockId, key, field, value) {
        setStechenTimes((prev) => ({
            ...prev,
            [blockId]: {
                ...(prev[blockId] || {}),
                [key]: {
                    ...((prev[blockId]?.[key]) || { mm: '', ss: '', ms: '' }),
                    [field]: value,
                },
            },
        }));
    }

    if (!schedule) {
        return (
            <div className="alert alert-i">
                <div>Standardordner in diesem Paket: ./Speicher</div>
                ℹ️ Spielplan generieren und Ergebnisse eintragen, dann können Gleichstände erkannt werden.
            </div>
        );
    }

    return (
        <div>
            {stechenBlocks.length === 0 && (
                <div className="alert" style={{ background: '#e8f4ff', borderColor: '#90c0ff', color: '#1040a0', borderLeft: '4px solid #4080ff' }}>
                    ℹ️{' '}
                    <span>
                        Noch keine Rennen aufgelistet. Gleichstände werden automatisch erkannt sobald Ergebnisse im Spielplan eingetragen sind.{' '}
                        <strong>Punkteschlüssel:</strong> {stechenScale.map((p, i) => `${i + 1}. Platz = ${p} P`).join(' · ')}
                    </span>
                </div>
            )}

            {stechenBlocks.map((block) => {
                const trackGroup = block.drawnConsole ? tracksIndex[block.drawnConsole] : null;
                const blockTimes = stechenTimes[block.id] || {};

                const parseT = (timeValue) => {
                    if (!timeValue) return null;
                    const mm = parseInt(timeValue.mm) || 0;
                    const ss = parseInt(timeValue.ss) || 0;
                    const ms = parseInt(timeValue.ms) || 0;
                    if (timeValue.mm === '' && timeValue.ss === '' && timeValue.ms === '') return null;
                    return mm * 60 + ss + ms / 1000;
                };

                const withParsed = [...block.entries].map((entry) => {
                    const tv = blockTimes[entry.key] || { mm: '', ss: '', ms: '' };
                    return { ...entry, tv, parsed: parseT(tv) };
                });

                const allTimesIn = withParsed.every(entry => entry.parsed !== null);
                const anyTime = withParsed.some(entry => entry.parsed !== null);
                const sorted = allTimesIn ? [...withParsed].sort((a, b) => a.parsed - b.parsed) : [...withParsed];

                const pc = (rank) => rank === 1 ? '#c8960a' : rank === 2 ? '#888' : rank === 3 ? '#9a5000' : 'var(--muted)';
                const bg = (rank) => rank === 1 ? '#fffdf0' : rank === 2 ? '#fafafa' : rank === 3 ? '#fdf9f5' : '#fff';

                return (
                    <div key={block.id} className="card" style={{ borderLeft: '3px solid var(--red)', marginBottom: 14 }}>
                        <div className="card-hdr">
                            <div>
                                <div className="ctitle" style={{ marginBottom: 4 }}>
                                    ⚡ {block.title}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--ds)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <span>{block.entries.length} Fahrer im Gleichstand</span>
                                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>{block.pts} Punkte</span>
                                    {block.fixedConsole && <span style={{ color: 'var(--blue)' }}>Konsole: {trackGroup?.name}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ background: 'var(--card2)', border: '1.5px solid var(--bord)', borderRadius: 8, padding: '8px 14px', textAlign: 'center', minWidth: 130 }}>
                                    <div style={{ fontSize: 18, marginBottom: 2 }}>{trackGroup?.emoji}</div>
                                    <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 11, color: 'var(--dk)' }}>{trackGroup?.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--ds)', marginTop: 2, fontStyle: 'italic' }}>„{block.drawnTrack}“</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <button className="btn bs bsm" onClick={() => rerollBlock(block.id)}>🎲 Strecke neu losen</button>
                                    {!block.fixedConsole && (
                                        <button className="btn bs bsm" onClick={() => rerollBlock(block.id)}>🎲 Konsole &amp; Strecke neu</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: 'var(--card2)', borderBottom: '1.5px solid var(--bord)' }}>
                                    <th style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', width: 46 }}>Platz</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Fahrer / Team</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', width: 170 }}>Rundenzeit</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', width: 56 }}>Punkte</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((entry, index) => {
                                    const rank = anyTime && entry.parsed !== null ? sorted.indexOf(entry) + 1 : null;
                                    const points = rank ? resolveStechenPts(rank) : null;

                                    return (
                                        <tr key={entry.key} style={{ borderBottom: '1.5px solid #d9ddea', background: rank ? bg(rank) : '#fff', transition: 'background .3s' }}>
                                            <td style={{ padding: '9px 10px', fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 13, color: rank ? pc(rank) : 'var(--muted)', textAlign: 'center' }}>
                                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank ? `${rank}.` : `${index + 1}.`}
                                            </td>
                                            <td style={{ padding: '9px 12px' }}>
                                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--dk)' }}>{entry.label}</div>
                                                {entry.sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{entry.sub}</div>}
                                            </td>
                                            <td style={{ padding: '6px 10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14 }}>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="off"
                                                        spellCheck={false}
                                                        maxLength={2}
                                                        placeholder="00"
                                                        value={entry.tv.mm}
                                                        onChange={(ev) => setTime(block.id, entry.key, 'mm', ev.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                                                        aria-label={`${entry.label || entry.key} Stechen Minuten`}
                                                        style={{ width: 44, textAlign: 'center', padding: '7px 5px', fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14, MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                                                    />
                                                    <span style={{ color: 'var(--ds)', fontWeight: 900, fontSize: 16 }}>:</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="off"
                                                        spellCheck={false}
                                                        maxLength={3}
                                                        placeholder="000"
                                                        value={entry.tv.ss}
                                                        onChange={(ev) => setTime(block.id, entry.key, 'ss', ev.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                                                        aria-label={`${entry.label || entry.key} Stechen Sekunden`}
                                                        style={{ width: 52, textAlign: 'center', padding: '7px 5px', fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14 }}
                                                    />
                                                    <span style={{ color: 'var(--ds)', fontWeight: 900, fontSize: 16 }}>.</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="off"
                                                        spellCheck={false}
                                                        maxLength={3}
                                                        placeholder="000"
                                                        value={entry.tv.ms}
                                                        onChange={(ev) => setTime(block.id, entry.key, 'ms', ev.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                                                        aria-label={`${entry.label || entry.key} Stechen Millisekunden`}
                                                        style={{ width: 56, textAlign: 'center', padding: '7px 5px', fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14 }}
                                                    />
                                                </div>
                                                <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2, fontFamily: 'var(--fd)', letterSpacing: .5 }}>MM : SSS . ms</div>
                                            </td>
                                            <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 13, color: points ? 'var(--red)' : 'var(--muted)' }}>
                                                {points !== null ? `${points} P` : '–'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {allTimesIn && (
                            <div style={{ padding: '10px 14px', background: '#f0fff4', borderTop: '1px solid #b7f5c8', fontSize: 12, color: '#0a6030', fontFamily: 'var(--fd)', letterSpacing: .5 }}>
                                ✓ Alle Zeiten eingetragen – Reihenfolge automatisch ermittelt
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Rangliste ──────────────────────────────────────────────────────────────
const RANKING_SHORT_NAME = { 'snes': 'SNES', 'n64': 'N64', 'gc': 'GC', 'wii': 'Wii', 'switch': 'Switch', 'switch2': 'SW2', 'ds': 'DS', 'wiiu': 'WiiU' };
function parseStechenTimeObj(t) {
    if (!t)
        return null;
    const mm = parseInt(t.mm) || 0, ss = parseInt(t.ss) || 0, ms = parseInt(t.ms) || 0;
    if (t.mm === '' && t.ss === '' && t.ms === '')
        return null;
    return mm * 60 + ss + ms / 1000;
}
function RanglisteTab({ fps, schedule, results, consoles, stechenBlocks = [], stechenTimes = {}, onOpenPopup, onClosePopup, isPopupOpen = false, onPopupViewChange, onStartRotation, onStopRotation, isRotationActive = false }) {
    const [view, setView] = useState('gesamt');
    const [rotateSeconds, setRotateSeconds] = useState(15);
    const core = useMemo(() => computeRankingCore(fps, schedule, results, stechenBlocks, stechenTimes), [fps, schedule, results, stechenBlocks, stechenTimes]);
    const allTeams = core.allTeams;
    const conStats = core.conStats;
    const consoleOrder = core.consoleOrder;
    const gesamtEntries = core.gesamtEntries;
    const soloRank = core.soloRank;
    const teamRank = core.teamRank;
    const conRankings = core.conRankings;
    const conPts = core.conPts || {};
    const teamConPts = core.teamConPts || {};
    const rc = r => r === 1 ? '#c8960a' : r === 2 ? '#888' : r === 3 ? '#9a5000' : 'var(--muted)';
    const rcls = r => (r === 1 ? ' r1' : r === 2 ? ' r2' : r === 3 ? ' r3' : '');
    const popupViews = [['gesamt', '🏆 Gesamt'], ['solo', '👤 Einzeln'], allTeams.length > 0 && ['team', '👥 Teams'], ['konsolen', '🎮 Konsolen']].filter(Boolean);
    const rotateSecSafe = Math.max(5, Math.min(120, parseInt(rotateSeconds, 10) || 15));
    const trimRankLabel = (text, max = 20) => {
        const value = String(text || '').trim();
        return value.length > max ? value.slice(0, Math.max(1, max - 1)) + '…' : value;
    };
    // Platzhalter-Label für einen Fahrerplatz (Spieler XX, unabhängig von DB-Verknüpfung)
    const fpSlotLabel = (fp) => {
        if (!fp) return '???';
        if (fp.teamName) return fp.teamName;
        const idx = fps.indexOf(fp);
        const slotNum = idx >= 0 ? idx + 1 : 1;
        // Wenn kein DB-Spieler verknüpft → name ist schon der Platzhalter
        const p0 = fp.players && fp.players[0];
        if (!p0 || !p0.dbPlayerId) return p0 ? (p0.name || `Spieler ${String(slotNum).padStart(2,'0')}`) : `Spieler ${String(slotNum).padStart(2,'0')}`;
        // DB-verknüpft → generiere Platzhalter aus Position
        return `Spieler ${String(slotNum).padStart(2,'0')}`;
    };
    const cleanRankText = (value) => String(value == null ? '' : value).trim();
    const formatRankPerson = (person) => {
        const name = cleanRankText(person === null || person === void 0 ? void 0 : person.name);
        const nick = cleanRankText(person === null || person === void 0 ? void 0 : person.nickname);
        if (name && nick)
            return `${name} "${nick}"`;
        return name || nick || '';
    };
    const resolveRankDisplay = (e) => {
        const isTeam = e.type === 'team';
        if (isTeam) {
            const teamFps = fps.filter(f => f.teamName === e.name);
            const teamMembers = teamFps.length
                ? teamFps.flatMap(f => fpLines(f)).join(' · ')
                : (e.sub || '');
            return { title: trimRankLabel(e.name || 'Team', 20), subtitle: teamMembers || (e.sub || '') };
        }
        const fp = e.fp || fps.find(f => String(f.id) === String((e.fp && e.fp.id) || e.fpId || ''));
        if (fp) {
            const p0 = fp.players && fp.players[0];
            const slotName = fpSlotLabel(fp);       // z.B. "Spieler 01"
            const nickname = (p0 && p0.nickname) ? p0.nickname : null;
            const realName = (p0 && p0.dbPlayerId) ? (p0.name || '') : null;
            // Zeile 1: Spitzname wenn vorhanden, sonst Platzhalter-Name
            const title = nickname || slotName;
            // Zeile 2: Realname wenn DB-verknüpft (und Spitzname in Zeile 1), sonst Realname wenn anders als Zeile 1
            const subtitle = nickname ? realName || '' : (realName && realName !== title ? realName : (fpLines(fp).join(' · ') || ''));
            return { title: trimRankLabel(title, 24), subtitle };
        }
        return { title: trimRankLabel(e.name || '', 20), subtitle: e.sub || '' };
    };
    const resolveConsoleRankDisplay = (fp) => {
        if (!fp)
            return { title: '???', subtitle: '' };
        const players = Array.isArray(fp.players) ? fp.players.filter(Boolean) : [];
        const first = players[0] || {};
        const firstName = cleanRankText(first.name);
        const firstNick = cleanRankText(first.nickname);
        const teamName = cleanRankText(fp.teamName);
        const title = teamName
            ? trimRankLabel(teamName, 26)
            : trimRankLabel(firstNick || firstName || fpSlotLabel(fp), 26);
        return { title, subtitle: '' };
    };
    const getConsoleProgressLabel = (fpId, cid) => {
        const st = (((conStats === null || conStats === void 0 ? void 0 : conStats[fpId]) || {})[cid]) || { done: 0, total: 0 };
        return {
            done: !!st.total && st.done === st.total,
            text: `${st.done || 0}/${st.total || 0} Konsole`
        };
    };
    const soloRankPositions = useMemo(() => Object.fromEntries((soloRank || []).map(fp => [String((((fp === null || fp === void 0 ? void 0 : fp.fp) || fp).id || '')), fp.rank])), [soloRank]);
    const teamRankPositions = useMemo(() => Object.fromEntries((teamRank || []).map(t => [t.t, t.rank])), [teamRank]);
    const soloConsoleLeaderMap = useMemo(() => {
        const map = {};
        consoleOrder.forEach(cid => {
            const entries = Object.entries((conPts === null || conPts === void 0 ? void 0 : conPts[cid]) || {});
            const maxPts = Math.max(0, ...entries.map(([, pts]) => Number(pts) || 0));
            if (!maxPts)
                return;
            entries.forEach(([fid, pts]) => {
                if ((Number(pts) || 0) === maxPts) {
                    if (!map[fid])
                        map[fid] = {};
                    map[fid][cid] = true;
                }
            });
        });
        return map;
    }, [consoleOrder, conPts]);
    const teamConsoleLeaderMap = useMemo(() => {
        const map = {};
        consoleOrder.forEach(cid => {
            const entries = Object.entries((teamConPts === null || teamConPts === void 0 ? void 0 : teamConPts[cid]) || {});
            const maxPts = Math.max(0, ...entries.map(([, pts]) => Number(pts) || 0));
            if (!maxPts)
                return;
            entries.forEach(([teamName, pts]) => {
                if ((Number(pts) || 0) === maxPts) {
                    if (!map[teamName])
                        map[teamName] = {};
                    map[teamName][cid] = true;
                }
            });
        });
        return map;
    }, [consoleOrder, teamConPts]);
    const getOverallSubtitle = (e, fallbackSubtitle) => {
        if (view !== 'gesamt')
            return fallbackSubtitle;
        if ((e === null || e === void 0 ? void 0 : e.type) === 'team') {
            const rank = teamRankPositions[e.name];
            return rank ? `Teamwertung · Platz ${rank}` : 'Teamwertung';
        }
        const fpId = String((((e === null || e === void 0 ? void 0 : e.fp) || {}).id) || (e === null || e === void 0 ? void 0 : e.fpId) || '');
        const rank = soloRankPositions[fpId];
        return rank ? `Einzelwertung · Platz ${rank}` : 'Einzelwertung';
    };
    useEffect(() => {
        if (isPopupOpen && onPopupViewChange)
            onPopupViewChange(view);
    }, [view, isPopupOpen, onPopupViewChange]);
    if (!schedule)
        return React.createElement("div", { className: "alert alert-i" },
                    React.createElement("div", null, "Standardordner in diesem Paket: ./Speicher"), "\u2139\uFE0F Spielplan generieren, dann erscheint die Rangliste.");
    const Entry = ({ e }) => {
        var _a;
        const fpId = (_a = e.fp) === null || _a === void 0 ? void 0 : _a.id;
        const myStats = fpId ? conStats[fpId] : {};
        const rcolor = rc(e.rank);
        const isTeam = e.type === 'team';
        const teamFps = fps.filter(f => f.teamName === e.name);
        const teamStats = {};
        if (isTeam) {
            consoleOrder.forEach(cid => { let done = 0, total = 0; teamFps.forEach(f => { const st = (conStats[f.id] || {})[cid] || { done: 0, total: 0 }; done += st.done; total += st.total; }); teamStats[cid] = { done, total }; });
        }
        const statsToShow = fpId ? myStats : teamStats;
        const display = resolveRankDisplay(e);
        const subtitleText = getOverallSubtitle(e, display.subtitle);
        const leaderFlags = isTeam ? ((teamConsoleLeaderMap === null || teamConsoleLeaderMap === void 0 ? void 0 : teamConsoleLeaderMap[e.name]) || {}) : ((soloConsoleLeaderMap === null || soloConsoleLeaderMap === void 0 ? void 0 : soloConsoleLeaderMap[String(fpId)]) || {});
        const pointText = Number.isInteger(e.pts) ? e.pts : e.pts.toFixed(1);
        const rankLabel = e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : `#${e.rank}`;
        return (React.createElement("div", { className: `rnk-entry${rcls(e.rank)}` },
            React.createElement("div", { className: "rnk-b1" },
                React.createElement("span", { className: "rnum", style: { color: rcolor } }, rankLabel)),
            React.createElement("div", { className: "rnk-b2" },
                React.createElement("div", { className: "rnk-b2-top" },
                    React.createElement("div", { className: "rnk-b2-left" },
                        React.createElement("span", { className: "rname" }, display.title),
                        isTeam
                            ? React.createElement("span", { className: "rnk-typetag team" }, "T")
                            : React.createElement("span", { className: "rnk-typetag solo" }, "S")),
                    Object.keys(statsToShow).length > 0 && consoleOrder.length > 0
                        ? React.createElement("div", { className: "rnk-b2-chips" },
                            consoleOrder.map(cid => {
                                const st = statsToShow[cid] || { done: 0, total: 0 };
                                if (!st.total) return null;
                                const all = st.done === st.total;
                                const lbl = RANKING_SHORT_NAME[cid] || cid;
                                const isLeader = view === 'gesamt' && !!leaderFlags[cid];
                                return React.createElement("span", { key: cid, className: `rnk-console-chip${all ? ' done' : ''}${isLeader ? ' leader' : ''}` }, lbl, "\u00A0", st.done, "/", st.total);
                            }))
                        : null),
                subtitleText
                    ? React.createElement("div", { className: "rsub" }, subtitleText)
                    : null),
            React.createElement("div", { className: "rnk-b3" },
                React.createElement("div", { className: "rnk-b3-inner" },
                    React.createElement("span", { className: "rpts" }, pointText),
                    React.createElement("span", { className: "rpts-p" }, "Punkte")))));
    };
    return (React.createElement("div", { className: "rangliste-wrap" },
        React.createElement("div", { className: "flex g2 mb4", style: { flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement("div", { className: "flex g2", style: { flexWrap: 'wrap' } }, popupViews.map(([k, l]) => (React.createElement("button", { key: k, className: `btn${view === k ? ' bp' : ' bs'}`, onClick: () => setView(k) }, l)))),
            React.createElement("div", { className: "flex g2", style: { flexWrap: 'wrap', alignItems: 'center' } },
                React.createElement("button", { className: "btn bs", onClick: () => onOpenPopup && onOpenPopup(view) }, "\uD83D\uDDA5\uFE0F Popup"),
                React.createElement("button", { className: "btn bs", title: "Aktuelle Ansicht als fixiertes Live-Fenster \u00F6ffnen (aktualisiert sich, Ansicht bleibt)", onClick: () => onOpenPopup && onOpenPopup(view, 'pin') }, "\uD83D\uDCCC Fixieren"),
                React.createElement("div", { className: "rank-rotate-panel" },
                    React.createElement("span", { className: "fp-player-label", style: { color: '#8a6000' } }, "Rotation"),
                    React.createElement("input", { className: "rank-rotate-input", type: "number", min: 5, max: 120, step: 1, value: rotateSeconds, onChange: e => setRotateSeconds(e.target.value), title: "Intervall in Sekunden" }),
                    React.createElement("span", { className: "fp-player-label", style: { color: '#8a6000' } }, "Sek"),
                    !isRotationActive
                        ? React.createElement("button", { className: "btn bs bsm", title: "Alle vorhandenen Rankings nacheinander im Popup anzeigen", onClick: () => onStartRotation && onStartRotation(popupViews.map(([k]) => k), rotateSecSafe, view) }, "\uD83D\uDD01 Rotation")
                        : React.createElement("button", { className: "btn bd bsm", onClick: () => onStopRotation && onStopRotation() }, "\u23F9 Stop")),
                isPopupOpen && React.createElement("button", { className: "btn bs", onClick: () => onClosePopup && onClosePopup() }, "\u2715 Popup schlie\u00DFen"))),
        view === 'gesamt' && (React.createElement("div", { className: "rnk-grid" },
                React.createElement("div", { className: "rnk-block" },
                    React.createElement("div", { className: "rnk-block-hdr" }, "\uD83C\uDFC6 Pl\u00E4tze 1\u201312"),
                    React.createElement("div", { className: "rnk-entries-wrap" }, gesamtEntries.slice(0, 12).map(e => React.createElement(Entry, { key: e.key, e: e })))),
                gesamtEntries.length > 12 && React.createElement("div", { className: "rnk-block" },
                    React.createElement("div", { className: "rnk-block-hdr" }, "Pl\u00E4tze 13\u201324"),
                    React.createElement("div", { className: "rnk-entries-wrap" }, gesamtEntries.slice(12, 24).map(e => React.createElement(Entry, { key: e.key, e: e })))))),
        view === 'solo' && (React.createElement("div", { className: "rnk-grid" },
            React.createElement("div", { className: "rnk-block" },
                React.createElement("div", { className: "rnk-block-hdr" }, "\uD83D\uDC64 Einzelwertung (1\u201312)"),
                React.createElement("div", { className: "rnk-entries-wrap" }, soloRank.slice(0, 12).map(fp => React.createElement(Entry, { key: fp.id, e: { rank: fp.rank, type: 'solo', name: fpName(fp), sub: fpSub(fp), pts: fp.pts, fp: fp.fp || fp } })))),
            soloRank.length > 12 && React.createElement("div", { className: "rnk-block" },
                React.createElement("div", { className: "rnk-block-hdr" }, "Pl\u00E4tze 13\u201324"),
                React.createElement("div", { className: "rnk-entries-wrap" }, soloRank.slice(12).map(fp => React.createElement(Entry, { key: fp.id, e: { rank: fp.rank, type: 'solo', name: fpName(fp), sub: fpSub(fp), pts: fp.pts, fp: fp.fp || fp } })))))),
        view === 'team' && allTeams.length > 0 && React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, "\uD83D\uDC65 Teamwertung")),
            teamRank.map(x => React.createElement(Entry, { key: x.t, e: { rank: x.rank, type: 'team', name: x.t, sub: x.members.flatMap(f => f.players.map(p => p.nickname ? `${p.name} "${p.nickname}"` : p.name)).join(' · '), pts: x.pts } }))),
        view === 'konsolen' && (React.createElement("div", { className: "con-grid", style: { gridTemplateColumns: `repeat(${conRankings.length}, minmax(0,1fr))` } }, conRankings.map(({ cid, emoji, name, rank }) => (React.createElement("div", { key: cid, className: "con-col" },
                React.createElement("div", { className: "con-col-hdr" }, emoji, "\u00A0", name),
                React.createElement("div", { className: "con-entries-wrap" }, rank.map(({ f, pts, rank: r }) => {
                    const rCls = r <= 3 ? ` ce-r${r}` : '';
                    const display = resolveConsoleRankDisplay(f);
                    const pointText = Number.isInteger(pts) ? String(pts) : pts.toFixed(1);
                    return React.createElement("div", { key: f.id, className: `ce${rCls}` },
                        React.createElement("div", { className: "ce-b1" },
                            React.createElement("span", { className: "cerank", style: { color: rc(r) } }, r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`)),
                        React.createElement("div", { className: "ce-b2" },
                            React.createElement("div", { className: "ce-b2-top" },
                                React.createElement("div", { className: "cename", title: display.title }, display.title))),
                        React.createElement("div", { className: "ce-b3" },
                            React.createElement("span", { className: "cepts" }, pointText),
                            React.createElement("span", { className: "cepts-p" }, "Punkte")));
                })),
                rank.every(x => x.pts === 0) && React.createElement("div", { style: { padding: '8px', color: 'var(--muted)', fontSize: 10, textAlign: 'center' } }, "–"))))))));
}

export {
  TeilnehmerTab,
  KonsolenTab,
  StreckenTab,
  SpeichernTab,
  BegegnungenTab,
  getMatchCompletionState,
  getMatchAmpelColors,
  getScheduleThemeId,
  getScheduleThemeHint,
  getScheduleTrackPreview,
  ScheduleSessionCard,
  MatchHeader,
  shouldUseCompactPlacementCard,
  CompactPlacementCard,
  autoCompletePlacementsForGroup,
  updateGroupPlacementState,
  getTimeTrialAttemptCountForGroup,
  normalizeTimeTrialEntriesForMatch,
  isCompleteTimeTrialEntry,
  parseTimeTrialEntry,
  formatTimeTrialEntry,
  getTimeTrialPreview,
  updateTimeTrialAttemptState,
  MatchCard,
  SpielplanTab,
  StechenTab,
  parseStechenTimeObj,
  RanglisteTab,
  RANKING_SHORT_NAME,
};
