import React from 'react';

const { useState, useEffect, useMemo, useRef } = React;

function App() {
    const [fps, setFps] = useState(mkFps(24));
    const [cons, setCons] = useState(() => normalizeConsoles(DEFAULT_CONSOLES.map(c => ({ ...c, modes: c.modes.map(m => ({ ...m })) }))));
    const [schedule, setSchedule] = useState(null);
    const [results, setResults] = useState({});
    const [stechenBlocks, setStechenBlocks] = useState([]);
    const [stechenTimes, setStechenTimes] = useState({});
    const [password, setPassword] = useState('');
    const [modalState, setModalState] = useState(null);
    const [trackEnabled, setTrackEnabled] = useState(() => typeof buildDefaultTrackEnabledMap === 'function'
        ? buildDefaultTrackEnabledMap()
        : {});
    const [playerDb, setPlayerDb] = useState(() => normalizePlayerDb({
        players: [
            { id: 'pl_thomas_schirrholz', firstName: 'Thomas', lastName: 'Schirrholz', nickname: 'Derthom', ageGroup: 'ue18', prefs: { consoles: [], controllers: [], games: [], tvs: [] } },
            { id: 'pl_sabrina_schirrholz', firstName: 'Sabrina', lastName: 'Schirrholz', nickname: 'Bina', ageGroup: 'ue18', prefs: { consoles: [], controllers: [], games: [], tvs: [] } },
            { id: 'pl_patrick_schirrholz', firstName: 'Patrick', lastName: 'Schirrholz', nickname: 'Anulu', ageGroup: 'ue18', prefs: { consoles: [], controllers: [], games: [], tvs: [] } },
            { id: 'pl_manuel_knoop', firstName: 'Manuel', lastName: 'Knoop', nickname: 'Manni', ageGroup: 'ue18', prefs: { consoles: [], controllers: [], games: [], tvs: [] } },
        ]
    }, DEFAULT_CONSOLES));
    const [orgaData, setOrgaData] = useState(() => normalizeOrgaData(null));
    const persist = usePersist(fps, setFps, cons, setCons, schedule, setSchedule, results, setResults, stechenBlocks, setStechenBlocks, stechenTimes, setStechenTimes, trackEnabled, setTrackEnabled, password, setPassword, playerDb, setPlayerDb, orgaData, setOrgaData);
    const [quickLoadBusy, setQuickLoadBusy] = useState(false);
    const rankingPopupRef = useRef(null);
    const [rankingPopupView, setRankingPopupView] = useState('gesamt');
    const [rankingPopupOpenFlag, setRankingPopupOpenFlag] = useState(false);
    const [rankingRotationActive, setRankingRotationActive] = useState(false);
    const lastAuditSignatureRef = useRef('');
    const rankingRotationViewsRef = useRef(['gesamt', 'solo', 'konsolen']);
    const rankingRotationIndexRef = useRef(0);
    const rankingRotationIntervalRef = useRef(15000);
    const rankingPopupState = useMemo(() => buildRankingPopupState(fps, schedule, results, stechenBlocks, stechenTimes, rankingPopupView, orgaData), [fps, schedule, results, stechenBlocks, stechenTimes, rankingPopupView, orgaData]);
    useEffect(() => {
        if (!schedule || typeof summarizeRankingAudit !== 'function')
            return;
        const audit = summarizeRankingAudit(fps, schedule, results);
        const signature = JSON.stringify({
            issues: audit.issues.map(x => [x.groupId, x.message]),
            warnings: audit.warnings.map(x => [x.groupId, x.message])
        });
        if (signature === lastAuditSignatureRef.current)
            return;
        lastAuditSignatureRef.current = signature;
        if (audit.issues.length) {
            console.warn('MKWC Ranking-Audit: ungültige Match-Ergebnisse erkannt.', audit.issues);
        }
        else if (audit.warnings.length) {
            console.info('MKWC Ranking-Audit: Hinweise zum Punkteschema erkannt.', audit.warnings);
        }
    }, [fps, schedule, results]);
    // Pinned windows: Map<view, {win, ref}> — fixed view, live data
    const pinnedRefs = useRef({}); // {view: window}
    // Build states for all pinned views
    const pinnedViews = useRef(new Set());
    const allPinnedStates = useMemo(() => {
        const out = {};
        ['gesamt', 'solo', 'team', 'konsolen'].forEach(v => {
            if (pinnedViews.current.has(v))
                out[v] = buildRankingPopupState(fps, schedule, results, stechenBlocks, stechenTimes, v, orgaData);
        });
        return out;
    }, [fps, schedule, results, stechenBlocks, stechenTimes, orgaData]);
    function openRankingPopup(view, mode) {
        var _a, _b;
        const nextView = view || rankingPopupView || 'gesamt';
        if (mode === 'pin') {
            setRankingRotationActive(false);
            // Open pinned live window for this specific view
            pinnedViews.current.add(nextView);
            const name = 'mkwc_pin_' + nextView;
            let win = pinnedRefs.current[nextView];
            if (!win || win.closed) {
                const features = `popup=yes,width=${Math.max(1280, ((_a = window.screen) === null || _a === void 0 ? void 0 : _a.availWidth) || 1280)},height=${Math.max(720, ((_b = window.screen) === null || _b === void 0 ? void 0 : _b.availHeight) || 900)},left=0,top=0,resizable=yes,scrollbars=no`;
                win = window.open('', name, features);
                if (!win)
                    return;
                pinnedRefs.current[nextView] = win;
                try {
                    win.document.open();
                    win.document.write(rankingPopupShellHtml());
                    win.document.close();
                }
                catch (e) { }
            }
            const state = buildRankingPopupState(fps, schedule, results, stechenBlocks, stechenTimes, nextView, orgaData);
            setTimeout(() => renderRankingPopupWindow(win, state), 400);
            return;
        }
        setRankingRotationActive(false);
        if (view && view !== rankingPopupView)
            setRankingPopupView(view);
        const state = buildRankingPopupState(fps, schedule, results, stechenBlocks, stechenTimes, nextView, orgaData);
        const win = ensureRankingPopupWindow(rankingPopupRef);
        if (win) {
            setRankingPopupOpenFlag(true);
            renderRankingPopupWindow(win, state);
        }
    }
    function closeRankingPopup() {
        try {
            if (rankingPopupRef.current && !rankingPopupRef.current.closed)
                rankingPopupRef.current.close();
        }
        catch (err) { }
        rankingPopupRef.current = null;
        setRankingPopupOpenFlag(false);
        setRankingRotationActive(false);
    }
    function startRankingRotation(views, intervalSeconds, startView) {
        const available = (views || []).filter(Boolean);
        if (!available.length)
            return;
        rankingRotationViewsRef.current = available;
        rankingRotationIntervalRef.current = Math.max(5000, (parseInt(intervalSeconds, 10) || 15) * 1000);
        const initialView = available.includes(startView) ? startView : available[0];
        rankingRotationIndexRef.current = Math.max(0, available.indexOf(initialView));
        setRankingPopupView(initialView);
        setRankingRotationActive(true);
        const win = ensureRankingPopupWindow(rankingPopupRef);
        if (win) {
            setRankingPopupOpenFlag(true);
            const state = buildRankingPopupState(fps, schedule, results, stechenBlocks, stechenTimes, initialView, orgaData);
            renderRankingPopupWindow(win, state);
        }
    }
    function stopRankingRotation() {
        setRankingRotationActive(false);
    }
    useEffect(() => { setPlayerDb(prev => normalizePlayerDb(prev, cons)); }, [cons]);
    useEffect(() => { setFps(prev => syncFpsWithPlayerDb(prev, playerDb)); }, [playerDb]);
    useEffect(() => { setOrgaData(prev => syncBringPlanWithMatchmaking(prev, fps, playerDb)); }, [fps, playerDb]);
    useEffect(() => { renderRankingPopupWindow(rankingPopupRef.current, rankingPopupState); }, [rankingPopupState]);
    useEffect(() => {
        if (!rankingRotationActive)
            return;
        const views = (rankingRotationViewsRef.current || []).filter(Boolean);
        if (views.length < 2)
            return;
        const id = setInterval(() => {
            if (!rankingPopupRef.current || rankingPopupRef.current.closed) {
                setRankingPopupOpenFlag(false);
                setRankingRotationActive(false);
                return;
            }
            rankingRotationIndexRef.current = (rankingRotationIndexRef.current + 1) % views.length;
            const nextView = views[rankingRotationIndexRef.current] || views[0];
            setRankingPopupView(nextView);
        }, rankingRotationIntervalRef.current);
        return () => clearInterval(id);
    }, [rankingRotationActive]);
    useEffect(() => {
        // Update all pinned windows with fresh data (each keeps its own view)
        Object.entries(pinnedRefs.current).forEach(([v, win]) => {
            if (!win || win.closed) {
                delete pinnedRefs.current[v];
                pinnedViews.current.delete(v);
                return;
            }
            const state = allPinnedStates[v];
            if (state)
                renderRankingPopupWindow(win, state);
        });
    }, [allPinnedStates]);
    useEffect(() => { if (!rankingPopupOpenFlag)
        return; const id = setInterval(() => { if (!rankingPopupRef.current || rankingPopupRef.current.closed)
        setRankingPopupOpenFlag(false); }, 800); return () => clearInterval(id); }, [rankingPopupOpenFlag]);
    useEffect(() => () => { closeRankingPopup(); }, []);
    const [mainTab, setMainTab] = useState('matchmaking');
    const [mmTab, setMmTab] = useState('teilnehmer');
    const [orgaTab, setOrgaTab] = useState('orgaTeilnehmer');
    const [spTab, setSpTab] = useState(null);
    useEffect(() => {
        if (!schedule || typeof normalizeScheduleForConsoles !== 'function')
            return;
        const patchedSchedule = normalizeScheduleForConsoles(schedule, cons, trackEnabled);
        if (patchedSchedule !== schedule)
            setSchedule(patchedSchedule);
    }, [schedule, cons, trackEnabled]);
    async function handleQuickLoadRememberedState() {
        if (quickLoadBusy)
            return;
        if (!(persist && persist.storageSupported)) {
            alert('Der Speicherordner wird in diesem Browser hier nicht unterstützt.');
            return;
        }
        setQuickLoadBusy(true);
        try {
            const reconnected = await persist.reconnectRememberedFolder(true);
            if (reconnected)
                return;
            const hasRememberedFolder = !!(window.MKWCFileStorage && window.MKWCFileStorage.getRememberedFolderHandle && (await window.MKWCFileStorage.getRememberedFolderHandle()));
            if (!hasRememberedFolder) {
                const shouldPick = window.confirm('Es ist noch kein gemerkter Speicherordner vorhanden. Jetzt bitte den Ordner "Speicher" im App-Ordner auswählen und verbinden?');
                if (shouldPick)
                    await persist.chooseStorageFolder();
                return;
            }
            alert('Der gemerkte Speicherordner konnte nicht direkt verbunden werden. Bitte den Browser-Hinweis zum Ordnerzugriff bestätigen. Wenn nötig, wähle danach den Ordner "Speicher" im App-Ordner erneut aus.');
        }
        catch (err) {
            alert('Der letzte Speicherstand konnte nicht automatisch geladen werden.');
        }
        finally {
            setQuickLoadBusy(false);
        }
    }
    const MM_TABS = [['teilnehmer', '🏎 Fahrerplätze'], ['konsolen', '🎮 Konsolen & Modi']];
    const ORGA_TABS = [['orgaTeilnehmer', '👥 Teilnehmer'], ['werbringwas', '🎒 Werbringwas?'], ['spieler', '🧑‍💼 Spielerdaten'], ['kosten', '💸 Kosten'], ['todo', '✅ To-do'], ['ideen', '💡 Ideen'], ['regeln', '📜 Spielregeln'], ['strecken', '🗺️ Modi & Strecken'], ['ticker', '📰 Tickersätze'], ['aufbau', '🏗️ Aufbau'], ['speichern', '💾 Speichern'], ['passwort', '🔒 Passwort']];
    const storageReady = !!persist.storageFolderLabel && !persist.storageReconnectNeeded;
    const storageBadgeClass = storageReady ? 'chip chip-g' : (persist.storageReconnectNeeded ? 'chip chip-t' : 'chip chip-s');
    const storageBadgeText = storageReady
        ? `📁 ${persist.storageFolderLabel || persist.defaultStorageFolderName || 'Speicher'}`
        : (persist.storageReconnectNeeded ? '📁 Ordner bestätigen' : '📁 Speicher nicht verbunden');
    const lastSaveBadgeText = persist.lastManagedSave ? `💾 ${persist.lastManagedSave}` : '💾 Noch kein Ordner-Save';
    return (React.createElement("div", null,
        React.createElement("div", { className: "hdr" },
            React.createElement("span", { style: { fontSize: 28 } }, "\uD83C\uDFC6"),
            React.createElement("div", null,
                React.createElement("div", { className: "htitle" },
                    "MARIO KART",
                    React.createElement("br", null),
                    "WORLD CUP"),
                React.createElement("div", { className: "hsub" }, "Tournament Planner")),
            React.createElement("div", { className: "hbadges" },
                React.createElement("span", { className: "chip", style: { background: '#1a1a30', border: '1px solid #2a2a50', color: '#8080c0', fontSize: 10 } },
                    fps.length,
                    " Plätze · ",
                    fps.reduce((s, f) => s + f.players.length, 0),
                    " Fahrer"),
                React.createElement("span", { className: storageBadgeClass, title: persist.storageStatus || 'Speicherstatus', onClick: () => { setMainTab('orga'); setOrgaTab('speichern'); }, style: { cursor: 'pointer' } }, storageBadgeText),
                React.createElement("span", { className: persist.lastManagedSave ? 'chip chip-b' : 'chip chip-s', title: 'Letztes automatisches Speichern', onClick: () => { setMainTab('orga'); setOrgaTab('speichern'); }, style: { cursor: 'pointer', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' } }, lastSaveBadgeText),
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 5, background: '#12122a', border: '1px solid #2a2a50', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }, title: "Speichern/Laden", onClick: () => { setMainTab('orga'); setOrgaTab('speichern'); } },
                    React.createElement("span", { style: { fontSize: 12 } }, "\uD83D\uDCBE"),
                    React.createElement("span", { style: { fontSize: 9, color: persist.filename ? '#80d080' : '#5060a0', fontFamily: 'var(--fd)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, persist.filename || 'nicht gespeichert')))),
        React.createElement("div", { className: "nav", style: { display: 'flex', alignItems: 'center' } },
            React.createElement("button", { className: `nbtn${mainTab === 'matchmaking' ? ' on' : ''}`, onClick: () => setMainTab('matchmaking') }, "\uD83C\uDFCE Matchmaking"),
            React.createElement("button", { className: `nbtn${mainTab === 'spielplan' ? ' on' : ''}`, onClick: () => setMainTab('spielplan') }, "\uD83D\uDCCB Spielplan"),
            React.createElement("button", { className: `nbtn${mainTab === 'rangliste' ? ' on' : ''}`, onClick: () => setMainTab('rangliste') }, "\uD83C\uDFC6 Rangliste"),
            React.createElement("button", { className: `nav-quick-btn${quickLoadBusy ? ' is-busy' : ''}${persist.storageReconnectNeeded ? ' need-attention' : ''}`, type: "button", onClick: handleQuickLoadRememberedState, disabled: quickLoadBusy, title: persist.storageReconnectNeeded ? "Gemerkten Ordner erneut verbinden und letzten Stand laden" : "Letzten Stand aus dem gemerkten Ordner laden", style: { marginLeft: 'auto' } },
                React.createElement("span", { className: "nav-quick-btn-ic", "aria-hidden": "true" }, quickLoadBusy ? "⏳" : "↻"),
                React.createElement("span", { className: "nav-quick-btn-txt" }, quickLoadBusy ? "Lädt..." : "Letzten Stand laden")),
            React.createElement("button", { className: `nbtn${mainTab === 'orga' ? ' on' : ''}`, onClick: () => setMainTab('orga'), title: "Organisation & Daten", style: { fontSize: 12, padding: '10px 16px' } }, "\u2699\uFE0F")),
        mainTab === 'matchmaking' && (React.createElement("div", { className: "nav", style: { background: 'var(--card2)', borderTop: '1px solid var(--bord)', paddingLeft: 12 } }, MM_TABS.map(([k, l]) => React.createElement("button", { key: k, className: `nbtn${mmTab === k ? ' on' : ''}`, style: { fontSize: 9, padding: '10px 14px' }, onClick: () => setMmTab(k) }, l)))),
        mainTab === 'orga' && (React.createElement("div", { className: "nav", style: { background: 'var(--card2)', borderTop: '1px solid var(--bord)', paddingLeft: 12 } }, ORGA_TABS.map(([k, l]) => React.createElement("button", { key: k, className: `nbtn${orgaTab === k ? ' on' : ''}`, style: { fontSize: 9, padding: '10px 14px' }, onClick: () => setOrgaTab(k) }, l)))),
        React.createElement("div", { className: "pg" },
            mainTab === 'matchmaking' && mmTab === 'teilnehmer' && React.createElement(TeilnehmerTab, { fps: fps, setFps: setFps, playerDb: playerDb }),
            mainTab === 'matchmaking' && mmTab === 'konsolen' && React.createElement(KonsolenTab, { consoles: cons, setConsoles: setCons }),
            mainTab === 'orga' && orgaTab === 'strecken' && React.createElement(StreckenTab, { trackEnabled: trackEnabled, setTrackEnabled: setTrackEnabled }),
            mainTab === 'orga' && orgaTab === 'spieler' && React.createElement(SpielerDatenTab, { playerDb: playerDb, setPlayerDb: setPlayerDb, consoles: cons }),
            mainTab === 'orga' && orgaTab === 'orgaTeilnehmer' && React.createElement(OrgTeilnehmerTab, { orgaData: orgaData, setOrgaData: setOrgaData, playerDb: playerDb, fps: fps }),
            mainTab === 'orga' && orgaTab === 'werbringwas' && React.createElement(WerBringtWasTab, { orgaData: orgaData, setOrgaData: setOrgaData, playerDb: playerDb, fps: fps, consoles: cons }),
            mainTab === 'orga' && orgaTab === 'kosten' && React.createElement(KostenTodoIdeenTab, { orgaData: orgaData, setOrgaData: setOrgaData, fps: fps, playerDb: playerDb, focus: 'kosten' }),
            mainTab === 'orga' && orgaTab === 'todo' && React.createElement(KostenTodoIdeenTab, { orgaData: orgaData, setOrgaData: setOrgaData, fps: fps, playerDb: playerDb, focus: 'todo' }),
            mainTab === 'orga' && orgaTab === 'ideen' && React.createElement(IdeenTab, { orgaData: orgaData, setOrgaData: setOrgaData, fps: fps }),
            mainTab === 'orga' && orgaTab === 'regeln' && React.createElement(SpielregelnAdminTab, { orgaData: orgaData, setOrgaData: setOrgaData }),
            mainTab === 'orga' && orgaTab === 'ticker' && React.createElement(TickerEditorTab, { orgaData: orgaData, setOrgaData: setOrgaData }),
            mainTab === 'orga' && orgaTab === 'aufbau' && React.createElement(AufbauTab, { orgaData: orgaData, setOrgaData: setOrgaData, consoles: cons }),
            mainTab === 'orga' && orgaTab === 'speichern' && React.createElement(SpeichernTab, { persist: persist }),
            mainTab === 'orga' && orgaTab === 'passwort' && React.createElement(PasswortTab, { password: password, setPassword: setPassword }),
            mainTab === 'spielplan' && React.createElement(SpielplanTab, { fps: fps, consoles: cons, schedule: schedule, setSchedule: setSchedule, results: results, setResults: setResults, stechenBlocks: stechenBlocks, setStechenBlocks: setStechenBlocks, stechenTimes: stechenTimes, setStechenTimes: setStechenTimes, trackEnabled: trackEnabled, spTab: spTab, setSpTab: setSpTab, password: password, requestConfirm: (cb, type) => setModalState({ cb, type, pw: '', err: '' }) }),
            modalState && (React.createElement(Modal, { title: modalState.type === 'generate' ? '🎮 Neuen Spielplan erstellen' : '🔄 Spielplan neu generieren', onCancel: () => setModalState(null), confirmLabel: modalState.type === 'generate' ? 'Erstellen' : 'Neu generieren', onConfirm: () => { if (password && modalState.pw !== password) {
                    setModalState(m => ({ ...m, err: 'Falsches Passwort.' }));
                    return;
                } modalState.cb(); setModalState(null); } },
                modalState.type === 'regenerate' && React.createElement("div", { style: { background: '#fff5f5', border: '1px solid #ffcccc', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: 'var(--red)', fontSize: 13 } },
                    "\u26A0\uFE0F ",
                    React.createElement("strong", null, "Achtung:"),
                    " Alle bisherigen Ergebnisse gehen verloren!"),
                password && React.createElement("div", { style: { marginBottom: 8 } },
                    React.createElement("div", { className: "fp-player-label" }, "Passwort"),
                    React.createElement("input", { type: "password", value: modalState.pw, onChange: e => setModalState(m => ({ ...m, pw: e.target.value, err: '' })), placeholder: "Passwort eingeben", autoFocus: true, style: { marginTop: 4 }, onKeyDown: e => { var _a; return e.key === 'Enter' && ((_a = document.getElementById('modal-confirm')) === null || _a === void 0 ? void 0 : _a.click()); } })),
                modalState.err && React.createElement("div", { style: { color: 'var(--red)', fontSize: 13, marginTop: 4 } }, modalState.err))),
            mainTab === 'rangliste' && React.createElement(RanglisteTab, { fps: fps, schedule: schedule, results: results, consoles: cons, stechenBlocks: stechenBlocks, stechenTimes: stechenTimes, onOpenPopup: openRankingPopup, onClosePopup: closeRankingPopup, isPopupOpen: rankingPopupOpenFlag && (!!(rankingPopupRef.current && !rankingPopupRef.current.closed)), onPopupViewChange: setRankingPopupView, onStartRotation: startRankingRotation, onStopRotation: stopRankingRotation, isRotationActive: rankingRotationActive }))));
}
function mountApp(rootEl) {
    if (!rootEl) {
        throw new Error('Root-Element #root wurde nicht gefunden.');
    }
    if (ReactDOM && typeof ReactDOM.createRoot === 'function') {
        ReactDOM.createRoot(rootEl).render(React.createElement(App, null));
        return;
    }
    if (ReactDOM && typeof ReactDOM.render === 'function') {
        ReactDOM.render(React.createElement(App, null), rootEl);
        return;
    }
    throw new Error('Keine kompatible ReactDOM-Render-API gefunden.');
}

let __legacyAppStarted = false;

export function startLegacyApp(rootEl = (typeof ROOT_EL !== 'undefined' ? ROOT_EL : document.getElementById('root'))) {
    if (__legacyAppStarted) {
        return;
    }
    try {
        mountApp(rootEl);
        __legacyAppStarted = true;
    }
    catch (err) {
        if (typeof renderFatalError === 'function') {
            renderFatalError(err);
        }
        throw err;
    }
}

export { App, mountApp };
