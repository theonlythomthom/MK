// Restlicher Legacy-core jetzt als ES-Modul.
const { useState, useMemo, useEffect, useRef } = React;
const ROOT_EL = document.getElementById('root');
function renderFatalError(err) {
    if (typeof window !== 'undefined' && typeof window.__showBootError === 'function') {
        window.__showBootError(err && (err.stack || err.message || String(err)) || 'Unbekannter Fehler');
    }
}
// ── Formats / Punkte jetzt via ES-Modul-Bootstrap ─────────────────────────
// ── Katalog-/Resolver-Grundlagen jetzt via ES-Modul-Bootstrap ─────────────
function uniqueStringList(values) {
    const seen = new Set();
    return (Array.isArray(values) ? values : [])
        .map(value => String(value || '').trim())
        .filter(value => {
        if (!value || seen.has(value))
            return false;
        seen.add(value);
        return true;
    });
}
function pickRandom(arr) { const safe = Array.isArray(arr) ? arr.filter(Boolean) : []; return safe.length ? safe[Math.floor(Math.random() * safe.length)] : null; }
function isKnockoutMode(mode) {
    if (!mode)
        return false;
    if ((mode === null || mode === void 0 ? void 0 : mode.knockout) === true)
        return true;
    const text = `${(mode === null || mode === void 0 ? void 0 : mode.id) || ''} ${(mode === null || mode === void 0 ? void 0 : mode.name) || ''} ${(mode === null || mode === void 0 ? void 0 : mode.modeId) || ''} ${(mode === null || mode === void 0 ? void 0 : mode.modeName) || ''} ${(mode === null || mode === void 0 ? void 0 : mode.catalogModeId) || ''}`.toLowerCase();
    return /(^|[^a-z])ko([^a-z]|$)/.test(text)
        || /k\.?-?o\.?/.test(text)
        || /knock\s*out/.test(text)
        || /rally/.test(text);
}
function inferTrackDrawMode(name = '', id = '') {
    const s = `${name} ${id}`.toLowerCase();
    if (isKnockoutMode({ name, id }))
        return 'route';
    return /(grand prix|\bgp\b|cup|pokal)/.test(s) ? 'cup' : 'track';
}
function getModeSelectionKind(mode) {
    if (isKnockoutMode(mode))
        return 'route';
    const explicit = String((mode === null || mode === void 0 ? void 0 : mode.trackDrawMode) || '').toLowerCase();
    if (explicit === 'track' || explicit === 'cup' || explicit === 'route')
        return explicit;
    const allowed = Array.isArray(mode === null || mode === void 0 ? void 0 : mode.drawModes) ? mode.drawModes.map(value => String(value || '').toLowerCase()).filter(Boolean) : [];
    if (allowed.includes('route'))
        return 'route';
    if (allowed.includes('cup'))
        return 'cup';
    if (allowed.includes('track'))
        return 'track';
    return inferTrackDrawMode((mode === null || mode === void 0 ? void 0 : mode.name) || (mode === null || mode === void 0 ? void 0 : mode.modeName) || '', (mode === null || mode === void 0 ? void 0 : mode.id) || (mode === null || mode === void 0 ? void 0 : mode.modeId) || '');
}
function normalizeAttemptCount(value) {
    const n = parseInt(value, 10);
    return Math.max(1, Math.min(10, Number.isFinite(n) ? n : 1));
}
function isTimeTrialMode(mode) {
    if (!mode)
        return false;
    if ((mode === null || mode === void 0 ? void 0 : mode.timeTrial) === true)
        return true;
    const text = `${(mode === null || mode === void 0 ? void 0 : mode.id) || ''} ${(mode === null || mode === void 0 ? void 0 : mode.name) || ''} ${(mode === null || mode === void 0 ? void 0 : mode.modeId) || ''} ${(mode === null || mode === void 0 ? void 0 : mode.modeName) || ''}`.toLowerCase();
    return /zeitfahr/.test(text) || /zeitrenn/.test(text) || /time\s*trial/.test(text) || /(?:^|_)time(?:$|_)/.test(text);
}
function normalizeTimeFieldDigits(value, digits) {
    return String(value == null ? '' : value).replace(/[^0-9]/g, '').slice(0, digits);
}
function normalizeTimeFieldEntry(entry) {
    return {
        mm: normalizeTimeFieldDigits(entry === null || entry === void 0 ? void 0 : entry.mm, 2),
        ss: normalizeTimeFieldDigits(entry === null || entry === void 0 ? void 0 : entry.ss, 2),
        ms: normalizeTimeFieldDigits(entry === null || entry === void 0 ? void 0 : entry.ms, 3),
    };
}
function isTimeFieldEntryComplete(entry) {
    const tv = normalizeTimeFieldEntry(entry);
    return tv.mm.length >= 1 && tv.ss.length >= 1 && tv.ms.length >= 1;
}
function parseTimeFieldEntry(entry) {
    const tv = normalizeTimeFieldEntry(entry);
    if (!isTimeFieldEntryComplete(tv))
        return null;
    const mm = parseInt(tv.mm, 10);
    const ss = parseInt(tv.ss, 10);
    if (!Number.isFinite(mm) || !Number.isFinite(ss))
        return null;
    const msFrac = Number(`0.${tv.ms}`);
    if (!Number.isFinite(msFrac))
        return null;
    return mm * 60 + ss + msFrac;
}
function formatTimeFieldEntry(entry) {
    const tv = normalizeTimeFieldEntry(entry);
    if (!isTimeFieldEntryComplete(tv))
        return '–';
    return `${tv.mm}:${tv.ss}.${tv.ms}`;
}
// ── Punkte / Format-Helfer jetzt via ES-Modul-Bootstrap ──────────────────
const SOURCE_LABELS = {
    base: 'Basisspiel',
    dlc: 'DLC',
    pass: 'Pass',
    unlock: 'Freischaltbar',
    event: 'Tour',
    battle: 'Battle'
};
function getCupSourceLabel(source) {
    return SOURCE_LABELS[source] || SOURCE_LABELS.base;
}









function buildDefaultConsolesFromCatalog() {
    return GAME_CATALOG.map(con => {
        const descriptors = (DEFAULT_MODE_DESCRIPTORS[con.id] || []);
        return {
            id: con.id,
            name: con.name,
            game: con.game,
            emoji: con.emoji,
            enabled: true,
            modes: descriptors.map(mode => normalizeMode({
                ...mode,
                points: buildDefaultPointsForMode(mode)
            }))
        };
    });
}
function mergeModeWithDefault(defaultMode, savedMode) {
    const merged = {
        ...defaultMode,
        enabled: savedMode && typeof savedMode.enabled === 'boolean' ? savedMode.enabled : defaultMode.enabled,
        rounds: savedMode && savedMode.rounds != null ? Math.max(1, Math.min(20, parseInt(savedMode.rounds, 10) || defaultMode.rounds || 1)) : defaultMode.rounds,
        attempts: savedMode && savedMode.attempts != null ? normalizeAttemptCount(savedMode.attempts) : normalizeAttemptCount(defaultMode.attempts),
    };
    const allowedFormats = Array.isArray(defaultMode === null || defaultMode === void 0 ? void 0 : defaultMode.af) ? defaultMode.af : [];
    const savedFormat = savedMode && typeof savedMode.sf === 'string' ? savedMode.sf : '';
    if (savedFormat && allowedFormats.includes(savedFormat))
        merged.sf = savedFormat;
    const fmt = getModeFormatMeta({ sf: merged.sf }) || getModeFormatMeta(defaultMode);
    const allowedScoringModes = Array.isArray(defaultMode === null || defaultMode === void 0 ? void 0 : defaultMode.scoringModes) && (defaultMode === null || defaultMode === void 0 ? void 0 : defaultMode.scoringModes).length
        ? defaultMode.scoringModes
        : ['individual', 'team'];
    if ((fmt === null || fmt === void 0 ? void 0 : fmt.team)) {
        const preferredScoringMode = savedMode && allowedScoringModes.includes(savedMode.scoringMode) ? savedMode.scoringMode : (defaultMode.scoringMode || allowedScoringModes[0] || 'individual');
        merged.scoringMode = preferredScoringMode;
    }
    else {
        merged.scoringMode = 'individual';
    }
    const allowedDrawModes = Array.isArray(defaultMode === null || defaultMode === void 0 ? void 0 : defaultMode.drawModes) && (defaultMode === null || defaultMode === void 0 ? void 0 : defaultMode.drawModes).length
        ? defaultMode.drawModes
        : [defaultMode.trackDrawMode || inferTrackDrawMode(defaultMode.name, defaultMode.id)];
    const savedDrawMode = savedMode && typeof savedMode.trackDrawMode === 'string' ? savedMode.trackDrawMode : '';
    merged.trackDrawMode = allowedDrawModes.includes(savedDrawMode)
        ? savedDrawMode
        : (defaultMode.trackDrawMode || allowedDrawModes[0] || inferTrackDrawMode(defaultMode.name, defaultMode.id));
    merged.points = normalizeModePoints(merged, savedMode && Array.isArray(savedMode.points) ? savedMode.points : defaultMode.points, fmt, merged.scoringMode);
    return normalizeMode(merged);
}
function normalizeConsoles(cons) {
    const defaults = buildDefaultConsolesFromCatalog();
    if (!Array.isArray(cons) || !cons.length)
        return defaults;
    const savedMap = new Map(cons.map(con => [String(con.id), con]));
    const merged = defaults.map(defCon => {
        const savedCon = savedMap.get(String(defCon.id));
        if (!savedCon) {
            return {
                ...defCon,
                enabled: false,
                modes: defCon.modes.map(mode => normalizeMode({ ...mode, enabled: false }))
            };
        }
        const savedModeList = ((savedCon && savedCon.modes) || []);
        const savedModes = new Map(savedModeList.map(mode => [String(mode.id), mode]));
        const knownModeIds = new Set(defCon.modes.map(defMode => String(defMode.id)));
        const hasAnyKnownModes = savedModeList.some(mode => knownModeIds.has(String(mode.id)));
        const mergedModes = defCon.modes.map(defMode => {
            const savedMode = savedModes.get(String(defMode.id));
            if (savedMode)
                return mergeModeWithDefault(defMode, savedMode);
            return hasAnyKnownModes ? defMode : normalizeMode({ ...defMode, enabled: false });
        });
        const customModes = (savedModeList.filter(mode => !defCon.modes.some(defMode => String(defMode.id) === String(mode.id))))
            .map(mode => normalizeMode(mode));
        const modeList = hasAnyKnownModes ? [...mergedModes, ...customModes] : [...customModes, ...mergedModes];
        return {
            ...defCon,
            enabled: typeof savedCon.enabled === 'boolean' ? savedCon.enabled : defCon.enabled,
            modes: modeList
        };
    });
    const order = new Map(cons.map((con, idx) => [String(con.id), idx]));
    return merged.sort((a, b) => {
        const ai = order.has(String(a.id)) ? order.get(String(a.id)) : Number.MAX_SAFE_INTEGER;
        const bi = order.has(String(b.id)) ? order.get(String(b.id)) : Number.MAX_SAFE_INTEGER;
        if (ai !== bi)
            return ai - bi;
        return (CONSOLE_YEARS[String(a.id)] || 9999) - (CONSOLE_YEARS[String(b.id)] || 9999);
    });
}

const DEFAULT_CONSOLES = buildDefaultConsolesFromCatalog();













function sortConsoleNamesByAge(names = [], consoles = []) {
    return [...(names || [])].sort((a, b) => {
        const ay = consoleYearForName(a, consoles), by = consoleYearForName(b, consoles);
        if (ay !== by)
            return ay - by;
        return String(a || '').localeCompare(String(b || ''), 'de');
    });
}
function getOrderedConsoleCatalog(consoles = []) {
    return [...(consoles || [])].sort((a, b) => {
        var _a, _b;
        const ay = (_a = CONSOLE_YEARS[a === null || a === void 0 ? void 0 : a.id]) !== null && _a !== void 0 ? _a : 9999;
        const by = (_b = CONSOLE_YEARS[b === null || b === void 0 ? void 0 : b.id]) !== null && _b !== void 0 ? _b : 9999;
        if (ay !== by)
            return ay - by;
        return String((a === null || a === void 0 ? void 0 : a.name) || '').localeCompare(String((b === null || b === void 0 ? void 0 : b.name) || ''), 'de');
    }).map(con => { var _a; return ({ id: con.id, consoleName: String((con === null || con === void 0 ? void 0 : con.name) || '').trim(), gameName: String((con === null || con === void 0 ? void 0 : con.game) || '').trim(), year: (_a = CONSOLE_YEARS[con === null || con === void 0 ? void 0 : con.id]) !== null && _a !== void 0 ? _a : 9999 }); });
}
function prefCountForExactItem(entries = [], item = '') {
    const key = normalizeCatalogKey(item);
    return (entries || []).reduce((sum, entry) => { var _a; return normalizeCatalogKey(entry === null || entry === void 0 ? void 0 : entry.item) === key ? sum + prefCountFromLegacy((_a = entry === null || entry === void 0 ? void 0 : entry.count) !== null && _a !== void 0 ? _a : 0) : sum; }, 0);
}
function setPrefCountForExactItem(entries = [], item = '', count = 0) {
    const key = normalizeCatalogKey(item);
    const safe = Math.max(0, parseInt(count, 10) || 0);
    const next = [...(entries || [])];
    const idx = next.findIndex(entry => normalizeCatalogKey(entry === null || entry === void 0 ? void 0 : entry.item) === key);
    if (safe <= 0)
        return idx >= 0 ? next.filter((_, i) => i !== idx) : next;
    if (idx >= 0) {
        next[idx] = { ...next[idx], item, count: safe };
        return next;
    }
    return [...next, makePrefEntry(item, safe)];
}
function controllerAliasesForConsoleName(consoleName = '') {
    const key = normalizeCatalogKey(consoleName);
    const aliases = [normalizeCatalogKey(controllerItemLabelForConsole(consoleName))];
    if (key.includes('snes'))
        aliases.push('snes');
    if (key.includes('n64'))
        aliases.push('n64');
    if (key.includes('gamecube') || key === 'gc')
        aliases.push('gamecube', 'gc');
    if (key.includes('wii u') || key.includes('wiiu'))
        aliases.push('wii u', 'wiiu');
    if (key.includes('wii'))
        aliases.push('wii');
    if (key.includes('ds'))
        aliases.push('ds');
    if (key.includes('switch2') || key.includes('switch 2'))
        aliases.push('switch2', 'switch 2 controller');
    else if (key.includes('switch'))
        aliases.push('switch', 'joy-con', 'pro controller');
    return [...new Set(aliases.filter(Boolean))];
}
function controllerItemLabelForConsole(consoleName = '') { return `${String(consoleName || '').trim()} Controller`.trim(); }
function prefCountForConsoleController(entries = [], consoleName = '') {
    const aliases = controllerAliasesForConsoleName(consoleName);
    return (entries || []).reduce((sum, entry) => {
        var _a;
        const itemKey = normalizeCatalogKey(entry === null || entry === void 0 ? void 0 : entry.item);
        return aliases.some(alias => itemKey === alias || itemKey.includes(alias) || alias.includes(itemKey))
            ? sum + prefCountFromLegacy((_a = entry === null || entry === void 0 ? void 0 : entry.count) !== null && _a !== void 0 ? _a : 0)
            : sum;
    }, 0);
}
function getPlayerTvCount(player = {}) {
    var _a;
    return (((_a = player === null || player === void 0 ? void 0 : player.prefs) === null || _a === void 0 ? void 0 : _a.tvs) || []).reduce((sum, entry) => { var _a; return sum + prefCountFromLegacy((_a = entry === null || entry === void 0 ? void 0 : entry.count) !== null && _a !== void 0 ? _a : 0); }, 0);
}
function getPlayerInventoryCounts(player = {}, consoleName = '', gameName = '') {
    var _a, _b, _c;
    return {
        console: prefCountForExactItem(((_a = player === null || player === void 0 ? void 0 : player.prefs) === null || _a === void 0 ? void 0 : _a.consoles) || [], consoleName),
        controller: prefCountForConsoleController(((_b = player === null || player === void 0 ? void 0 : player.prefs) === null || _b === void 0 ? void 0 : _b.controllers) || [], consoleName),
        game: prefCountForExactItem(((_c = player === null || player === void 0 ? void 0 : player.prefs) === null || _c === void 0 ? void 0 : _c.games) || [], gameName),
        tv: getPlayerTvCount(player),
    };
}
// ── Utils ─────────────────────────────────────────────────────────────────
const TCL = ['#0070e0', '#0a8a3a', '#e07000', '#a020c0', '#c0006a', '#007890', '#c04000', '#006060'];
const tc = (name, all) => TCL[all.indexOf(name) % TCL.length] || '#888';
function mkFps(n) { return Array.from({ length: n }, (_, i) => ({ id: i + 1, teamName: '', players: [{ name: `Spieler ${String(i + 1).padStart(2, '0')}`, nickname: '' }] })); }
const AGE_OPTIONS = [{ value: 'u18', label: 'Unter 18 Jahre' }, { value: 'ue18', label: 'Über 18 Jahre' }];
function prefCountFromLegacy(value) {
    var _a;
    if (typeof value === 'number' && Number.isFinite(value))
        return Math.max(0, Math.round(value));
    const n = parseInt(value, 10);
    if (!Number.isNaN(n))
        return Math.max(0, n);
    const map = { nie: 0, selten: 1, gelegentlich: 2, oft: 3, sehr_oft: 5 };
    return (_a = map[value]) !== null && _a !== void 0 ? _a : 0;
}
const PLAYER_PREF_CATS = [
    { key: 'consoles', label: 'Konsolen' },
    { key: 'controllers', label: 'Controller' },
    { key: 'games', label: 'Spiele' },
    { key: 'tvs', label: 'TVs' },
];
function uniqStrings(arr) { return [...new Set((arr || []).map(v => (v || '').trim()).filter(Boolean))]; }
function buildDefaultMasterData(cons) {
    return {
        consoles: uniqStrings((cons || []).map(c => c.name)),
        controllers: ['SNES Controller', 'N64 Controller', 'GameCube Controller', 'Wii Remote', 'Wii Wheel', 'Joy-Con', 'Pro Controller'],
        games: uniqStrings((cons || []).map(c => c.game)),
        tvs: ['TV 1', 'TV 2', 'TV 3', 'Beamer']
    };
}
function makePrefEntry(item = '', count = 0) { return { id: `pref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, item, count: prefCountFromLegacy(count) }; }
function makePlayerRecord(id) {
    return {
        id: id || Date.now(),
        firstName: '',
        lastName: '',
        nickname: '',
        ageGroup: 'ue18',
        prefs: {
            consoles: [],
            controllers: [],
            games: [],
            tvs: []
        }
    };
}
function normalizePlayerDb(db, cons) {
    const defaults = buildDefaultMasterData(cons);
    const src = db || {};
    const masterRaw = { ...(src.masterData || {}) };
    const masterData = {
        consoles: uniqStrings([...(masterRaw.consoles || []), ...defaults.consoles]),
        controllers: uniqStrings([...(masterRaw.controllers || []), ...defaults.controllers]),
        games: uniqStrings([...(masterRaw.games || []), ...defaults.games]),
        tvs: uniqStrings([...(masterRaw.tvs || []), ...defaults.tvs]),
    };
    const players = (src.players || []).map((p, i) => {
        var _a, _b, _c, _d;
        return ({
            id: (p === null || p === void 0 ? void 0 : p.id) || `pl_${i + 1}_${Date.now()}`,
            firstName: (p === null || p === void 0 ? void 0 : p.firstName) || '',
            lastName: (p === null || p === void 0 ? void 0 : p.lastName) || '',
            nickname: (p === null || p === void 0 ? void 0 : p.nickname) || '',
            ageGroup: (p === null || p === void 0 ? void 0 : p.ageGroup) || 'ue18',
            prefs: {
                consoles: (((_a = p === null || p === void 0 ? void 0 : p.prefs) === null || _a === void 0 ? void 0 : _a.consoles) || []).map(x => { var _a; return ({ id: (x === null || x === void 0 ? void 0 : x.id) || makePrefEntry().id, item: (x === null || x === void 0 ? void 0 : x.item) || '', count: prefCountFromLegacy((_a = x === null || x === void 0 ? void 0 : x.count) !== null && _a !== void 0 ? _a : x === null || x === void 0 ? void 0 : x.frequency) }); }),
                controllers: (((_b = p === null || p === void 0 ? void 0 : p.prefs) === null || _b === void 0 ? void 0 : _b.controllers) || []).map(x => { var _a; return ({ id: (x === null || x === void 0 ? void 0 : x.id) || makePrefEntry().id, item: (x === null || x === void 0 ? void 0 : x.item) || '', count: prefCountFromLegacy((_a = x === null || x === void 0 ? void 0 : x.count) !== null && _a !== void 0 ? _a : x === null || x === void 0 ? void 0 : x.frequency) }); }),
                games: (((_c = p === null || p === void 0 ? void 0 : p.prefs) === null || _c === void 0 ? void 0 : _c.games) || []).map(x => { var _a; return ({ id: (x === null || x === void 0 ? void 0 : x.id) || makePrefEntry().id, item: (x === null || x === void 0 ? void 0 : x.item) || '', count: prefCountFromLegacy((_a = x === null || x === void 0 ? void 0 : x.count) !== null && _a !== void 0 ? _a : x === null || x === void 0 ? void 0 : x.frequency) }); }),
                tvs: (((_d = p === null || p === void 0 ? void 0 : p.prefs) === null || _d === void 0 ? void 0 : _d.tvs) || []).map(x => { var _a; return ({ id: (x === null || x === void 0 ? void 0 : x.id) || makePrefEntry().id, item: (x === null || x === void 0 ? void 0 : x.item) || '', count: prefCountFromLegacy((_a = x === null || x === void 0 ? void 0 : x.count) !== null && _a !== void 0 ? _a : x === null || x === void 0 ? void 0 : x.frequency) }); }),
            }
        });
    });
    return { masterData, players };
}
function fullPlayerName(player) {
    return [(player === null || player === void 0 ? void 0 : player.firstName) || '', (player === null || player === void 0 ? void 0 : player.lastName) || ''].join(' ').replace(/\s+/g, ' ').trim();
}
function normalizeFpPlayer(player, index) {
    return { dbPlayerId: '', name: `Spieler ${String(index || 1).padStart(2, '0')}`, nickname: '', ...(player || {}) };
}
function applyPlayerRecordToSlot(record, existing = {}) {
    if (!record)
        return existing;
    return {
        ...existing,
        dbPlayerId: record.id,
        name: fullPlayerName(record) || existing.name || '',
        nickname: (record.nickname || '').trim(),
    };
}
function syncFpsWithPlayerDb(fps, playerDb) {
    const dbMap = new Map(((playerDb === null || playerDb === void 0 ? void 0 : playerDb.players) || []).map(p => [String(p.id), p]));
    let changed = false;
    const next = (fps || []).map(fp => {
        const currentPlayers = (fp === null || fp === void 0 ? void 0 : fp.players) || [];
        const nextPlayers = currentPlayers.map((pl, i) => {
            const current = normalizeFpPlayer(pl, i + 1);
            const pid = String(current.dbPlayerId || '').trim();
            const record = pid ? dbMap.get(pid) : null;
            const synced = record ? applyPlayerRecordToSlot(record, current) : current;
            const playerChanged = synced.dbPlayerId !== current.dbPlayerId ||
                synced.name !== current.name ||
                synced.nickname !== current.nickname;
            if (playerChanged) {
                changed = true;
                return synced;
            }
            return pl;
        });
        return nextPlayers.some((pl, i) => pl !== currentPlayers[i]) ? { ...fp, players: nextPlayers } : fp;
    });
    return changed ? next : fps;
}
function getLinkedMatchmakingParticipants(fps, playerDb) {
    const dbMap = new Map(((playerDb === null || playerDb === void 0 ? void 0 : playerDb.players) || []).map(p => [String(p.id), p]));
    const seen = new Set();
    const out = [];
    (fps || []).forEach(fp => {
        ((fp === null || fp === void 0 ? void 0 : fp.players) || []).forEach((pl, idx) => {
            const pid = String((pl === null || pl === void 0 ? void 0 : pl.dbPlayerId) || '').trim();
            if (!pid || seen.has(pid))
                return;
            const rec = dbMap.get(pid);
            if (!rec)
                return;
            seen.add(pid);
            out.push({
                linkedPlayerId: pid,
                firstName: rec.firstName || '',
                lastName: rec.lastName || '',
                ageGroup: rec.ageGroup || '',
                sourceSlotId: `${(fp === null || fp === void 0 ? void 0 : fp.id) || 'fp'}_${idx}`,
                sourceTeamName: (fp === null || fp === void 0 ? void 0 : fp.teamName) || '',
            });
        });
    });
    return out;
}
function syncOrgaParticipantsWithMatchmaking(orgaData, fps, playerDb) {
    const base = normalizeOrgaData(orgaData);
    const linked = getLinkedMatchmakingParticipants(fps, playerDb);
    const prevByLinked = new Map(base.participants.map(p => [String(p.linkedPlayerId || ''), p]));
    return {
        ...base,
        participants: linked.map(seed => {
            const prev = prevByLinked.get(String(seed.linkedPlayerId)) || {};
            return makeOrgaParticipant({
                ...prev,
                linkedPlayerId: seed.linkedPlayerId,
                firstName: seed.firstName,
                lastName: seed.lastName,
                ageGroup: seed.ageGroup,
                sourceSlotId: seed.sourceSlotId,
                sourceTeamName: seed.sourceTeamName,
            });
        })
    };
}
function syncBringPlanWithMatchmaking(orgaData, fps, playerDb) {
    const base = syncOrgaParticipantsWithMatchmaking(orgaData, fps, playerDb);
    const bringPlan = normalizeBringPlan(base.bringPlan);
    const prevAssignments = new Map();
    bringPlan.assignments.forEach(entry => {
        const byParticipant = String((entry === null || entry === void 0 ? void 0 : entry.participantId) || '').trim();
        const byLinked = String((entry === null || entry === void 0 ? void 0 : entry.linkedPlayerId) || '').trim();
        if (byParticipant)
            prevAssignments.set(`p:${byParticipant}`, entry);
        if (byLinked)
            prevAssignments.set(`l:${byLinked}`, entry);
    });
    return {
        ...base,
        bringPlan: {
            ...bringPlan,
            assignments: base.participants.map(participant => {
                const pid = String((participant === null || participant === void 0 ? void 0 : participant.id) || '').trim();
                const linked = String((participant === null || participant === void 0 ? void 0 : participant.linkedPlayerId) || '').trim();
                const prev = prevAssignments.get(`p:${pid}`) || prevAssignments.get(`l:${linked}`) || {};
                return makeBringAssignment({ ...prev, participantId: pid, linkedPlayerId: linked });
            })
        }
    };
}
function fpName(fp) { if (!fp)
    return '???'; if (fp.teamName)
    return fp.teamName; return fp.players.map(p => p.nickname || p.name).join(' & '); }
function fpShort(fp) { if (!fp)
    return '???'; if (fp.teamName)
    return fp.teamName; const f = fp.players[0]; return f ? (f.nickname || f.name) : `#${fp.id}`; }
function fpSub(fp) { var _a; if (!fp)
    return ''; if (fp.teamName && fp.players.length)
    return fp.players.map(p => p.nickname ? `"${p.nickname}" ${p.name}` : p.name).join(' · '); if (fp.players.length > 1)
    return fp.players.slice(1).map(p => p.nickname || p.name).join(' & '); return ((_a = fp.players[0]) === null || _a === void 0 ? void 0 : _a.nickname) ? fp.players[0].name : ''; }
function fpLines(fp) { if (!fp)
    return []; if (fp.teamName)
    return fp.players.map(p => p.nickname ? `${p.name} "${p.nickname}"` : p.name); if (fp.players.length === 1)
    return fp.players[0].nickname ? [fp.players[0].name] : []; return fp.players.map(p => p.nickname ? `${p.name} "${p.nickname}"` : p.name); }
function isSolo(fp) { return !fp.teamName; }
function makeGroups(ids, size, pf) {
    if (!ids.length)
        return [];
    const rem = [...ids];
    for (let i = rem.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rem[i], rem[j]] = [rem[j], rem[i]];
    }
    const grps = [];
    while (rem.length >= size) {
        const g = [rem.shift()];
        for (let k = 1; k < size; k++) {
            let bi = 0, bs = Infinity;
            for (let i = 0; i < rem.length; i++) {
                let s = 0;
                for (const x of g) {
                    const kk = [x, rem[i]].sort().join('|');
                    s += (pf[kk] || 0) * 1000 + Math.random();
                }
                if (s < bs) {
                    bs = s;
                    bi = i;
                }
            }
            g.push(rem.splice(bi, 1)[0]);
        }
        grps.push(g);
    }
    rem.forEach((p, i) => { if (grps[i % grps.length])
        grps[i % grps.length].push(p); });
    return grps;
}
function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size)
        chunks.push(arr.slice(i, i + size));
    return chunks;
}
function escapeHtml(v) {
    return String(v !== null && v !== void 0 ? v : '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}


export {
  renderFatalError,
  uniqueStringList,
  pickRandom,
  isKnockoutMode,
  inferTrackDrawMode,
  getModeSelectionKind,
  normalizeAttemptCount,
  isTimeTrialMode,
  normalizeTimeFieldDigits,
  normalizeTimeFieldEntry,
  isTimeFieldEntryComplete,
  parseTimeFieldEntry,
  formatTimeFieldEntry,
  getCupSourceLabel,
  buildDefaultConsolesFromCatalog,
  mergeModeWithDefault,
  normalizeConsoles,
  DEFAULT_CONSOLES,
  sortConsoleNamesByAge,
  getOrderedConsoleCatalog,
  prefCountForExactItem,
  setPrefCountForExactItem,
  controllerAliasesForConsoleName,
  controllerItemLabelForConsole,
  prefCountForConsoleController,
  getPlayerTvCount,
  getPlayerInventoryCounts,
  TCL,
  tc,
  mkFps,
  AGE_OPTIONS,
  prefCountFromLegacy,
  PLAYER_PREF_CATS,
  uniqStrings,
  buildDefaultMasterData,
  makePrefEntry,
  makePlayerRecord,
  normalizePlayerDb,
  fullPlayerName,
  normalizeFpPlayer,
  applyPlayerRecordToSlot,
  syncFpsWithPlayerDb,
  getLinkedMatchmakingParticipants,
  syncOrgaParticipantsWithMatchmaking,
  syncBringPlanWithMatchmaking,
  fpName,
  fpShort,
  fpSub,
  fpLines,
  isSolo,
  makeGroups,
  chunkArray,
  escapeHtml
};
