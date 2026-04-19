import React from 'react';

const { useState, useMemo, useRef } = React;

function isPaidPayment(method) {
    return ['bar', 'überweisung', 'paypal'].includes(String(method || '').toLowerCase());
}
function getRealParticipants(fps) {
    const seen = new Set(), result = [];
    (fps || []).forEach(fp => fp.players.forEach(p => {
        const n = (p.name || '').trim();
        if (!n || /^Spieler\s*\d+$/i.test(n) || seen.has(n))
            return;
        seen.add(n);
        result.push({ name: n, nickname: p.nickname || '' });
    }));
    return result;
}
function makeUid(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function parseNum(v) { const n = parseFloat(String(v !== null && v !== void 0 ? v : '').replace(',', '.')); return isNaN(n) ? 0 : n; }
function money(v) { return parseNum(v).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
const SHOP_CATEGORIES = [['verpflegung', 'Verpflegung'], ['preise', 'Preise'], ['sonstiges', 'Sonstiges']];
function inferShopCategory(item = {}) {
    const raw = `${(item === null || item === void 0 ? void 0 : item.category) || ''}`.trim().toLowerCase();
    if (raw && SHOP_CATEGORIES.some(([value]) => value === raw))
        return raw;
    const name = `${(item === null || item === void 0 ? void 0 : item.name) || (item === null || item === void 0 ? void 0 : item.item) || ''}`.toLowerCase();
    if (/chips|cola|fanta|sprite|wasser|bier|pizza|snack|essen|trinken|verpflegung|würst|bröt|dip|soße|sauce|kaffee/.test(name))
        return 'verpflegung';
    if (/medaill|pokal|urkunde|preis|gewinn|troph|wertmarke/.test(name))
        return 'preise';
    return 'sonstiges';
}
function shortNameLabel(text, max = 20) {
    const clean = String(text || '').trim();
    return clean.length > max ? clean.slice(0, Math.max(0, max - 1)) + '…' : clean;
}
function getShopQty(item, participantCount = 0) {
    if (((item === null || item === void 0 ? void 0 : item.category) || '') === 'verpflegung' && parseNum(item === null || item === void 0 ? void 0 : item.perPerson) > 0) {
        return parseNum(item.perPerson) * Math.max(0, participantCount || 0);
    }
    return parseNum(item === null || item === void 0 ? void 0 : item.qty);
}
function makeOrgaParticipant(seed = {}) {
    var _a, _b, _c;
    const rawMethod = (_a = seed === null || seed === void 0 ? void 0 : seed.paymentMethod) !== null && _a !== void 0 ? _a : 'offen';
    const paymentMethod = String(rawMethod || 'offen').toLowerCase();
    const shoppingItems = uniqStrings(Array.isArray(seed === null || seed === void 0 ? void 0 : seed.shoppingItems) ? seed.shoppingItems : (Array.isArray(seed === null || seed === void 0 ? void 0 : seed.shoppingList) ? seed.shoppingList : []));
    return { id: makeUid('op'), linkedPlayerId: '', mode: 'Solo', firstName: '', lastName: '', group: '', ageGroup: '', paid: isPaidPayment(paymentMethod), paymentMethod: 'offen', setup: false, shopping: false, cooking: false, teardown: false, info: '', shoppingItems, ...seed, paymentMethod, shoppingItems, shopping: shoppingItems.length > 0 ? ((_b = seed === null || seed === void 0 ? void 0 : seed.shopping) !== null && _b !== void 0 ? _b : true) : !!(seed === null || seed === void 0 ? void 0 : seed.shopping), paid: (_c = seed === null || seed === void 0 ? void 0 : seed.paid) !== null && _c !== void 0 ? _c : isPaidPayment(paymentMethod) };
}
function normalizeSourceTitle(seed = {}) { var _a, _b; return String((_b = (_a = seed === null || seed === void 0 ? void 0 : seed.sourceTitle) !== null && _a !== void 0 ? _a : seed === null || seed === void 0 ? void 0 : seed.source) !== null && _b !== void 0 ? _b : '').trim(); }
function normalizeSourceUrl(seed = {}) { var _a, _b; return String((_b = (_a = seed === null || seed === void 0 ? void 0 : seed.sourceUrl) !== null && _a !== void 0 ? _a : seed === null || seed === void 0 ? void 0 : seed.url) !== null && _b !== void 0 ? _b : '').trim(); }
function sourceLabelForItem(item = {}) { return String((item === null || item === void 0 ? void 0 : item.sourceTitle) || (item === null || item === void 0 ? void 0 : item.source) || (item === null || item === void 0 ? void 0 : item.sourceUrl) || '').trim(); }
function externalUrl(url = '') {
    const raw = String(url || '').trim();
    if (!raw)
        return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`;
}
function makeShopItem(seed = {}) {
    const sourceTitle = normalizeSourceTitle(seed), sourceUrl = normalizeSourceUrl(seed);
    return { id: makeUid('shop'), category: 'sonstiges', name: '', variant: '', source: sourceTitle, sourceTitle, sourceUrl, qty: 1, unit: '', perPerson: '', unitPrice: '', shipping: '', done: false, notes: '', ...seed, source: sourceTitle, sourceTitle, sourceUrl };
}
function makeTodoItem(seed = {}) {
    const sourceTitle = normalizeSourceTitle(seed), sourceUrl = normalizeSourceUrl(seed);
    return { id: makeUid('todo'), task: '', owner: '', qty: 1, estCost: '', done: false, notes: '', source: sourceTitle, sourceTitle, sourceUrl, ...seed, source: sourceTitle, sourceTitle, sourceUrl };
}
function makeIdeaItem(seed = {}) {
    const sourceTitle = normalizeSourceTitle(seed), sourceUrl = normalizeSourceUrl(seed);
    return { id: makeUid('idea'), text: '', status: 'offen', notes: '', source: sourceTitle, sourceTitle, sourceUrl, ...seed, source: sourceTitle, sourceTitle, sourceUrl };
}
function makeBringItem(seed = {}) {
    const sourceTitle = normalizeSourceTitle(seed), sourceUrl = normalizeSourceUrl(seed);
    return { id: makeUid('bring'), item: '', qty: 1, who: '', done: false, notes: '', source: sourceTitle, sourceTitle, sourceUrl, ...seed, source: sourceTitle, sourceTitle, sourceUrl };
}
function makeRuleItem(seed = {}) { return { id: makeUid('rule'), title: 'Gebot', text: '', detail: '', ...seed }; }
function makeSetupAsset(seed = {}) { return { id: makeUid('asset'), type: 'Tisch', name: '', qty: 1, width: '', depth: '', location: '', notes: '', ...seed }; }
function makeStation(seed = {}) { return { id: makeUid('station'), name: '', area: '', players: 4, tables: 1, chairs: 4, tv: '', console: '', notes: '', ...seed }; }
function makeChecklistItem(seed = {}) { return { id: makeUid('check'), task: '', status: 'offen', notes: '', ...seed }; }
function makeBringRequirement(seed = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
        id: (seed === null || seed === void 0 ? void 0 : seed.id) || makeUid('breq'),
        consoleName: String((_b = (_a = seed === null || seed === void 0 ? void 0 : seed.consoleName) !== null && _a !== void 0 ? _a : seed === null || seed === void 0 ? void 0 : seed.name) !== null && _b !== void 0 ? _b : '').trim(),
        consoleQty: Math.max(0, parseInt((_d = (_c = seed === null || seed === void 0 ? void 0 : seed.consoleQty) !== null && _c !== void 0 ? _c : seed === null || seed === void 0 ? void 0 : seed.consoleCount) !== null && _d !== void 0 ? _d : 0, 10) || 0),
        controllerQty: Math.max(0, parseInt((_f = (_e = seed === null || seed === void 0 ? void 0 : seed.controllerQty) !== null && _e !== void 0 ? _e : seed === null || seed === void 0 ? void 0 : seed.controllerCount) !== null && _f !== void 0 ? _f : 0, 10) || 0),
        gameQty: Math.max(0, parseInt((_h = (_g = seed === null || seed === void 0 ? void 0 : seed.gameQty) !== null && _g !== void 0 ? _g : seed === null || seed === void 0 ? void 0 : seed.gameCount) !== null && _h !== void 0 ? _h : 0, 10) || 0),
    };
}
function normalizeBringCell(cell) {
    var _a, _b;
    return {
        value: Math.max(0, parseInt((_b = (_a = cell === null || cell === void 0 ? void 0 : cell.value) !== null && _a !== void 0 ? _a : cell) !== null && _b !== void 0 ? _b : 0, 10) || 0),
        touched: !!(cell === null || cell === void 0 ? void 0 : cell.touched),
    };
}
function makeBringAssignment(seed = {}) {
    const rawValues = (seed === null || seed === void 0 ? void 0 : seed.values) || {};
    const values = {};
    Object.keys(rawValues).forEach(key => { values[key] = normalizeBringCell(rawValues[key]); });
    return {
        id: (seed === null || seed === void 0 ? void 0 : seed.id) || makeUid('bassign'),
        participantId: String((seed === null || seed === void 0 ? void 0 : seed.participantId) || ''),
        linkedPlayerId: String((seed === null || seed === void 0 ? void 0 : seed.linkedPlayerId) || ''),
        values,
    };
}
function makeDefaultBringPlan() {
    return {
        requirements: {
            consoles: [],
            tvQty: 0,
        },
        assignments: [],
    };
}
function normalizeBringPlan(plan) {
    var _a, _b, _c, _d, _e;
    const src = plan || {};
    const def = makeDefaultBringPlan();
    return {
        requirements: {
            consoles: Array.isArray((_a = src === null || src === void 0 ? void 0 : src.requirements) === null || _a === void 0 ? void 0 : _a.consoles) ? src.requirements.consoles.map(x => makeBringRequirement(x)) : def.requirements.consoles,
            tvQty: Math.max(0, parseInt((_e = (_c = (_b = src === null || src === void 0 ? void 0 : src.requirements) === null || _b === void 0 ? void 0 : _b.tvQty) !== null && _c !== void 0 ? _c : (_d = src === null || src === void 0 ? void 0 : src.requirements) === null || _d === void 0 ? void 0 : _d.tvCount) !== null && _e !== void 0 ? _e : 0, 10) || 0),
        },
        assignments: Array.isArray(src === null || src === void 0 ? void 0 : src.assignments) ? src.assignments.map(x => makeBringAssignment(x)) : def.assignments,
    };
}
const DEFAULT_ORGA_RULES = [
    { title: 'Gebot 01', text: 'FairPlay – respektiere deinen Gegenüber', detail: '' },
    { title: 'Gebot 02', text: 'Jede Rennstrecke und jeder Wettkampf wird ausgelost', detail: 'Losboxen bei den Konsolen oder Random-Funktion im Spiel.' },
    { title: 'Gebot 03', text: 'Bei der Gesamt-, Team- & Solowertung sind Platz 1, 2 & 3 Wanderpokale', detail: 'Auch bei Nichtteilnahme werden diese wieder eingesammelt.' },
    { title: 'Gebot 04', text: 'Wertmarken dürfen nur unmittelbar nach dem Rennen eingelöst werden!', detail: 'Nur 1x gültig. Bei Switch 1 & 2 müssen mindestens 3 Personen eine Wertmarke einlösen, um das Spiel zu wiederholen.' },
    { title: 'Gebot 05', text: 'Es gibt keine Proberunden oder Neustarts', detail: 'Üben kann man zuhause oder an freien Konsolen.' },
    { title: 'Gebot 06', text: 'Es gilt die gesetzliche „StVO“', detail: '' },
    { title: 'Gebot 07', text: 'Ausreden bzgl. Controller haben keine Gewichtung', detail: '' },
    { title: 'Gebot 08', text: 'Don’t drink and drive!', detail: '' },
    { title: 'Gebot 09', text: 'Bei Punktegleichstand finden Stechen statt', detail: 'Jede Person hat einen Versuch. Solo: Zeitrennen 1 vs 1 mit geloster Konsole. Team: Zeitrennen 2 vs 2 auf der GameCube.' },
    { title: 'Gebot 10', text: 'Regel 1 gilt immer zuerst', detail: 'Regelverstöße klärt die Turnierleitung direkt vor Ort.' },
];
function makeDefaultOrgaData() {
    return {
        participantsMeta: {
            title: 'Mario-Kart Turnier 2026',
            date: '',
            city: '',
            zip: '',
            street: 'Bürgerhaus Isert/Racksen, Sonnenplatz 5',
            fee: 25,
            setupStart: '',
            tournamentStart: '',
        },
        participants: [],
        costs: {
            shopping: [
                makeShopItem({ category: 'preise', name: '1,2,3 Medaillen 4er Set', source: 'Amazon', qty: 1, unitPrice: '12.99' }),
                makeShopItem({ category: 'preise', name: 'Minipokale', qty: 6, unitPrice: '7.50', shipping: '6.50' }),
                makeShopItem({ category: 'sonstiges', name: 'Namensschilder', qty: 160, unitPrice: '9.49' }),
                makeShopItem({ category: 'preise', name: 'Teilnehmerurkunden', source: 'Amazon', qty: 100, unitPrice: '11.99' }),
                makeShopItem({ category: 'preise', name: 'Wertmarken', qty: 24, unitPrice: '5.00' }),
                makeShopItem({ category: 'sonstiges', name: 'Mario Kart Streckenlose', qty: 1, unitPrice: '5.00' }),
            ],
            todos: [
                makeTodoItem({ task: 'Spielplan erstellen', qty: 1, estCost: '0' }),
                makeTodoItem({ task: 'Konsolen organisieren', qty: 1, estCost: '0' }),
                makeTodoItem({ task: 'Mario-Kart Theme Musik vorbereiten', qty: 1, estCost: '0' }),
                makeTodoItem({ task: 'Podest bauen', qty: 1, estCost: '0' }),
            ],
            ideas: [
                makeIdeaItem({ text: 'Finale mit zentralem Gold-TV und Publikum dahinter', status: 'idee' }),
                makeIdeaItem({ text: 'Freie Trainingskonsole abseits der Hauptturnierfläche', status: 'idee' }),
            ],
            bring: [
                makeBringItem({ item: 'Stehtische', qty: 5, who: '' }),
            ],
        },
        bringPlan: makeDefaultBringPlan(),
        rules: DEFAULT_ORGA_RULES.map(r => makeRuleItem(r)),
        setup: {
            room: { width: '', length: '', unit: 'm', notes: '' },
            inventory: [
                makeSetupAsset({ type: 'Tisch', name: 'Biertisch / Turniertisch', qty: 4, width: '220', depth: '50', location: 'Turnierfläche' }),
                makeSetupAsset({ type: 'Stuhl', name: 'Stühle', qty: 24, location: 'Turnierfläche' }),
                makeSetupAsset({ type: 'TV', name: 'Final-TV', qty: 1, location: 'Zentral / Bühne' }),
                makeSetupAsset({ type: 'Konsole', name: 'Switch 1', qty: 1, location: 'Station A' }),
                makeSetupAsset({ type: 'Konsole', name: 'Switch 2', qty: 1, location: 'Station B' }),
            ],
            stations: [
                makeStation({ name: 'Station A', area: 'Links vorne', players: 4, tables: 1, chairs: 4, tv: 'TV 1', console: 'Switch 1' }),
                makeStation({ name: 'Station B', area: 'Rechts vorne', players: 4, tables: 1, chairs: 4, tv: 'TV 2', console: 'Switch 2' }),
                makeStation({ name: 'Finale', area: 'Mitte / Bühne', players: 4, tables: 1, chairs: 6, tv: 'Final-TV', console: 'frei' }),
            ],
            checklist: [
                makeChecklistItem({ task: 'Eingangs- / Orga-Tisch direkt am Eingang aufbauen', status: 'idee' }),
                makeChecklistItem({ task: 'Laufwege zwischen Stationen freihalten', status: 'idee' }),
                makeChecklistItem({ task: 'Freie Trainingskonsole separat stellen', status: 'idee' }),
                makeChecklistItem({ task: 'Sichtbare Beschilderung für Gruppen und Stationen', status: 'offen' }),
            ],
        }
    };
}
function normalizeOrgaData(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17;
    const src = data || {};
    const def = makeDefaultOrgaData();
    return {
        participantsMeta: {
            title: (_b = (_a = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : def.participantsMeta.title,
            date: (_d = (_c = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _c === void 0 ? void 0 : _c.date) !== null && _d !== void 0 ? _d : def.participantsMeta.date,
            city: (_f = (_e = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _e === void 0 ? void 0 : _e.city) !== null && _f !== void 0 ? _f : def.participantsMeta.city,
            zip: (_h = (_g = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _g === void 0 ? void 0 : _g.zip) !== null && _h !== void 0 ? _h : def.participantsMeta.zip,
            street: (_m = (_k = (_j = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _j === void 0 ? void 0 : _j.street) !== null && _k !== void 0 ? _k : (_l = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _l === void 0 ? void 0 : _l.location) !== null && _m !== void 0 ? _m : def.participantsMeta.street,
            fee: (_p = (_o = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _o === void 0 ? void 0 : _o.fee) !== null && _p !== void 0 ? _p : def.participantsMeta.fee,
            setupStart: (_t = (_r = (_q = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _q === void 0 ? void 0 : _q.setupStart) !== null && _r !== void 0 ? _r : (_s = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _s === void 0 ? void 0 : _s.setupWindow) !== null && _t !== void 0 ? _t : def.participantsMeta.setupStart,
            tournamentStart: (_y = (_w = (_u = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _u === void 0 ? void 0 : _u.tournamentStart) !== null && _w !== void 0 ? _w : (_x = src === null || src === void 0 ? void 0 : src.participantsMeta) === null || _x === void 0 ? void 0 : _x.start) !== null && _y !== void 0 ? _y : def.participantsMeta.tournamentStart,
        },
        participants: Array.isArray(src === null || src === void 0 ? void 0 : src.participants) ? src.participants.map(p => makeOrgaParticipant(p)) : def.participants,
        costs: {
            shopping: Array.isArray((_z = src === null || src === void 0 ? void 0 : src.costs) === null || _z === void 0 ? void 0 : _z.shopping) ? src.costs.shopping.map(x => makeShopItem({ ...x, category: inferShopCategory(x) })) : def.costs.shopping,
            todos: Array.isArray((_0 = src === null || src === void 0 ? void 0 : src.costs) === null || _0 === void 0 ? void 0 : _0.todos) ? src.costs.todos.map(x => makeTodoItem(x)) : def.costs.todos,
            ideas: Array.isArray((_1 = src === null || src === void 0 ? void 0 : src.costs) === null || _1 === void 0 ? void 0 : _1.ideas) ? src.costs.ideas.map(x => makeIdeaItem(x)) : def.costs.ideas,
            bring: Array.isArray((_2 = src === null || src === void 0 ? void 0 : src.costs) === null || _2 === void 0 ? void 0 : _2.bring) ? src.costs.bring.map(x => makeBringItem(x)) : def.costs.bring,
        },
        bringPlan: normalizeBringPlan(src === null || src === void 0 ? void 0 : src.bringPlan),
        rules: Array.isArray(src === null || src === void 0 ? void 0 : src.rules) ? src.rules.map(x => makeRuleItem(x)) : def.rules,
        setup: {
            room: {
                width: (_5 = (_4 = (_3 = src === null || src === void 0 ? void 0 : src.setup) === null || _3 === void 0 ? void 0 : _3.room) === null || _4 === void 0 ? void 0 : _4.width) !== null && _5 !== void 0 ? _5 : def.setup.room.width,
                length: (_8 = (_7 = (_6 = src === null || src === void 0 ? void 0 : src.setup) === null || _6 === void 0 ? void 0 : _6.room) === null || _7 === void 0 ? void 0 : _7.length) !== null && _8 !== void 0 ? _8 : def.setup.room.length,
                unit: (_11 = (_10 = (_9 = src === null || src === void 0 ? void 0 : src.setup) === null || _9 === void 0 ? void 0 : _9.room) === null || _10 === void 0 ? void 0 : _10.unit) !== null && _11 !== void 0 ? _11 : def.setup.room.unit,
                notes: (_14 = (_13 = (_12 = src === null || src === void 0 ? void 0 : src.setup) === null || _12 === void 0 ? void 0 : _12.room) === null || _13 === void 0 ? void 0 : _13.notes) !== null && _14 !== void 0 ? _14 : def.setup.room.notes,
            },
            inventory: Array.isArray((_15 = src === null || src === void 0 ? void 0 : src.setup) === null || _15 === void 0 ? void 0 : _15.inventory) ? src.setup.inventory.map(x => makeSetupAsset(x)) : def.setup.inventory,
            stations: Array.isArray((_16 = src === null || src === void 0 ? void 0 : src.setup) === null || _16 === void 0 ? void 0 : _16.stations) ? src.setup.stations.map(x => makeStation(x)) : def.setup.stations,
            checklist: Array.isArray((_17 = src === null || src === void 0 ? void 0 : src.setup) === null || _17 === void 0 ? void 0 : _17.checklist) ? src.setup.checklist.map(x => makeChecklistItem(x)) : def.setup.checklist,
        },
        tickerTemplates: Array.isArray(src?.tickerTemplates) ? src.tickerTemplates : undefined,
        tickerSpeed: (src?.tickerSpeed != null && !isNaN(parseFloat(src?.tickerSpeed))) ? parseFloat(src.tickerSpeed) : 80,
    };
}
function MiniStat({ label, value, color = '#fff5e8', border = '#f5d2a8', text = '#8a4d00' }) {
    return (React.createElement("div", { style: { background: color, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', minWidth: 140 } },
        React.createElement("div", { style: { fontSize: 9, fontFamily: 'var(--fd)', letterSpacing: 1, color: text, opacity: .8, textTransform: 'uppercase' } }, label),
        React.createElement("div", { style: { fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 16, color: text, marginTop: 2 } }, value)));
}
function BoolPill({ value, onToggle, label, color = 'var(--red)' }) {
    return React.createElement("button", { className: `tog${value ? ' on' : ''}`, onClick: onToggle, title: label, style: value ? { background: color } : {} });
}
function OrgTeilnehmerTab({ orgaData, setOrgaData, playerDb, fps }) {
    const data = syncOrgaParticipantsWithMatchmaking(orgaData, fps, playerDb);
    const linkedPlayers = getLinkedMatchmakingParticipants(fps, playerDb);
    const missingLinked = (fps || []).reduce((sum, fp) => sum + (((fp === null || fp === void 0 ? void 0 : fp.players) || []).filter(p => !((p === null || p === void 0 ? void 0 : p.dbPlayerId) || '')).length), 0);
    const fee = parseNum(data.participantsMeta.fee);
    const paidCount = data.participants.filter(p => p.paid).length;
    const adultCount = data.participants.filter(p => p.ageGroup === 'ue18').length;
    const youthCount = data.participants.filter(p => p.ageGroup === 'u18').length;
    const paidSum = paidCount * fee;
    const openSum = (data.participants.length - paidCount) * fee;
    const setupHelpers = data.participants.filter(p => p.setup).length;
    const shoppingHelpers = data.participants.filter(p => (p.shoppingItems || []).length > 0 || p.shopping).length;
    const cookingHelpers = data.participants.filter(p => p.cooking).length;
    const teardownHelpers = data.participants.filter(p => p.teardown).length;
    const [openShoppingFor, setOpenShoppingFor] = useState({});
    const shoppingCatalog = useMemo(() => {
        var _a, _b;
        return uniqStrings([
            ...((((_a = data === null || data === void 0 ? void 0 : data.costs) === null || _a === void 0 ? void 0 : _a.shopping) || []).map(item => (item === null || item === void 0 ? void 0 : item.name) || (item === null || item === void 0 ? void 0 : item.item) || '')),
            ...((((_b = data === null || data === void 0 ? void 0 : data.costs) === null || _b === void 0 ? void 0 : _b.bring) || []).map(item => (item === null || item === void 0 ? void 0 : item.item) || (item === null || item === void 0 ? void 0 : item.name) || '')),
        ]);
    }, [data === null || data === void 0 ? void 0 : data.costs]);
    // Structured catalog: grouped by SHOP_CATEGORIES, then a "Mitbringen" section
    const structuredCatalog = useMemo(() => {
        var _a;
        const groups = SHOP_CATEGORIES.map(([val, label]) => {
            var _a;
            return ({
                val, label,
                items: (((_a = data === null || data === void 0 ? void 0 : data.costs) === null || _a === void 0 ? void 0 : _a.shopping) || []).filter(x => inferShopCategory(x) === val).map(x => x.name || x.item || '').filter(Boolean)
            });
        }).filter(g => g.items.length > 0);
        const bringItems = (((_a = data === null || data === void 0 ? void 0 : data.costs) === null || _a === void 0 ? void 0 : _a.bring) || []).map(x => x.item || x.name || '').filter(Boolean);
        if (bringItems.length)
            groups.push({ val: 'bring', label: '🎒 Mitbringen', items: bringItems });
        return groups;
    }, [data === null || data === void 0 ? void 0 : data.costs]);
    const slotMap = new Map();
    (fps || []).forEach(fp => {
        ((fp === null || fp === void 0 ? void 0 : fp.players) || []).forEach((pl, idx) => {
            slotMap.set(`${(fp === null || fp === void 0 ? void 0 : fp.id) || 'fp'}_${idx}`, { fp, player: pl, index: idx });
        });
    });
    function mutate(mutator) {
        setOrgaData(prev => {
            const next = syncOrgaParticipantsWithMatchmaking(prev, fps, playerDb);
            mutator(next);
            return next;
        });
    }
    function updateMeta(field, val) { mutate(next => { next.participantsMeta[field] = val; }); }
    function updateParticipant(id, patch) { mutate(next => { next.participants = next.participants.map(p => p.id === id ? { ...p, ...patch } : p); }); }
    function getSourceEntry(participant) { return slotMap.get(participant.sourceSlotId) || null; }
    function participantDisplayName(participant) {
        var _a;
        const source = getSourceEntry(participant);
        return ((_a = source === null || source === void 0 ? void 0 : source.player) === null || _a === void 0 ? void 0 : _a.name) || fullPlayerName(participant) || 'Ohne Namen';
    }
    function participantType(participant) {
        const source = getSourceEntry(participant);
        const fp = source === null || source === void 0 ? void 0 : source.fp;
        return fp && (fp.teamName || ((fp.players || []).length > 1)) ? 'team' : 'solo';
    }
    function toggleShoppingPanel(id) {
        setOpenShoppingFor(prev => ({ ...prev, [id]: !prev[id] }));
    }
    function toggleShoppingItem(participant, itemLabel) {
        const item = String(itemLabel || '').trim();
        if (!item)
            return;
        const current = uniqStrings((participant === null || participant === void 0 ? void 0 : participant.shoppingItems) || []);
        const nextItems = current.includes(item) ? current.filter(entry => entry !== item) : [...current, item];
        updateParticipant(participant.id, { shoppingItems: nextItems, shopping: nextItems.length > 0 });
    }
    return (React.createElement("div", null,
        React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, "\uD83D\uDC65 Teilnehmer \u00B7 Organisation"),
                React.createElement("div", { className: "flex g2 fca" },
                    React.createElement("span", { className: "chip chip-b" }, "Automatisch aus Matchmaking"),
                    React.createElement("span", { className: "chip chip-g" },
                        linkedPlayers.length,
                        " verkn\u00FCpft"),
                    React.createElement("button", { className: "btn bd bsm", title: "Alle Werte (Haken, Notizen etc.) zur\u00FCcksetzen \u2013 Teilnehmer bleiben", onClick: () => mutate(next => { next.participants = next.participants.map(p => ({ ...p, paid: false, paymentMethod: 'offen', setup: false, shopping: false, cooking: false, teardown: false, info: '', shoppingItems: [] })); }) }, "\u21BA Reset"))),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.6fr', gap: 12 } },
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Titel"),
                    React.createElement("input", { type: "text", value: data.participantsMeta.title, onChange: e => updateMeta('title', e.target.value), placeholder: "z. B. Mario Kart World Cup 2026" })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Datum"),
                    React.createElement("input", { type: "text", value: data.participantsMeta.date, onChange: e => updateMeta('date', e.target.value), placeholder: "z. B. 19.04.2026" })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Startzeit Turnier"),
                    React.createElement("input", { type: "text", value: data.participantsMeta.tournamentStart, onChange: e => updateMeta('tournamentStart', e.target.value), placeholder: "z. B. 14:00" })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Startzeit Aufbau"),
                    React.createElement("input", { type: "text", value: data.participantsMeta.setupStart, onChange: e => updateMeta('setupStart', e.target.value), placeholder: "z. B. 10:00" }))),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1.4fr .8fr 2fr 1fr', gap: 12, marginTop: 12 } },
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Ort"),
                    React.createElement("input", { type: "text", value: data.participantsMeta.city, onChange: e => updateMeta('city', e.target.value), placeholder: "Ort" })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "PLZ"),
                    React.createElement("input", { type: "text", value: data.participantsMeta.zip, onChange: e => updateMeta('zip', e.target.value), placeholder: "PLZ" })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Stra\u00DFe"),
                    React.createElement("input", { type: "text", value: data.participantsMeta.street, onChange: e => updateMeta('street', e.target.value), placeholder: "Stra\u00DFe + Hausnummer" })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Beitrag (\u20AC)"),
                    React.createElement("input", { type: "number", value: data.participantsMeta.fee, onChange: e => updateMeta('fee', e.target.value), min: "0" }))),
            React.createElement("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 } },
                React.createElement(MiniStat, { label: "Teilnehmer U18 / \u00DC18", value: `${youthCount} / ${adultCount}` }),
                React.createElement(MiniStat, { label: "Bezahlt", value: `${paidCount} / ${data.participants.length}`, color: "#f0fff4", border: "#b7f5c8", text: "#0a8a3a" }),
                React.createElement(MiniStat, { label: "Offene Summe", value: money(openSum), color: "#fff5f5", border: "#ffcccc", text: "#b8001f" }),
                React.createElement(MiniStat, { label: "Gezahlte Summe", value: money(paidSum), color: "#f7f3ff", border: "#d8c8ff", text: "#5f28a5" }),
                React.createElement(MiniStat, { label: "Aufbau", value: setupHelpers, color: "#f0f5ff", border: "#c0d0ff", text: "#2040a0" }),
                React.createElement(MiniStat, { label: "Einkauf", value: shoppingHelpers, color: "#f0fff4", border: "#b7f5c8", text: "#0a8a3a" }),
                React.createElement(MiniStat, { label: "Kochen", value: cookingHelpers, color: "#fff8e0", border: "#ffd966", text: "#8a6000" }),
                React.createElement(MiniStat, { label: "Abbau", value: teardownHelpers, color: "#f4f1ff", border: "#d8c8ff", text: "#6a4fd5" }),
                missingLinked > 0 && React.createElement(MiniStat, { label: "Nicht verkn\u00FCpft", value: missingLinked, color: "#fff8e0", border: "#ffd966", text: "#8a6000" }))),
        React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, "Teilnehmerliste"),
                React.createElement("span", { className: "chip" },
                    data.participants.length,
                    " Eintr\u00E4ge")),
            data.participants.length === 0 && React.createElement("div", { className: "muted text-sm" }, "Noch keine verkn\u00FCpften Personen in Matchmaking ausgew\u00E4hlt."),
            data.participants.length > 0 && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(220px,1.25fr) 52px 132px 74px 74px 74px 116px minmax(190px,1.45fr)', gap: 8, alignItems: 'center', padding: '0 8px', fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } },
                    React.createElement("div", null, "Teilnehmer"),
                    React.createElement("div", null, "Typ"),
                    React.createElement("div", null, "Zahlweg"),
                    React.createElement("div", null, "Aufbau"),
                    React.createElement("div", null, "Kochen"),
                    React.createElement("div", null, "Abbau"),
                    React.createElement("div", null, "Einkauf"),
                    React.createElement("div", null, "Info")),
                data.participants.map((p, idx) => {
                    const type = participantType(p);
                    const typeBadge = type === 'team'
                        ? React.createElement("span", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(180deg,#ffe68f,#d5a400)', border: '1px solid #b58900', color: '#4c3700', fontFamily: 'var(--fd)', fontWeight: 900, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.35)' } }, "T")
                        : React.createElement("span", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(180deg,#87bfff,#2c73d9)', border: '1px solid #1d58ad', color: '#fff', fontFamily: 'var(--fd)', fontWeight: 900, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.22)' } }, "S");
                    const selectedShopping = uniqStrings(p.shoppingItems || []);
                    const shoppingOpen = !!openShoppingFor[p.id];
                    return (React.createElement("div", { key: p.id, style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(220px,1.25fr) 52px 132px 74px 74px 74px 116px minmax(190px,1.45fr)', gap: 8, alignItems: 'center', background: '#fff', border: '2px solid #dfe3f4', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 4px rgba(12,12,20,.04)' } },
                            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 } },
                                React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 11, color: 'var(--muted)', minWidth: 28 } }, String(idx + 1).padStart(2, '0')),
                                React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: 'var(--dk)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, participantDisplayName(p))),
                            React.createElement("div", { style: { display: 'flex', justifyContent: 'center' } }, typeBadge),
                            React.createElement("div", null,
                                React.createElement("select", { value: p.paymentMethod || 'offen', onChange: e => updateParticipant(p.id, { paymentMethod: e.target.value, paid: isPaidPayment(e.target.value) }) }, ORGA_PAYMENT_OPTIONS.map(([value, label]) => React.createElement("option", { key: value, value: value }, label)))),
                            React.createElement("div", { style: { display: 'flex', justifyContent: 'center' } },
                                React.createElement(BoolPill, { value: !!p.setup, onToggle: () => updateParticipant(p.id, { setup: !p.setup }), label: "Aufbau", color: "var(--blue)" })),
                            React.createElement("div", { style: { display: 'flex', justifyContent: 'center' } },
                                React.createElement(BoolPill, { value: !!p.cooking, onToggle: () => updateParticipant(p.id, { cooking: !p.cooking }), label: "Kochen", color: "#b8860b" })),
                            React.createElement("div", { style: { display: 'flex', justifyContent: 'center' } },
                                React.createElement(BoolPill, { value: !!p.teardown, onToggle: () => updateParticipant(p.id, { teardown: !p.teardown }), label: "Abbau", color: "#6a4fd5" })),
                            React.createElement("div", { style: { display: 'flex', justifyContent: 'center' } },
                                React.createElement("button", { className: `btn ${selectedShopping.length ? 'bp' : 'bs'} bsm`, onClick: () => toggleShoppingPanel(p.id) }, selectedShopping.length ? `🛒 ${selectedShopping.length}` : '🛒 Auswahl')),
                            React.createElement("div", null,
                                React.createElement("input", { type: "text", value: p.info || '', onChange: e => updateParticipant(p.id, { info: e.target.value }), placeholder: "Info / Notiz" }))),
                        shoppingOpen && (React.createElement("div", { style: { background: '#fffdf4', border: '1px solid #f1d98b', borderRadius: 10, padding: '12px 14px', marginTop: -2, boxShadow: '0 1px 4px rgba(12,12,20,.04)' } },
                            React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 } },
                                React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 10, letterSpacing: 1, color: '#8a6000', textTransform: 'uppercase' } },
                                    "Einkauf f\u00FCr ",
                                    participantDisplayName(p)),
                                React.createElement("div", { className: "muted text-sm", style: { fontSize: 12 } }, selectedShopping.length ? `Ausgewählt: ${selectedShopping.join(' · ')}` : 'Noch nichts ausgewählt')),
                            shoppingCatalog.length === 0 && React.createElement("div", { className: "muted text-sm" }, "Im Kosten-Tab sind noch keine Einkaufsartikel angelegt."),
                            shoppingCatalog.length > 0 && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, structuredCatalog.map(group => {
                                // Items claimed by OTHER participants
                                const claimedByOthers = new Set(data.participants
                                    .filter(other => other.id !== p.id)
                                    .flatMap(other => other.shoppingItems || []));
                                return (React.createElement("div", { key: group.val },
                                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8a6000', marginBottom: 5 } }, group.label),
                                    React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, group.items.map(item => {
                                        const active = selectedShopping.includes(item);
                                        const takenByOther = !active && claimedByOthers.has(item);
                                        return (React.createElement("button", { key: item, className: `btn bsm ${active ? 'bp' : takenByOther ? 'bd' : 'bs'}`, onClick: () => !takenByOther && toggleShoppingItem(p, item), title: takenByOther ? 'Bereits von jemand anderem übernommen' : item, style: { opacity: takenByOther ? .45 : 1, cursor: takenByOther ? 'not-allowed' : 'pointer', textDecoration: takenByOther ? 'line-through' : 'none' } },
                                            active ? '✓ ' : takenByOther ? '✗ ' : '+',
                                            shortNameLabel(item, 30)));
                                    }))));
                            })))))));
                }))))));
}
function WerBringtWasTab({ orgaData, setOrgaData, playerDb, fps, consoles }) {
    const data = syncBringPlanWithMatchmaking(orgaData, fps, playerDb);
    const normalizedDb = normalizePlayerDb(playerDb, consoles);
    const dbPlayers = normalizedDb.players || [];
    const participants = data.participants || [];
    const bringPlan = normalizeBringPlan(data.bringPlan);
    const reqConsoles = bringPlan.requirements.consoles || [];
    const orderedReqConsoles = useMemo(() => [...reqConsoles].sort((a, b) => {
        const ay = consoleYearForName(a === null || a === void 0 ? void 0 : a.consoleName, consoles), by = consoleYearForName(b === null || b === void 0 ? void 0 : b.consoleName, consoles);
        if (ay !== by)
            return ay - by;
        return String((a === null || a === void 0 ? void 0 : a.consoleName) || '').localeCompare(String((b === null || b === void 0 ? void 0 : b.consoleName) || ''), 'de');
    }), [reqConsoles, consoles]);
    const tvQty = reqConsoles.length > 0
        ? (reqConsoles.reduce((sum, req) => { var _a; return sum + Math.max(0, parseInt((_a = req === null || req === void 0 ? void 0 : req.consoleQty) !== null && _a !== void 0 ? _a : 0, 10) || 0); }, 0) + 2)
        : 0;
    const playerMap = useMemo(() => new Map(dbPlayers.map(p => [String(p.id), p])), [dbPlayers]);
    const assignmentMap = useMemo(() => new Map((bringPlan.assignments || []).map(a => [String(a.participantId || ''), a])), [bringPlan.assignments]);
    const slotMap = useMemo(() => {
        const map = new Map();
        (fps || []).forEach(fp => {
            ((fp === null || fp === void 0 ? void 0 : fp.players) || []).forEach((pl, idx) => {
                map.set(`${(fp === null || fp === void 0 ? void 0 : fp.id) || 'fp'}_${idx}`, { fp, player: pl, index: idx });
            });
        });
        return map;
    }, [fps]);
    const consoleGameMap = useMemo(() => {
        const map = {};
        (consoles || []).forEach(con => {
            const key = normalizeKey(con === null || con === void 0 ? void 0 : con.name);
            if (key && !map[key])
                map[key] = String((con === null || con === void 0 ? void 0 : con.game) || '').trim();
        });
        return map;
    }, [consoles]);
    const consoleOptions = useMemo(() => sortConsoleNamesByAge(uniqStrings([
        ...((consoles || []).map(c => c.name)),
        ...reqConsoles.map(r => r.consoleName),
    ]), consoles), [consoles, reqConsoles]);
    const [reqModal, setReqModal] = useState(false);
    const [reqDraft, setReqDraft] = useState({ consoles: [] });
    function normalizeKey(text = '') { return String(text || '').trim().toLowerCase().replace(/\s+/g, ' '); }
    function cellKey(consoleName, type) { return `${consoleName}::${type}`; }
    function cloneRequirements() {
        return {
            consoles: reqConsoles.map(req => ({ ...req })),
        };
    }
    function openRequirements() { setReqDraft(cloneRequirements()); setReqModal(true); }
    function toggleDraftConsole(consoleName) {
        setReqDraft(prev => {
            const exists = (prev.consoles || []).some(req => req.consoleName === consoleName);
            return {
                ...prev,
                consoles: exists
                    ? (prev.consoles || []).filter(req => req.consoleName !== consoleName)
                    : [...(prev.consoles || []), makeBringRequirement({ consoleName, consoleQty: 1, controllerQty: 2, gameQty: 1 })]
            };
        });
    }
    function updateDraftConsole(consoleName, field, value) {
        setReqDraft(prev => ({
            ...prev,
            consoles: (prev.consoles || []).map(req => req.consoleName === consoleName ? { ...req, [field]: Math.max(0, parseInt(value, 10) || 0) } : req)
        }));
    }
    function saveRequirements() {
        const cleaned = (reqDraft.consoles || [])
            .map(req => makeBringRequirement(req))
            .filter(req => req.consoleName && (req.consoleQty > 0 || req.controllerQty > 0 || req.gameQty > 0));
        mutate(next => {
            const current = normalizeBringPlan(next.bringPlan);
            next.bringPlan = {
                ...current,
                requirements: {
                    consoles: cleaned,
                    tvQty: 0,
                }
            };
        });
        setReqModal(false);
    }
    function mutate(mutator) {
        setOrgaData(prev => {
            const next = syncBringPlanWithMatchmaking(prev, fps, playerDb);
            mutator(next);
            return next;
        });
    }
    function ensureAssignment(plan, participant) {
        if (!plan.assignments)
            plan.assignments = [];
        let entry = plan.assignments.find(item => String(item.participantId || '') === String(participant.id || ''));
        if (!entry) {
            entry = makeBringAssignment({ participantId: String(participant.id || ''), linkedPlayerId: String(participant.linkedPlayerId || '') });
            plan.assignments.push(entry);
        }
        if (!entry.values)
            entry.values = {};
        return entry;
    }
    function updateCell(participant, key, value) {
        mutate(next => {
            next.bringPlan = normalizeBringPlan(next.bringPlan);
            const entry = ensureAssignment(next.bringPlan, participant);
            entry.values[key] = { value: Math.max(0, parseInt(value, 10) || 0), touched: true };
        });
    }
    function participantDisplayName(participant) {
        var _a;
        const source = slotMap.get((participant === null || participant === void 0 ? void 0 : participant.sourceSlotId) || '');
        return ((_a = source === null || source === void 0 ? void 0 : source.player) === null || _a === void 0 ? void 0 : _a.name) || fullPlayerName(participant) || 'Ohne Namen';
    }
    function participantType(participant) {
        const source = slotMap.get((participant === null || participant === void 0 ? void 0 : participant.sourceSlotId) || '');
        const fp = source === null || source === void 0 ? void 0 : source.fp;
        return fp && (fp.teamName || ((fp.players || []).length > 1)) ? 'team' : 'solo';
    }
    function sumEntries(entries, matcher) {
        return (entries || []).reduce((sum, entry) => {
            var _a;
            const itemKey = normalizeKey(entry === null || entry === void 0 ? void 0 : entry.item);
            return matcher(itemKey, entry) ? sum + prefCountFromLegacy((_a = entry === null || entry === void 0 ? void 0 : entry.count) !== null && _a !== void 0 ? _a : 0) : sum;
        }, 0);
    }
    function controllerAliasesForConsole(consoleName) {
        const key = normalizeKey(consoleName);
        const aliases = [];
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
        return aliases;
    }
    function matchesAlias(itemKey, aliases) {
        return aliases.some(alias => itemKey === alias || itemKey.includes(alias) || alias.includes(itemKey));
    }
    function getSuggestedValue(participant, consoleName, type) {
        var _a, _b, _c, _d;
        const record = playerMap.get(String((participant === null || participant === void 0 ? void 0 : participant.linkedPlayerId) || ''));
        if (!record)
            return 0;
        if (type === 'tv')
            return sumEntries(((_a = record === null || record === void 0 ? void 0 : record.prefs) === null || _a === void 0 ? void 0 : _a.tvs) || [], () => true);
        const consoleKey = normalizeKey(consoleName);
        if (type === 'console') {
            return sumEntries(((_b = record === null || record === void 0 ? void 0 : record.prefs) === null || _b === void 0 ? void 0 : _b.consoles) || [], itemKey => itemKey === consoleKey);
        }
        if (type === 'controller') {
            return sumEntries(((_c = record === null || record === void 0 ? void 0 : record.prefs) === null || _c === void 0 ? void 0 : _c.controllers) || [], itemKey => matchesAlias(itemKey, controllerAliasesForConsole(consoleName)));
        }
        if (type === 'game') {
            const gameName = consoleGameMap[consoleKey] || '';
            const gameKey = normalizeKey(gameName);
            return sumEntries(((_d = record === null || record === void 0 ? void 0 : record.prefs) === null || _d === void 0 ? void 0 : _d.games) || [], itemKey => gameKey ? itemKey === gameKey : false);
        }
        return 0;
    }
    function getCellMeta(participant, key, suggestedValue) {
        var _a, _b;
        const assignment = assignmentMap.get(String((participant === null || participant === void 0 ? void 0 : participant.id) || ''));
        const cell = (_a = assignment === null || assignment === void 0 ? void 0 : assignment.values) === null || _a === void 0 ? void 0 : _a[key];
        const touched = !!(cell === null || cell === void 0 ? void 0 : cell.touched);
        const rawValue = Math.max(0, parseInt((_b = cell === null || cell === void 0 ? void 0 : cell.value) !== null && _b !== void 0 ? _b : 0, 10) || 0);
        const suggested = Math.max(0, parseInt(suggestedValue !== null && suggestedValue !== void 0 ? suggestedValue : 0, 10) || 0);
        const value = touched ? rawValue : (rawValue > 0 ? rawValue : suggested);
        return { value, touched, suggested, highlighted: !touched && value > 0 };
    }
    function assignedTotal(consoleName, type) {
        return participants.reduce((sum, participant) => sum + getCellMeta(participant, cellKey(consoleName, type), getSuggestedValue(participant, consoleName, type)).value, 0);
    }
    function assignedTvTotal() {
        return participants.reduce((sum, participant) => sum + getCellMeta(participant, 'tv', getSuggestedValue(participant, '', 'tv')).value, 0);
    }
    return (React.createElement("div", null,
        React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, "\uD83C\uDF92 Wer bringt was?"),
                React.createElement("div", { className: "flex g2 fca" },
                    React.createElement("span", { className: "chip chip-b" },
                        participants.length,
                        " Teilnehmer"),
                    React.createElement("span", { className: "chip" },
                        orderedReqConsoles.length,
                        " Konsolenbl\u00F6cke"),
                    React.createElement("button", { className: "btn bp", onClick: openRequirements }, "\u2699\uFE0F Bedarf ausw\u00E4hlen"),
                    React.createElement("button", { className: "btn bd bsm", title: "Alle manuell eingetragenen Mengen zur\u00FCcksetzen und DB-Werte wiederherstellen", onClick: () => mutate(next => { next.participants = next.participants.map(p => ({ ...p, committed: {} })); }) }, "\u21BA Reset"))),
            orderedReqConsoles.length === 0 && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "alert alert-i", style: { marginTop: -2 } },
                    React.createElement("span", null, "\u2139\uFE0F"),
                    React.createElement("div", null,
                        "Lege zuerst fest, was f\u00FCr das Turnier gebraucht wird. Danach kannst du pro Teilnehmer eintragen, wer was wirklich mitbringt. ",
                        React.createElement("strong", null, "Blau markierte Felder"),
                        " sind Startwerte aus den ",
                        React.createElement("strong", null, "Spielerdaten"),
                        " und bleiben so lange hervorgehoben, bis du sie einmal manuell \u00E4nderst.")),
                React.createElement("div", { className: "muted text-sm", style: { paddingTop: 4 } }, "Noch kein Bedarf ausgew\u00E4hlt."))),
            orderedReqConsoles.length > 0 && (React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 12, marginTop: 12, alignItems: 'stretch' } },
                orderedReqConsoles.map(req => {
                    const assignedConsole = assignedTotal(req.consoleName, 'console');
                    const assignedController = assignedTotal(req.consoleName, 'controller');
                    const assignedGame = assignedTotal(req.consoleName, 'game');
                    const needTotal = req.consoleQty + req.controllerQty + req.gameQty;
                    const assigned = assignedConsole + assignedController + assignedGame;
                    const missing = Math.max(needTotal - assigned, 0);
                    const gameName = consoleGameMap[normalizeKey(req.consoleName)] || '–';
                    return (React.createElement("div", { key: req.id || req.consoleName, className: "card", style: { padding: 12, marginBottom: 0, borderTop: `3px solid ${missing > 0 ? '#e60012' : '#0a8a3a'}` } },
                        React.createElement("div", { className: "card-hdr", style: { marginBottom: 8 } },
                            React.createElement("span", { className: "ctitle", style: { fontSize: 12 } }, req.consoleName),
                            React.createElement("span", { className: `chip ${missing > 0 ? 'chip-r' : 'chip-g'}` }, missing > 0 ? `${missing} offen` : 'komplett')),
                        React.createElement("div", { style: { border: '1px solid var(--bord)', borderRadius: 8, overflow: 'hidden', fontSize: 12 } },
                            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '96px repeat(3,minmax(52px,1fr))', background: 'var(--card2)', borderBottom: '1px solid var(--bord)' } },
                                React.createElement("div", { style: { padding: '7px 8px', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, req.consoleName),
                                React.createElement("div", { style: { padding: '7px 4px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, "K"),
                                React.createElement("div", { style: { padding: '7px 4px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, "C"),
                                React.createElement("div", { style: { padding: '7px 4px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, "S")),
                            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '96px repeat(3,minmax(52px,1fr))', borderBottom: '1px solid var(--bord)' } },
                                React.createElement("div", { style: { padding: '8px', fontWeight: 700, color: 'var(--dk)' } }, "Ben\u00F6tigt"),
                                React.createElement("div", { style: { padding: '8px 4px', textAlign: 'center', fontWeight: 700 } }, req.consoleQty),
                                React.createElement("div", { style: { padding: '8px 4px', textAlign: 'center', fontWeight: 700 } }, req.controllerQty),
                                React.createElement("div", { style: { padding: '8px 4px', textAlign: 'center', fontWeight: 700 } }, req.gameQty)),
                            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '96px repeat(3,minmax(52px,1fr))' } },
                                React.createElement("div", { style: { padding: '8px', fontWeight: 700, color: 'var(--dk)' } }, "Verf\u00FCgbar"),
                                React.createElement("div", { style: { padding: '8px 4px', textAlign: 'center', fontWeight: 700, color: assignedConsole < req.consoleQty ? 'var(--red)' : 'var(--green)' } }, assignedConsole),
                                React.createElement("div", { style: { padding: '8px 4px', textAlign: 'center', fontWeight: 700, color: assignedController < req.controllerQty ? 'var(--red)' : 'var(--green)' } }, assignedController),
                                React.createElement("div", { style: { padding: '8px 4px', textAlign: 'center', fontWeight: 700, color: assignedGame < req.gameQty ? 'var(--red)' : 'var(--green)' } }, assignedGame))),
                        React.createElement("div", { className: "muted text-sm", style: { marginTop: 6 } },
                            "Spiel: ",
                            gameName)));
                }),
                React.createElement("div", { className: "card", style: { padding: 12, marginBottom: 0, borderTop: `3px solid ${Math.max(tvQty - assignedTvTotal(), 0) > 0 ? '#e60012' : '#0a8a3a'}` } },
                    React.createElement("div", { className: "card-hdr", style: { marginBottom: 8 } },
                        React.createElement("span", { className: "ctitle", style: { fontSize: 12 } }, "TV"),
                        React.createElement("span", { className: `chip ${Math.max(tvQty - assignedTvTotal(), 0) > 0 ? 'chip-r' : 'chip-g'}` }, Math.max(tvQty - assignedTvTotal(), 0) > 0 ? `${Math.max(tvQty - assignedTvTotal(), 0)} offen` : 'komplett')),
                    React.createElement("div", { style: { border: '1px solid var(--bord)', borderRadius: 8, overflow: 'hidden', fontSize: 12 } },
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '96px 1fr', background: 'var(--card2)', borderBottom: '1px solid var(--bord)' } },
                            React.createElement("div", { style: { padding: '7px 8px', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, "TV"),
                            React.createElement("div", { style: { padding: '7px 4px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, "Anzahl")),
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '96px 1fr', borderBottom: '1px solid var(--bord)' } },
                            React.createElement("div", { style: { padding: '8px', fontWeight: 700, color: 'var(--dk)' } }, "Ben\u00F6tigt"),
                            React.createElement("div", { style: { padding: '8px 4px', textAlign: 'center', fontWeight: 700 } }, tvQty)),
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '96px 1fr' } },
                            React.createElement("div", { style: { padding: '8px', fontWeight: 700, color: 'var(--dk)' } }, "Verf\u00FCgbar"),
                            React.createElement("div", { style: { padding: '8px 4px', textAlign: 'center', fontWeight: 700, color: assignedTvTotal() < tvQty ? 'var(--red)' : 'var(--green)' } }, assignedTvTotal()))),
                    React.createElement("div", { className: "muted text-sm", style: { marginTop: 6 } }, "Automatisch: Summe aller ben\u00F6tigten Konsolen + 2"))))),
        React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, "Mitbring-Liste"),
                React.createElement("span", { className: "chip" },
                    participants.length,
                    " Eintr\u00E4ge")),
            participants.length === 0 && React.createElement("div", { className: "muted text-sm" }, "Noch keine verkn\u00FCpften Teilnehmer vorhanden."),
            participants.length > 0 && (React.createElement("div", null,
                React.createElement("table", { style: { width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' } },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", { rowSpan: 2, style: { width: 190, textAlign: 'left', padding: '8px 10px', fontFamily: 'var(--fd)', fontSize: 10, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, "Teilnehmer"),
                            orderedReqConsoles.map(req => React.createElement("th", { key: `${req.consoleName}_top`, colSpan: 3, style: { textAlign: 'center', padding: '8px 4px', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', lineHeight: 1.15, wordBreak: 'break-word', border: '2px solid #cfd6ea', borderBottom: '1px solid #dfe3f4', background: '#f7f9ff' } }, req.consoleName)),
                            React.createElement("th", { rowSpan: 2, style: { width: 48, textAlign: 'center', padding: '8px 4px', fontFamily: 'var(--fd)', fontSize: 10, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, "TV")),
                        React.createElement("tr", null, orderedReqConsoles.map(req => (React.createElement(React.Fragment, { key: `${req.consoleName}_sub` },
                            React.createElement("th", { style: { width: 34, textAlign: 'center', padding: '6px 1px', fontFamily: 'var(--fd)', fontSize: 10, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', borderLeft: '2px solid #cfd6ea', borderBottom: '2px solid #cfd6ea', background: '#f7f9ff' } }, "K"),
                            React.createElement("th", { style: { width: 34, textAlign: 'center', padding: '6px 1px', fontFamily: 'var(--fd)', fontSize: 10, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', borderBottom: '2px solid #cfd6ea', background: '#f7f9ff' } }, "C"),
                            React.createElement("th", { style: { width: 34, textAlign: 'center', padding: '6px 1px', fontFamily: 'var(--fd)', fontSize: 10, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', borderRight: '2px solid #cfd6ea', borderBottom: '2px solid #cfd6ea', background: '#f7f9ff' } }, "S")))))),
                    React.createElement("tbody", null, participants.map((participant, idx) => {
                        const type = participantType(participant);
                        return (React.createElement("tr", { key: participant.id, style: { background: '#fff' } },
                            React.createElement("td", { style: { width: 190, padding: '8px 10px', border: '1px solid #dfe3f4', verticalAlign: 'middle', background: '#fff' } },
                                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 10, color: 'var(--muted)', minWidth: 24 } }, String(idx + 1).padStart(2, '0')),
                                    React.createElement("div", { style: { minWidth: 0 } },
                                        React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: 'var(--dk)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, participantDisplayName(participant)),
                                        React.createElement("div", { className: "muted text-sm", style: { fontSize: 11 } }, type === 'team' ? 'Team' : 'Solo')))),
                            orderedReqConsoles.map((req, colIdx) => {
                                const consoleMeta = getCellMeta(participant, cellKey(req.consoleName, 'console'), getSuggestedValue(participant, req.consoleName, 'console'));
                                const controllerMeta = getCellMeta(participant, cellKey(req.consoleName, 'controller'), getSuggestedValue(participant, req.consoleName, 'controller'));
                                const gameMeta = getCellMeta(participant, cellKey(req.consoleName, 'game'), getSuggestedValue(participant, req.consoleName, 'game'));
                                const isLastConsole = colIdx === orderedReqConsoles.length - 1;
                                return (React.createElement(React.Fragment, { key: `${participant.id}_${req.consoleName}` }, [['console', consoleMeta], ['controller', controllerMeta], ['game', gameMeta]].map(([typeKey, meta], innerIdx) => {
                                    const isLastCell = isLastConsole && innerIdx === 2;
                                    return (React.createElement("td", { key: typeKey, style: { width: 34, padding: '4px 1px', borderTop: idx === 0 ? '2px solid #cfd6ea' : '1px solid #e8ecf7', borderBottom: idx === participants.length - 1 ? '2px solid #cfd6ea' : '1px solid #e8ecf7', borderLeft: innerIdx === 0 ? '2px solid #cfd6ea' : '1px solid #edf0fa', borderRight: innerIdx === 2 ? '2px solid #cfd6ea' : '1px solid #edf0fa', background: meta.highlighted ? '#eef6ff' : '#fff', verticalAlign: 'middle', textAlign: 'center' } },
                                        React.createElement("input", { type: "number", min: "0", step: "1", value: meta.value, onChange: e => updateCell(participant, cellKey(req.consoleName, typeKey), e.target.value), title: meta.highlighted ? `Vorschlag aus Spielerdaten: ${meta.suggested}` : 'Manuell gesetzt', style: { width: 30, minWidth: 30, padding: '3px 1px', textAlign: 'center', fontWeight: 700, borderColor: meta.highlighted ? '#7fb3ff' : 'var(--bord2)', background: meta.highlighted ? '#f4f9ff' : '#fff' } })));
                                })));
                            }),
                            (() => {
                                const tvMeta = getCellMeta(participant, 'tv', getSuggestedValue(participant, '', 'tv'));
                                return (React.createElement("td", { style: { width: 40, padding: '4px 1px', borderTop: idx === 0 ? '2px solid #cfd6ea' : '1px solid #e8ecf7', borderBottom: idx === participants.length - 1 ? '2px solid #cfd6ea' : '1px solid #e8ecf7', borderLeft: '1px solid #edf0fa', borderRight: '2px solid #dfe3f4', background: tvMeta.highlighted ? '#eef6ff' : '#fff', verticalAlign: 'middle', textAlign: 'center' } },
                                    React.createElement("input", { type: "number", min: "0", step: "1", value: tvMeta.value, onChange: e => updateCell(participant, 'tv', e.target.value), title: tvMeta.highlighted ? `Vorschlag aus Spielerdaten: ${tvMeta.suggested}` : 'Manuell gesetzt', style: { width: 30, minWidth: 30, padding: '3px 1px', textAlign: 'center', fontWeight: 700, borderColor: tvMeta.highlighted ? '#7fb3ff' : 'var(--bord2)', background: tvMeta.highlighted ? '#f4f9ff' : '#fff' } })));
                            })()));
                    })))))),
        reqModal && (React.createElement(Modal, { title: "\u2699\uFE0F Bedarf ausw\u00E4hlen", confirmLabel: "Bedarf \u00FCbernehmen", onCancel: () => setReqModal(false), onConfirm: saveRequirements, maxWidth: 980 },
            React.createElement("div", { style: { marginBottom: 12, color: 'var(--ds)' } }, "W\u00E4hle aus, welche Konsolenbl\u00F6cke angezeigt werden sollen und trage ein, wie viel pro Konsole ben\u00F6tigt wird. Die TV-Anzahl wird automatisch berechnet."),
            React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 } }, consoleOptions.map(name => {
                const active = (reqDraft.consoles || []).some(req => req.consoleName === name);
                return (React.createElement("button", { key: name, className: `btn ${active ? 'bp' : 'bs'} bsm`, onClick: () => toggleDraftConsole(name) },
                    active ? '✓ ' : '+',
                    name));
            })),
            (reqDraft.consoles || []).length === 0 && React.createElement("div", { className: "muted text-sm" }, "Noch keine Konsole gew\u00E4hlt."),
            (reqDraft.consoles || []).length > 0 && (React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10, marginBottom: 16 } }, sortConsoleNamesByAge((reqDraft.consoles || []).map(req => req.consoleName), consoles).map(consoleName => {
                const req = (reqDraft.consoles || []).find(item => item.consoleName === consoleName);
                if (!req)
                    return null;
                const gameName = consoleGameMap[normalizeKey(req.consoleName)] || '';
                return (React.createElement("div", { key: req.consoleName, className: "card", style: { padding: 14, marginBottom: 0 } },
                    React.createElement("div", { className: "card-hdr", style: { marginBottom: 8 } },
                        React.createElement("span", { className: "ctitle", style: { fontSize: 12 } }, req.consoleName),
                        React.createElement("button", { className: "bic", onClick: () => toggleDraftConsole(req.consoleName) }, "\u2715")),
                    gameName && React.createElement("div", { className: "muted text-sm", style: { marginBottom: 8 } },
                        "Spiel: ",
                        gameName),
                    React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 } },
                        React.createElement("div", null,
                            React.createElement("div", { className: "fp-player-label" }, "Konsole"),
                            React.createElement("input", { type: "number", min: "0", step: "1", value: req.consoleQty, onChange: e => updateDraftConsole(req.consoleName, 'consoleQty', e.target.value), style: { marginTop: 4 } })),
                        React.createElement("div", null,
                            React.createElement("div", { className: "fp-player-label" }, "Controller"),
                            React.createElement("input", { type: "number", min: "0", step: "1", value: req.controllerQty, onChange: e => updateDraftConsole(req.consoleName, 'controllerQty', e.target.value), style: { marginTop: 4 } })),
                        React.createElement("div", null,
                            React.createElement("div", { className: "fp-player-label" }, "Spiel"),
                            React.createElement("input", { type: "number", min: "0", step: "1", value: req.gameQty, onChange: e => updateDraftConsole(req.consoleName, 'gameQty', e.target.value), style: { marginTop: 4 } })))));
            })))))));
}
function KostenTodoIdeenTab({ orgaData, setOrgaData, fps, playerDb, focus = 'all' }) {
    const data = syncOrgaParticipantsWithMatchmaking(orgaData, fps, playerDb);
    const participantNames = data.participants.map(p => fullPlayerName(p)).filter(Boolean);
    const participantCount = data.participants.length;
    const shopTotal = data.costs.shopping.reduce((s, x) => s + (getShopQty(x, participantCount) * parseNum(x.unitPrice)) + parseNum(x.shipping), 0);
    const todoCost = data.costs.todos.reduce((s, x) => s + parseNum(x.estCost), 0);
    const revenue = data.participants.length * parseNum(data.participantsMeta.fee);
    const expenses = shopTotal + todoCost;
    const balance = revenue - expenses;
    const [sourceModal, setSourceModal] = useState(null);
    function mutate(mutator) {
        setOrgaData(prev => {
            const next = syncOrgaParticipantsWithMatchmaking(prev, fps, playerDb);
            mutator(next);
            return next;
        });
    }
    function openSourceModal(collection, item, rowLabel = 'Quelle') {
        setSourceModal({
            collection,
            id: item.id,
            rowLabel,
            title: String((item === null || item === void 0 ? void 0 : item.sourceTitle) || (item === null || item === void 0 ? void 0 : item.source) || '').trim(),
            url: String((item === null || item === void 0 ? void 0 : item.sourceUrl) || '').trim()
        });
    }
    function saveSourceModal() {
        if (!sourceModal)
            return;
        const title = String(sourceModal.title || '').trim();
        const url = String(sourceModal.url || '').trim();
        mutate(next => {
            next.costs[sourceModal.collection] = (next.costs[sourceModal.collection] || []).map(x => x.id === sourceModal.id ? { ...x, source: title, sourceTitle: title, sourceUrl: url } : x);
        });
        setSourceModal(null);
    }
    function renderSourceCell(collection, item, rowLabel = 'Quelle') {
        const sourceTitle = String((item === null || item === void 0 ? void 0 : item.sourceTitle) || (item === null || item === void 0 ? void 0 : item.source) || '').trim();
        const sourceUrl = String((item === null || item === void 0 ? void 0 : item.sourceUrl) || '').trim();
        const openUrl = externalUrl(sourceUrl);
        const displayText = sourceTitle || shortNameLabel(sourceUrl, 24);
        return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
            React.createElement("button", { type: "button", onClick: () => openSourceModal(collection, item, rowLabel), style: { background: 'none', border: 'none', padding: 0, margin: 0, fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline' } }, "Quelle"),
            displayText
                ? openUrl
                    ? React.createElement("button", { type: "button", title: openUrl, onClick: () => window.open(openUrl, '_blank', 'noopener,noreferrer'), style: { height: 38, padding: '0 10px', border: '1px solid #c0d0ff', borderRadius: 6, background: '#f0f5ff', color: '#2040a0', fontWeight: 700, fontSize: 12, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, displayText)
                    : React.createElement("div", { title: displayText, style: { height: 38, padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--bord2)', borderRadius: 6, background: '#fff', color: 'var(--ds)', fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, displayText)
                : React.createElement("div", { style: { height: 38, padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--bord2)', borderRadius: 6, background: '#fafafe', color: 'var(--muted)', fontSize: 12 } }, "\u2013")));
    }
    const groupedShopping = SHOP_CATEGORIES.map(([value, label]) => ({
        value,
        label,
        items: data.costs.shopping.filter(x => inferShopCategory(x) === value)
    }));
    function addShopItem(category) {
        mutate(next => next.costs.shopping.push(makeShopItem({ category, unit: category === 'verpflegung' ? 'Stk.' : 'Stk.' })));
    }
    return (React.createElement("div", null,
        React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, focus === 'kosten' ? '💸 Kosten' : focus === 'todo' ? '✅ To-do' : '💸 Kosten · To-do · Ideen'),
                React.createElement("span", { className: "chip chip-b" }, focus === 'kosten' ? 'Einnahmen, Ausgaben & Differenz' : focus === 'todo' ? 'Aufgaben, Ideen & Mitbringen' : 'aus deiner Tabelle weitergedacht')),
            React.createElement("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                React.createElement(MiniStat, { label: "Einnahmen", value: money(revenue), color: "#f0fff4", border: "#b7f5c8", text: "#0a8a3a" }),
                React.createElement(MiniStat, { label: "Ausgaben", value: money(expenses), color: "#fff8e0", border: "#ffd966", text: "#8a6000" }),
                React.createElement(MiniStat, { label: "Differenz", value: money(balance), color: balance >= 0 ? '#f0f5ff' : '#fff5f5', border: balance >= 0 ? '#c0d0ff' : '#ffcccc', text: balance >= 0 ? '#2040a0' : '#b8001f' }))),
        focus !== 'todo' && (React.createElement("div", { style: { display: 'grid', gap: 12 } }, groupedShopping.map(group => (React.createElement("div", { key: group.value, className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                    React.createElement("span", { className: "ctitle" },
                        "\uD83D\uDED2 ",
                        group.label),
                    group.value === 'verpflegung' && React.createElement("span", { className: "chip chip-g" },
                        participantCount,
                        " Teilnehmer als Berechnungsbasis")),
                React.createElement("button", { className: "btn bp bsm", onClick: () => addShopItem(group.value) }, "+ Eintrag")),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                group.items.length === 0 && React.createElement("div", { className: "muted text-sm" }, "Noch keine Eintr\u00E4ge in dieser Kategorie."),
                group.items.map(item => {
                    const currentCategory = inferShopCategory(item);
                    const autoQty = currentCategory === 'verpflegung' && parseNum(item.perPerson) > 0;
                    const qtyValue = autoQty ? getShopQty(item, participantCount) : item.qty;
                    const total = (getShopQty(item, participantCount) * parseNum(item.unitPrice)) + parseNum(item.shipping);
                    return (React.createElement("div", { key: item.id, style: { padding: '10px 12px', border: '1.5px solid var(--bord)', borderRadius: 10, background: item.done ? '#f8fff9' : '#fff' } },
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '2fr .85fr .85fr .8fr .95fr .85fr 1fr 1.2fr 108px auto', gap: 8, alignItems: 'start' } },
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' } }, "Artikel"),
                                React.createElement("input", { type: "text", value: item.name, onChange: e => mutate(next => next.costs.shopping = next.costs.shopping.map(x => x.id === item.id ? { ...x, name: e.target.value } : x)), placeholder: "Artikel" })),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' } }, "Menge"),
                                React.createElement("input", { type: "number", min: "0", step: "0.01", value: qtyValue, readOnly: currentCategory === 'verpflegung', onChange: e => mutate(next => next.costs.shopping = next.costs.shopping.map(x => x.id === item.id ? { ...x, qty: e.target.value } : x)), style: currentCategory === 'verpflegung' ? { background: '#f5f8ff', fontWeight: 700 } : {} })),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' } }, "Pro Pers."),
                                currentCategory === 'verpflegung'
                                    ? React.createElement("input", { type: "number", min: "0", step: "0.01", value: item.perPerson || '', onChange: e => mutate(next => next.costs.shopping = next.costs.shopping.map(x => x.id === item.id ? { ...x, perPerson: e.target.value } : x)), placeholder: "0" })
                                    : React.createElement("input", { type: "text", value: "", readOnly: true, style: { background: '#f7f7fb', color: '#a0a0b8' }, placeholder: "\u2013" })),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' } }, "Einheit"),
                                React.createElement("input", { type: "text", value: item.unit || '', onChange: e => mutate(next => next.costs.shopping = next.costs.shopping.map(x => x.id === item.id ? { ...x, unit: e.target.value } : x)), placeholder: "Stk." })),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' } }, "Preis/Stk."),
                                React.createElement("input", { type: "number", min: "0", step: "0.01", value: item.unitPrice, onChange: e => mutate(next => next.costs.shopping = next.costs.shopping.map(x => x.id === item.id ? { ...x, unitPrice: e.target.value } : x)) })),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' } }, "Versand"),
                                React.createElement("input", { type: "number", min: "0", step: "0.01", value: item.shipping || '', onChange: e => mutate(next => next.costs.shopping = next.costs.shopping.map(x => x.id === item.id ? { ...x, shipping: e.target.value } : x)), placeholder: "0" })),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' } }, "Gesamt"),
                                React.createElement("div", { style: { height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--bord2)', borderRadius: 6, background: '#fff8e0', fontFamily: 'var(--fd)', fontSize: 12, color: '#8a6000' } }, money(total))),
                            renderSourceCell('shopping', item, `Quelle für ${item.name || group.label}`),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { fontSize: 10, fontFamily: 'var(--fd)', letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' } }, "Erledigt"),
                                React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 38 } },
                                    React.createElement(BoolPill, { value: !!item.done, onToggle: () => mutate(next => next.costs.shopping = next.costs.shopping.map(x => x.id === item.id ? { ...x, done: !x.done } : x)), label: "Erledigt", color: "var(--green)" }))),
                            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                                React.createElement("div", { style: { height: 12 } }),
                                React.createElement("button", { className: "btn bd bsm", onClick: () => mutate(next => next.costs.shopping = next.costs.shopping.filter(x => x.id !== item.id)) }, "Entfernen")))));
                }))))))),
        sourceModal && (React.createElement(Modal, { title: `🔗 ${sourceModal.rowLabel || 'Quelle bearbeiten'}`, confirmLabel: "Speichern", onCancel: () => setSourceModal(null), onConfirm: saveSourceModal, maxWidth: 520 },
            React.createElement("div", { style: { display: 'grid', gap: 12 } },
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Titel"),
                    React.createElement("input", { type: "text", value: sourceModal.title, onChange: e => setSourceModal(m => ({ ...m, title: e.target.value })), autoFocus: true, style: { marginTop: 4 }, placeholder: "z. B. Amazon, MediaMarkt, Notiz" })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Link (optional)"),
                    React.createElement("input", { type: "text", value: sourceModal.url, onChange: e => setSourceModal(m => ({ ...m, url: e.target.value })), style: { marginTop: 4 }, placeholder: "https://..." }))))),
        focus !== 'kosten' && React.createElement("div", null,
            React.createElement("div", { className: "card mb3" },
                React.createElement("div", { className: "card-hdr" },
                    React.createElement("span", { className: "ctitle" }, "\u2705 Zu erledigen"),
                    React.createElement("button", { className: "btn bp bsm", onClick: () => mutate(next => next.costs.todos.push({ id: makeUid('todo'), task: '', qty: '', estCost: '', notes: '', done: false })) }, "+ To-do"),
                    React.createElement("button", { className: "btn bd bsm", title: "Alle Aufgaben und Mitbringen als nicht erledigt markieren", onClick: () => mutate(next => { next.costs.todos = next.costs.todos.map(x => ({ ...x, done: false })); next.costs.bring = (next.costs.bring || []).map(x => ({ ...x, done: false })); }) }, "\u21BA Reset")),
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                    data.costs.todos.length === 0 && React.createElement("div", { style: { textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 } }, "Noch keine Aufgaben."),
                    data.costs.todos.map(item => (React.createElement("div", { key: item.id, style: { border: '1.5px solid var(--bord)', borderRadius: 8, overflow: 'hidden', background: item.done ? '#f8fff9' : '#fff', opacity: item.done ? .7 : 1 } },
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '2fr 90px 110px 1fr auto', gap: 0, background: 'var(--card2)', borderBottom: '1px solid var(--bord2)' } }, ['Aufgabe', 'Menge', 'Kosten (€)', 'Notiz', ''].map(h => React.createElement("div", { key: h, style: { padding: '4px 10px', fontFamily: 'var(--fd)', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' } }, h))),
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '2fr 90px 110px 1fr auto', gap: 8, padding: '8px 10px', alignItems: 'center' } },
                            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 7 } },
                                React.createElement("input", { type: "checkbox", checked: !!item.done, onChange: () => mutate(next => next.costs.todos = next.costs.todos.map(x => x.id === item.id ? { ...x, done: !x.done } : x)), style: { width: 16, height: 16, accentColor: 'var(--green)', flexShrink: 0 } }),
                                React.createElement("input", { type: "text", value: item.task || '', onChange: e => mutate(next => next.costs.todos = next.costs.todos.map(x => x.id === item.id ? { ...x, task: e.target.value } : x)), placeholder: "Aufgabe\u2026", style: { textDecoration: item.done ? 'line-through' : '' } })),
                            React.createElement("input", { type: "number", min: "0", value: item.qty || '', onChange: e => mutate(next => next.costs.todos = next.costs.todos.map(x => x.id === item.id ? { ...x, qty: e.target.value } : x)), placeholder: "\u2013" }),
                            React.createElement("input", { type: "number", min: "0", step: "0.01", value: item.estCost || '', onChange: e => mutate(next => next.costs.todos = next.costs.todos.map(x => x.id === item.id ? { ...x, estCost: e.target.value } : x)), placeholder: "0.00" }),
                            React.createElement("input", { type: "text", value: item.notes || '', onChange: e => mutate(next => next.costs.todos = next.costs.todos.map(x => x.id === item.id ? { ...x, notes: e.target.value } : x)), placeholder: "Notiz\u2026" }),
                            React.createElement("button", { className: "btn bd bsm", onClick: () => mutate(next => next.costs.todos = next.costs.todos.filter(x => x.id !== item.id)) }, "\u2715"))))))),
            React.createElement("div", { className: "card" },
                React.createElement("div", { className: "card-hdr" },
                    React.createElement("span", { className: "ctitle" }, "\uD83C\uDF92 Mitbringen"),
                    React.createElement("button", { className: "btn bp bsm", onClick: () => mutate(next => { if (!next.costs.bring)
                            next.costs.bring = []; next.costs.bring.push({ id: makeUid('bring'), item: '', qty: '', estCost: '', who: '', notes: '', done: false }); }) }, "+ Mitbringen")),
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                    (data.costs.bring || []).length === 0 && React.createElement("div", { style: { textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 } }, "Noch keine Eintr\u00E4ge."),
                    (data.costs.bring || []).map(item => (React.createElement("div", { key: item.id, style: { border: '1.5px solid var(--bord)', borderRadius: 8, overflow: 'hidden', background: item.done ? '#f8fff9' : '#fff', opacity: item.done ? .7 : 1 } },
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '2fr 80px 110px 160px 1fr auto', gap: 0, background: 'var(--card2)', borderBottom: '1px solid var(--bord2)' } }, ['Gegenstand', 'Menge', 'Kosten (€)', 'Wer', 'Notiz', ''].map(h => React.createElement("div", { key: h, style: { padding: '4px 10px', fontFamily: 'var(--fd)', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' } }, h))),
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '2fr 80px 110px 160px 1fr auto', gap: 8, padding: '8px 10px', alignItems: 'center' } },
                            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 7 } },
                                React.createElement("input", { type: "checkbox", checked: !!item.done, onChange: () => mutate(next => { if (!next.costs.bring)
                                        next.costs.bring = []; next.costs.bring = next.costs.bring.map(x => x.id === item.id ? { ...x, done: !x.done } : x); }), style: { width: 16, height: 16, accentColor: 'var(--green)', flexShrink: 0 } }),
                                React.createElement("input", { type: "text", value: item.item || '', onChange: e => mutate(next => { if (!next.costs.bring)
                                        next.costs.bring = []; next.costs.bring = next.costs.bring.map(x => x.id === item.id ? { ...x, item: e.target.value } : x); }), placeholder: "Gegenstand\u2026", style: { textDecoration: item.done ? 'line-through' : '' } })),
                            React.createElement("input", { type: "number", min: "0", value: item.qty || '', onChange: e => mutate(next => { if (!next.costs.bring)
                                    next.costs.bring = []; next.costs.bring = next.costs.bring.map(x => x.id === item.id ? { ...x, qty: e.target.value } : x); }), placeholder: "\u2013" }),
                            React.createElement("input", { type: "number", min: "0", step: "0.01", value: item.estCost || '', onChange: e => mutate(next => { if (!next.costs.bring)
                                    next.costs.bring = []; next.costs.bring = next.costs.bring.map(x => x.id === item.id ? { ...x, estCost: e.target.value } : x); }), placeholder: "0.00" }),
                            React.createElement("select", { value: item.who || '', onChange: e => mutate(next => { if (!next.costs.bring)
                                    next.costs.bring = []; next.costs.bring = next.costs.bring.map(x => x.id === item.id ? { ...x, who: e.target.value } : x); }) },
                                React.createElement("option", { value: "" }, "\u2013 Person \u2013"),
                                participantNames.map(n => React.createElement("option", { key: n, value: n }, n))),
                            React.createElement("input", { type: "text", value: item.notes || '', onChange: e => mutate(next => { if (!next.costs.bring)
                                    next.costs.bring = []; next.costs.bring = next.costs.bring.map(x => x.id === item.id ? { ...x, notes: e.target.value } : x); }), placeholder: "Notiz\u2026" }),
                            React.createElement("button", { className: "btn bd bsm", onClick: () => mutate(next => { if (!next.costs.bring)
                                    next.costs.bring = []; next.costs.bring = next.costs.bring.filter(x => x.id !== item.id); }) }, "\u2715"))))))))));
}
// ── IdeenTab ──────────────────────────────────────────────────────────────────
function IdeenTab({ orgaData, setOrgaData, fps }) {
    var _a;
    const data = normalizeOrgaData(orgaData);
    function mutate(fn) { setOrgaData(prev => { const next = normalizeOrgaData(prev); fn(next); return next; }); }
    const STATUS_OPTS = ['Idee', 'Offen', 'In Arbeit', 'Erledigt', 'Verworfen'];
    const participantNames = useMemo(() => getRealParticipants(fps).map(p => p.name), [fps]);
    const ideas = ((_a = data.costs) === null || _a === void 0 ? void 0 : _a.ideas) || [];
    return (React.createElement("div", null,
        React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 12 } },
            React.createElement("button", { className: "btn bp bsm", onClick: () => mutate(next => next.costs.ideas.push({ id: makeUid('idea'), text: '', status: 'Idee', estCost: '', von: '', notes: '' })) }, "+ Idee")),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            ideas.length === 0 && React.createElement("div", { style: { textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13, background: 'var(--card2)', border: '1px dashed var(--bord)', borderRadius: 8 } }, "Noch keine Ideen. Klicke \u201E+ Idee\" um anzufangen."),
            ideas.map((item, i) => (React.createElement("div", { key: item.id, style: { padding: '12px', border: '1.5px solid var(--bord)', borderRadius: 10, background: '#fff' } },
                React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '2fr 140px 110px 180px auto', gap: 8, alignItems: 'end', marginBottom: 6 } },
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' } }, "Idee"),
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' } }, "Status"),
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' } }, "Kosten (\u20AC)"),
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' } }, "Von"),
                    React.createElement("div", null)),
                React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '2fr 140px 110px 180px auto', gap: 8, alignItems: 'start', marginBottom: 10 } },
                    React.createElement("input", { type: "text", value: item.text || '', onChange: e => mutate(next => next.costs.ideas = next.costs.ideas.map(x => x.id === item.id ? { ...x, text: e.target.value } : x)), placeholder: "Was ist die Idee?" }),
                    React.createElement("select", { value: item.status || 'Idee', onChange: e => mutate(next => next.costs.ideas = next.costs.ideas.map(x => x.id === item.id ? { ...x, status: e.target.value } : x)) }, STATUS_OPTS.map(s => React.createElement("option", { key: s, value: s }, s))),
                    React.createElement("input", { type: "number", min: "0", step: "0.01", value: item.estCost || '', onChange: e => mutate(next => next.costs.ideas = next.costs.ideas.map(x => x.id === item.id ? { ...x, estCost: e.target.value } : x)), placeholder: "0.00" }),
                    React.createElement("select", { value: item.von || '', onChange: e => mutate(next => next.costs.ideas = next.costs.ideas.map(x => x.id === item.id ? { ...x, von: e.target.value } : x)) },
                        React.createElement("option", { value: "" }, "\u2013 Person \u2013"),
                        participantNames.map(n => React.createElement("option", { key: n, value: n }, n))),
                    React.createElement("button", { className: "btn bd bsm", onClick: () => mutate(next => next.costs.ideas = next.costs.ideas.filter(x => x.id !== item.id)) }, "\u2715")),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 } }, "Notiz"),
                    React.createElement("textarea", { value: item.notes || '', onChange: e => mutate(next => next.costs.ideas = next.costs.ideas.map(x => x.id === item.id ? { ...x, notes: e.target.value } : x)), rows: 2, style: { width: '100%', fontSize: 12, padding: '7px 10px', border: '1px solid var(--bord2)', borderRadius: 6, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }, placeholder: "Weitere Details, Links, \u00DCberlegungen\u2026" }))))))));
}
function SpielregelnAdminTab({ orgaData, setOrgaData }) {
    const data = normalizeOrgaData(orgaData);
    const exportPdf = () => exportRulesPdf(data.rules);
    function mutate(mutator) {
        setOrgaData(prev => {
            const next = normalizeOrgaData(prev);
            mutator(next);
            return next;
        });
    }
    return (React.createElement("div", null,
        React.createElement("div", { className: "alert alert-i" }, "Hier liegen die Regeln jetzt zentral und bearbeitbar. Gute Verbesserung gegen\u00FCber der Tabelle: Du kannst Reihenfolge, Formulierungen und Zusatzinfos direkt pflegen und sp\u00E4ter bei Bedarf in eine Zuschauer- oder Druckansicht \u00FCbernehmen."),
        React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, "\uD83D\uDCDC Spielregeln"),
                React.createElement("div", { className: "flex g2" },
                    React.createElement("button", { className: "btn bs bsm", onClick: exportPdf }, "\uD83E\uDDFE Als PDF speichern"),
                    React.createElement("button", { className: "btn bp bsm", onClick: () => mutate(next => next.rules.push(makeRuleItem({ title: `Gebot ${String(next.rules.length + 1).padStart(2, '0')}` }))) }, "+ Regel"))),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, data.rules.map((rule, idx) => (React.createElement("div", { key: rule.id, style: { padding: '12px', border: '1.5px solid var(--bord)', borderRadius: 10, background: '#fff' } },
                React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 8, alignItems: 'end' } },
                    React.createElement("div", null,
                        React.createElement("div", { className: "fp-player-label" }, "Titel"),
                        React.createElement("input", { type: "text", value: rule.title, onChange: e => mutate(next => next.rules = next.rules.map(x => x.id === rule.id ? { ...x, title: e.target.value } : x)) })),
                    React.createElement("div", null,
                        React.createElement("div", { className: "fp-player-label" }, "Hauptregel"),
                        React.createElement("input", { type: "text", value: rule.text, onChange: e => mutate(next => next.rules = next.rules.map(x => x.id === rule.id ? { ...x, text: e.target.value } : x)) })),
                    React.createElement("button", { className: "btn bd bsm", onClick: () => mutate(next => next.rules = next.rules.filter(x => x.id !== rule.id)) }, "Entfernen")),
                React.createElement("div", { style: { marginTop: 8 } },
                    React.createElement("div", { className: "fp-player-label" }, "Zusatz / Erl\u00E4uterung"),
                    React.createElement("input", { type: "text", value: rule.detail || '', onChange: e => mutate(next => next.rules = next.rules.map(x => x.id === rule.id ? { ...x, detail: e.target.value } : x)) })),
                React.createElement("div", { style: { marginTop: 8, fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--fd)' } },
                    "Position ",
                    idx + 1))))))));
}
function AufbauTab({ orgaData, setOrgaData, consoles }) {
    // ── Phase state: 'grundriss' | 'mobel' ────────────────────────────────────
    const [phase, setPhase] = useState('mobel');
    const [showGrundriss, setShowGrundriss] = useState(false);
    // ── Room / floor plan state ────────────────────────────────────────────────
    const [rooms, setRooms] = useState([{ id: 'r0', label: 'Raum', x: 50, y: 50, w: 900, h: 600, color: '#f0f0f8' }]);
    const [wallElems, setWallElems] = useState([]); // doors/windows on floor plan
    const [drawMode, setDrawMode] = useState('select'); // 'select'|'room'|'wall'
    const [drawStart, setDrawStart] = useState(null);
    const [drawCurrent, setDrawCurrent] = useState(null);
    const [selRoom, setSelRoom] = useState(null);
    const [dragRoom, setDragRoom] = useState(null);
    // ── Furniture state ────────────────────────────────────────────────────────
    const [elems, setElems] = useState([]);
    const [sel, setSel] = useState(null);
    const [drag, setDrag] = useState(null);
    const [addType, setAddType] = useState('tisch_rect');
    const [history, setHistory] = useState([[]]);
    const [histIdx, setHistIdx] = useState(0);
    // ── Wall placement state ───────────────────────────────────────────────────
    const [wallMode, setWallMode] = useState(false);
    const [wallAddType, setWallAddType] = useState('fenster');
    const [wallW, setWallW] = useState(100);
    const [wallH, setWallH] = useState(16);
    const [wallHover, setWallHover] = useState(null);
    // ── Canvas / layout ────────────────────────────────────────────────────────
    const CANVAS_W = 900, CANVAS_H = 506;
    const [roomW, setRoomW] = useState(1200);
    const [roomH, setRoomH] = useState(800);
    const SCALE = Math.min(CANVAS_W / roomW, CANVAS_H / roomH);
    const GRID = 10;
    const HANDLE = 8;
    const WALL_HIT = 18;
    const svgRef = React.useRef(null);
    const grRef = React.useRef(null);
    const ET = {
        tisch_rect: { l: 'Tisch eckig', c: '#1e40af', dw: 160, dh: 80, cat: 'möbel' },
        tisch_round: { l: 'Tisch rund', c: '#1e6abf', dw: 90, dh: 90, cat: 'möbel' },
        stuhl: { l: 'Stuhl', c: '#059669', dw: 45, dh: 45, cat: 'möbel' },
        tv: { l: 'TV/Monitor', c: '#7c3aed', dw: 90, dh: 55, cat: 'technik' },
        konsole: { l: 'Konsole', c: '#b45309', dw: 44, dh: 30, cat: 'technik' },
        beamer: { l: 'Beamer', c: '#9333ea', dw: 38, dh: 32, cat: 'technik' },
        leinwand: { l: 'Leinwand', c: '#6d28d9', dw: 200, dh: 20, cat: 'technik' },
        laptop: { l: 'Laptop', c: '#0891b2', dw: 44, dh: 32, cat: 'technik' },
        strom: { l: 'Steckdose', c: '#f59e0b', dw: 24, dh: 24, cat: 'technik' },
        router: { l: 'Router', c: '#065f46', dw: 30, dh: 20, cat: 'technik' },
        theke: { l: 'Theke/Bar', c: '#be185d', dw: 200, dh: 60, cat: 'raum' },
        kuehlschrank: { l: 'Kühlschrank', c: '#0e7490', dw: 60, dh: 65, cat: 'raum' },
        podium: { l: 'Podium/Bühne', c: '#dc2626', dw: 200, dh: 100, cat: 'raum' },
        lautsprecher: { l: 'Lautsprecher', c: '#374151', dw: 30, dh: 40, cat: 'raum' },
        sofa: { l: 'Sofa', c: '#4f46e5', dw: 160, dh: 70, cat: 'möbel' },
        stehtisch: { l: 'Stehtisch', c: '#6d28d9', dw: 60, dh: 60, cat: 'möbel' },
        muell: { l: 'Mülleimer', c: '#6b7280', dw: 40, dh: 40, cat: 'raum' },
        fenster: { l: 'Fenster', c: '#2563eb', dw: 100, dh: 16, cat: 'wand' },
        tuer: { l: 'Tür', c: '#334155', dw: 80, dh: 16, cat: 'wand' },
        durchgang: { l: 'Durchgang', c: '#475569', dw: 100, dh: 16, cat: 'wand' },
        wand: { l: 'Wand (innen)', c: '#1e293b', dw: 200, dh: 18, cat: 'wand' },
    };
    const CATS = ['möbel', 'technik', 'raum', 'wand'];
    const WALL_TYPES = ['fenster', 'tuer', 'durchgang'];
    const ROOM_COLORS = ['#f0f4ff', '#fff0f4', '#f0fff4', '#fffdf0', '#f5f0ff', '#f0fffe'];
    // Undo/redo for furniture
    function commit(ne) { const h = history.slice(0, histIdx + 1); h.push(JSON.parse(JSON.stringify(ne))); setHistory(h); setHistIdx(h.length - 1); setElems(ne); }
    function undo() { if (histIdx > 0) {
        const i = histIdx - 1;
        setHistIdx(i);
        setElems(JSON.parse(JSON.stringify(history[i])));
    } }
    function redo() { if (histIdx < history.length - 1) {
        const i = histIdx + 1;
        setHistIdx(i);
        setElems(JSON.parse(JSON.stringify(history[i])));
    } }
    function snap(v) { return Math.round(v / GRID) * GRID; }
    function svgPt(ev, ref) { var _a; const r = (_a = (ref || svgRef).current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect(); return r ? { x: (ev.clientX - r.left) / SCALE, y: (ev.clientY - r.top) / SCALE } : { x: 0, y: 0 }; }
    // Furniture ops
    function addEl() { const t = ET[addType]; const nid = 'e' + Date.now(); commit([...elems, { id: nid, type: addType, label: t.l, x: snap(80), y: snap(80), w: t.dw, h: t.dh, rot: 0 }]); setSel(nid); }
    function delEl(id) { commit(elems.filter(e => e.id !== id)); if (sel === id)
        setSel(null); }
    function updEl(id, obj) { commit(elems.map(e => e.id === id ? { ...e, ...obj } : e)); }
    function cloneEl(id) { const e = elems.find(x => x.id === id); if (!e)
        return; const nid = 'e' + Date.now(); commit([...elems, { ...e, id: nid, x: e.x + 20, y: e.y + 20 }]); setSel(nid); }
    // Furniture drag
    function onFurDown(ev, id, mode, extra) { ev.stopPropagation(); setSel(id); const pt = svgPt(ev); const el = elems.find(x => x.id === id); setDrag({ id, mode, sx: pt.x, sy: pt.y, ox: el.x, oy: el.y, ow: el.w, oh: el.h, ...(extra || {}) }); }
    function onFurMove(ev) {
        if (!drag)
            return;
        ev.preventDefault();
        const pt = svgPt(ev);
        const dx = pt.x - drag.sx, dy = pt.y - drag.sy;
        if (drag.mode === 'move') {
            setElems(p => p.map(e => e.id === drag.id ? { ...e, x: Math.max(0, snap(drag.ox + dx)), y: Math.max(0, snap(drag.oy + dy)) } : e));
        }
        else if (drag.mode === 'resize') {
            const c = drag.corner;
            let x = drag.ox, y = drag.oy, w = drag.ow, h = drag.oh;
            if (c === 'se') {
                w = Math.max(10, snap(w + dx));
                h = Math.max(10, snap(h + dy));
            }
            else if (c === 'sw') {
                const nw = Math.max(10, snap(w - dx));
                x += drag.ow - nw;
                w = nw;
                h = Math.max(10, snap(h + dy));
            }
            else if (c === 'ne') {
                w = Math.max(10, snap(w + dx));
                const nh = Math.max(10, snap(h - dy));
                y += drag.oh - nh;
                h = nh;
            }
            else if (c === 'nw') {
                const nw = Math.max(10, snap(w - dx));
                const nh = Math.max(10, snap(h - dy));
                x += drag.ow - nw;
                y += drag.oh - nh;
                w = nw;
                h = nh;
            }
            setElems(p => p.map(e => e.id === drag.id ? { ...e, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) } : e));
        }
        else if (drag.mode === 'rotate') {
            const el = elems.find(x => x.id === drag.id);
            if (!el)
                return;
            const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
            setElems(p => p.map(e => e.id === drag.id ? { ...e, rot: Math.round((Math.atan2(pt.y - cy, pt.x - cx) * 180 / Math.PI + 90) / 5) * 5 } : e));
        }
    }
    function onFurUp() { if (drag)
        commit(elems); setDrag(null); }
    // Wall placement on outer boundary
    function onWallClick(ev) {
        if (!wallMode)
            return;
        const pt = svgPt(ev);
        const hitPx = WALL_HIT / SCALE;
        const nid = 'w' + Date.now();
        const wl = parseInt(wallW) || 100;
        const wh = parseInt(wallH) || 16;
        let ne = null;
        if (pt.y < hitPx) {
            ne = { x: Math.max(0, snap(pt.x - wl / 2)), y: 0, w: wl, h: wh };
        }
        else if (pt.y > roomH - hitPx) {
            ne = { x: Math.max(0, snap(pt.x - wl / 2)), y: roomH - wh, w: wl, h: wh };
        }
        else if (pt.x < hitPx) {
            ne = { x: 0, y: Math.max(0, snap(pt.y - wl / 2)), w: wh, h: wl };
        }
        else if (pt.x > roomW - hitPx) {
            ne = { x: roomW - wh, y: Math.max(0, snap(pt.y - wl / 2)), w: wh, h: wl };
        }
        if (ne)
            setWallElems(p => [...p, { id: nid, type: wallAddType, label: ET[wallAddType].l, ...ne, rot: 0 }]);
    }
    function onWallHover(ev) {
        if (!wallMode) {
            setWallHover(null);
            return;
        }
        const pt = svgPt(ev);
        const hp = WALL_HIT / SCALE;
        if (pt.y < hp)
            setWallHover({ wall: 'top', pos: pt.x });
        else if (pt.y > roomH - hp)
            setWallHover({ wall: 'bottom', pos: pt.x });
        else if (pt.x < hp)
            setWallHover({ wall: 'left', pos: pt.y });
        else if (pt.x > roomW - hp)
            setWallHover({ wall: 'right', pos: pt.y });
        else
            setWallHover(null);
    }
    // ── Grundriss editor helpers ───────────────────────────────────────────────
    const GR_W = 820, GR_H = 540;
    const GR_SCALE = Math.min(GR_W / roomW, GR_H / roomH);
    function grPt(ev) { var _a; const r = (_a = grRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect(); return r ? { x: (ev.clientX - r.left) / GR_SCALE, y: (ev.clientY - r.top) / GR_SCALE } : { x: 0, y: 0 }; }
    function grSnap(v) { return Math.round(v / GRID) * GRID; }
    function onGrDown(ev) {
        ev.preventDefault();
        const pt = grPt(ev);
        if (drawMode === 'room') {
            setDrawStart(pt);
            setDrawCurrent(pt);
        }
        else if (drawMode === 'select') {
            // check if clicking a room
            const hit = rooms.slice().reverse().find(r => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h);
            if (hit) {
                setSelRoom(hit.id);
                setDragRoom({ id: hit.id, sx: pt.x, sy: pt.y, ox: hit.x, oy: hit.y });
            }
            else
                setSelRoom(null);
        }
        else if (drawMode === 'wall') {
            // Place wall element on the nearest room boundary
            const wl = parseInt(wallW) || 100;
            const wh = parseInt(wallH) || 16;
            const hitPx = 20 / GR_SCALE;
            let best = null, bestD = Infinity;
            rooms.forEach(r => {
                const sides = [
                    { wall: 'top', xe: r.x, ye: r.y, dir: 'h' },
                    { wall: 'bottom', xe: r.x, ye: r.y + r.h - wh, dir: 'h' },
                    { wall: 'left', xe: r.x, ye: r.y, dir: 'v' },
                    { wall: 'right', xe: r.x + r.w - wh, ye: r.y, dir: 'v' },
                ];
                sides.forEach(s => {
                    const d = s.dir === 'h' ? Math.abs(pt.y - s.ye - wh / 2) : Math.abs(pt.x - s.xe - wh / 2);
                    const onEdge = s.dir === 'h' ? (pt.x >= r.x && pt.x <= r.x + r.w) : (pt.y >= r.y && pt.y <= r.y + r.h);
                    if (onEdge && d < hitPx && d < bestD) {
                        bestD = d;
                        best = { ...s, r };
                    }
                });
            });
            if (best) {
                const nid = 'gw' + Date.now();
                const ne = best.dir === 'h'
                    ? { x: Math.max(best.r.x, grSnap(pt.x - wl / 2)), y: best.ye, w: wl, h: wh }
                    : { x: best.xe, y: Math.max(best.r.y, grSnap(pt.y - wl / 2)), w: wh, h: wl };
                setWallElems(p => [...p, { id: nid, type: wallAddType, label: ET[wallAddType].l, ...ne, rot: 0 }]);
            }
        }
    }
    function onGrMove(ev) {
        const pt = grPt(ev);
        if (drawMode === 'room' && drawStart) {
            setDrawCurrent(pt);
        }
        else if (dragRoom) {
            const dx = pt.x - dragRoom.sx, dy = pt.y - dragRoom.sy;
            setRooms(p => p.map(r => r.id === dragRoom.id ? { ...r, x: grSnap(dragRoom.ox + dx), y: grSnap(dragRoom.oy + dy) } : r));
        }
    }
    function onGrUp(ev) {
        if (drawMode === 'room' && drawStart && drawCurrent) {
            const x = grSnap(Math.min(drawStart.x, drawCurrent.x));
            const y = grSnap(Math.min(drawStart.y, drawCurrent.y));
            const w = grSnap(Math.abs(drawCurrent.x - drawStart.x));
            const h = grSnap(Math.abs(drawCurrent.y - drawStart.y));
            if (w > 20 && h > 20) {
                const nid = 'r' + Date.now();
                setRooms(p => [...p, { id: nid, label: 'Raum ' + (p.length + 1), x, y, w, h, color: ROOM_COLORS[p.length % ROOM_COLORS.length] }]);
                setSelRoom(nid);
            }
        }
        setDrawStart(null);
        setDrawCurrent(null);
        setDragRoom(null);
    }
    // ── Symbol renderer ────────────────────────────────────────────────────────
    function Sym({ type, w, h, label }) {
        var _a, _b;
        const c = ((_a = ET[type]) === null || _a === void 0 ? void 0 : _a.c) || '#888';
        const fs = Math.max(6, Math.min(11, h * .35, w * .13));
        if (type === 'tv')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h * .85, rx: 3, fill: "#0a0a20", stroke: c, strokeWidth: 1.5 }),
                React.createElement("rect", { x: 2, y: 2, width: w - 4, height: h * .85 - 8, rx: 2, fill: "#1a1a60" }),
                React.createElement("text", { x: w / 2, y: h * .42, textAnchor: "middle", dominantBaseline: "middle", fontSize: Math.min(9, h * .25), fill: "#88aaff", fontFamily: "monospace", fontWeight: "bold" }, "TV"),
                React.createElement("rect", { x: w / 2 - 10, y: h * .85, width: 20, height: 4, rx: 2, fill: c })));
        if (type === 'konsole')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 3, fill: "#111", stroke: c, strokeWidth: 1.5 }),
                React.createElement("circle", { cx: w * .25, cy: h * .45, r: Math.min(5, h * .2), fill: c }),
                React.createElement("rect", { x: w * .45, y: h * .25, width: w * .45, height: h * .5, rx: 2, fill: c + '88' })));
        if (type === 'beamer')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 4, fill: "#2d1f5e", stroke: c, strokeWidth: 1.5 }),
                React.createElement("ellipse", { cx: w * .22, cy: h * .5, rx: Math.min(9, w * .18), ry: Math.min(9, h * .35), fill: c + '99' }),
                React.createElement("polygon", { points: `${w * .22},${h * .2} ${w * .9},${h * .05} ${w * .9},${h * .95} ${w * .22},${h * .8}`, fill: c, opacity: .25 })));
        if (type === 'leinwand')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, fill: "#e8e8ff", stroke: c, strokeWidth: 2 }),
                React.createElement("line", { x1: 2, y1: h / 2, x2: w - 2, y2: h / 2, stroke: c, strokeWidth: 1 })));
        if (type === 'laptop')
            return (React.createElement("g", null,
                React.createElement("rect", { x: 1, y: 1, width: w - 2, height: h * .75, rx: 2, fill: "#1a2030", stroke: c, strokeWidth: 1.5 }),
                React.createElement("rect", { x: 3, y: 3, width: w - 6, height: h * .75 - 6, rx: 1, fill: "#2040a0", opacity: .7 }),
                React.createElement("rect", { y: h * .75, width: w, height: h * .25, rx: 2, fill: c, opacity: .8 })));
        if (type === 'strom')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 3, fill: "#fef3c7", stroke: c, strokeWidth: 2 }),
                React.createElement("circle", { cx: w * .33, cy: h * .42, r: Math.min(3, w * .15), fill: c }),
                React.createElement("circle", { cx: w * .67, cy: h * .42, r: Math.min(3, w * .15), fill: c }),
                React.createElement("rect", { x: w * .3, y: h * .62, width: w * .4, height: h * .22, rx: 1, fill: c })));
        if (type === 'router')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 3, fill: "#064e3b", stroke: c, strokeWidth: 1.5 }),
                React.createElement("circle", { cx: w * .2, cy: h * .5, r: 3, fill: "#10b981" }),
                React.createElement("circle", { cx: w * .4, cy: h * .5, r: 3, fill: "#10b981", opacity: .6 }),
                React.createElement("circle", { cx: w * .6, cy: h * .5, r: 3, fill: "#fbbf24" })));
        if (type === 'theke')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 3, fill: c + '22', stroke: c, strokeWidth: 2 }),
                React.createElement("rect", { y: h * .75, width: w, height: h * .25, rx: 2, fill: c + '55' }),
                React.createElement("text", { x: w / 2, y: h * .45, textAnchor: "middle", dominantBaseline: "middle", fontSize: fs, fontWeight: "700", fill: c, fontFamily: "Arial" }, label)));
        if (type === 'kuehlschrank')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 4, fill: "#e0f2fe", stroke: c, strokeWidth: 2 }),
                React.createElement("line", { x1: 0, y1: h * .38, x2: w, y2: h * .38, stroke: c, strokeWidth: 1.5 }),
                React.createElement("text", { x: w / 2, y: h * .68, textAnchor: "middle", fontSize: Math.min(16, h * .25), fill: c }, "\u2744")));
        if (type === 'podium')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 3, fill: c + '22', stroke: c, strokeWidth: 2.5 }),
                React.createElement("text", { x: w / 2, y: h / 2 + 4, textAnchor: "middle", dominantBaseline: "middle", fontSize: Math.min(13, h * .2), fontWeight: "700", fill: c, fontFamily: "Arial" }, "B\u00DCHNE")));
        if (type === 'lautsprecher')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 3, fill: "#1f2937", stroke: c, strokeWidth: 1.5 }),
                React.createElement("circle", { cx: w / 2, cy: h * .38, r: Math.min(w * .35, h * .3), fill: "#374151" }),
                React.createElement("circle", { cx: w / 2, cy: h * .38, r: Math.min(w * .14, h * .12), fill: "#111" })));
        if (type === 'sofa')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 8, fill: c + '22', stroke: c, strokeWidth: 2 }),
                React.createElement("rect", { x: 5, y: 4, width: w - 10, height: h * .52, rx: 5, fill: c + '44' }),
                React.createElement("rect", { x: 4, y: 4, width: w * .1, height: h - 8, rx: 5, fill: c + '66' }),
                React.createElement("rect", { x: w - 4 - w * .1, y: 4, width: w * .1, height: h - 8, rx: 5, fill: c + '66' })));
        if (type === 'stuhl')
            return (React.createElement("g", null,
                React.createElement("rect", { x: 3, y: 3, width: w - 6, height: h - 6, rx: 7, fill: c + '22', stroke: c, strokeWidth: 1.5 }),
                React.createElement("rect", { x: w / 2 - 10, y: h * .72, width: 20, height: h * .2, rx: 2, fill: c })));
        if (type === 'stehtisch')
            return (React.createElement("g", null,
                React.createElement("ellipse", { cx: w / 2, cy: h / 2, rx: w / 2 - 2, ry: h / 2 - 2, fill: c + '22', stroke: c, strokeWidth: 2 }),
                React.createElement("ellipse", { cx: w / 2, cy: h / 2, rx: w * .2, ry: h * .2, fill: c + '44', stroke: c, strokeWidth: 1 })));
        if (type === 'muell')
            return (React.createElement("g", null,
                React.createElement("rect", { x: w * .1, y: h * .15, width: w * .8, height: h * .8, rx: 3, fill: "#9ca3af", stroke: c, strokeWidth: 1.5 }),
                React.createElement("rect", { x: 0, y: h * .05, width: w, height: h * .12, rx: 2, fill: c })));
        if (type === 'fenster')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, fill: "#c8e6ff", stroke: "#2563eb", strokeWidth: 2 }),
                [1, 2, 3].map(i => React.createElement("line", { key: i, x1: w * i / 4, y1: 0, x2: w * i / 4, y2: h, stroke: "#2563eb", strokeWidth: 1 }))));
        if (type === 'tuer')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, fill: "#94a3b8", stroke: "#334155", strokeWidth: 1.5 }),
                React.createElement("path", { d: `M 0 ${h} A ${Math.min(h * 5, w)} ${Math.min(h * 5, w)} 0 0 1 ${Math.min(h * 5, w)} ${h}`, fill: "rgba(255,255,255,.35)", stroke: "#fff", strokeWidth: 1, strokeDasharray: "4,3" })));
        if (type === 'durchgang')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, fill: "rgba(100,116,139,.12)", stroke: "#64748b", strokeWidth: 1.5, strokeDasharray: "6,4" })));
        if (type === 'wand')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, fill: "#1e293b" })));
        if (type === 'tisch_rect')
            return (React.createElement("g", null,
                React.createElement("rect", { width: w, height: h, rx: 3, fill: c + '1a', stroke: c, strokeWidth: 2 }),
                React.createElement("line", { x1: 6, y1: 6, x2: w - 6, y2: 6, stroke: c, strokeWidth: 1, opacity: .4 }),
                React.createElement("line", { x1: 6, y1: h - 6, x2: w - 6, y2: h - 6, stroke: c, strokeWidth: 1, opacity: .4 }),
                React.createElement("text", { x: w / 2, y: h / 2 + 4, textAnchor: "middle", dominantBaseline: "middle", fontSize: fs, fontWeight: "700", fill: c, fontFamily: "Arial" }, label || 'Tisch')));
        if (type === 'tisch_round')
            return (React.createElement("g", null,
                React.createElement("ellipse", { cx: w / 2, cy: h / 2, rx: w / 2 - 2, ry: h / 2 - 2, fill: c + '22', stroke: c, strokeWidth: 2 }),
                React.createElement("text", { x: w / 2, y: h / 2 + 4, textAnchor: "middle", dominantBaseline: "middle", fontSize: fs, fontWeight: "700", fill: c, fontFamily: "Arial" }, label || 'Tisch')));
        return (React.createElement("g", null,
            React.createElement("rect", { width: w, height: h, rx: 3, fill: c + '1a', stroke: c, strokeWidth: 1.5 }),
            React.createElement("text", { x: w / 2, y: h / 2 + 4, textAnchor: "middle", dominantBaseline: "middle", fontSize: fs, fontWeight: "700", fill: c, fontFamily: "Arial" }, label || ((_b = ET[type]) === null || _b === void 0 ? void 0 : _b.l))));
    }
    // Wall preview in main canvas
    function WallPreview() {
        var _a;
        if (!wallMode || !wallHover)
            return null;
        const wl = parseInt(wallW) || 100;
        const wh = parseInt(wallH) || 16;
        const c = ((_a = ET[wallAddType]) === null || _a === void 0 ? void 0 : _a.c) || '#888';
        let x, y, rw = wl * SCALE, rh = wh * SCALE;
        if (wallHover.wall === 'top') {
            x = wallHover.pos * SCALE - rw / 2;
            y = 0;
        }
        else if (wallHover.wall === 'bottom') {
            x = wallHover.pos * SCALE - rw / 2;
            y = roomH * SCALE - rh;
        }
        else if (wallHover.wall === 'left') {
            x = 0;
            y = wallHover.pos * SCALE - rw / 2;
            rw = rh;
            rh = wl * SCALE;
        }
        else {
            x = roomW * SCALE - rh;
            y = wallHover.pos * SCALE - rw / 2;
            rw = rh;
            rh = wl * SCALE;
        }
        return (React.createElement("rect", { x: x, y: y, width: rw, height: rh, fill: c + '55', stroke: c, strokeWidth: 2, strokeDasharray: "4,3", rx: 2 }));
    }
    function doPrint() {
        const svgEl = svgRef.current;
        if (!svgEl)
            return;
        const typeCounts = {};
        elems.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
        const list = Object.entries(typeCounts).filter(([k]) => { var _a; return ((_a = ET[k]) === null || _a === void 0 ? void 0 : _a.cat) !== 'wand'; }).map(([k, n]) => { var _a; return `${n}× ${((_a = ET[k]) === null || _a === void 0 ? void 0 : _a.l) || k}`; }).join('  ·  ');
        const safeList = roomPlanEscapeHtml(list);
        const w = window.open('', 'mkwc_roomplan_print');
        if (!w)
            return;
        w.document.open();
        w.document.write(`<!DOCTYPE html><html><head><title>Raumplan</title><style>body{margin:0;background:#fff;font-family:Arial}.wrap{padding:14px}h1{font-size:15px;margin:0 0 6px}.list{font-size:10px;color:#555;margin-top:8px;border-top:1px solid #ddd;padding-top:6px}svg{max-width:100%;border:1px solid #ccc;display:block}@media print{@page{size:A3 landscape;margin:8mm}}</style></head><body><div class="wrap"><h1>🏗 Raumplan</h1>${svgEl.outerHTML}<div class="list">${safeList}</div></div></body></html>`);
        w.document.close();
        setTimeout(() => w.print(), 500);
    }
    const selEl = elems.find(e => e.id === sel);
    const typeCounts = {};
    elems.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
    const lbl = { fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3, display: 'block' };
    // ── GRUNDRISS MODAL ───────────────────────────────────────────────────────
    const GrundrissMod = () => (React.createElement("div", { style: { position: 'fixed', inset: 0, background: 'rgba(5,5,18,.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(3px)' } },
        React.createElement("div", { style: { background: '#1a1a2e', borderRadius: 14, boxShadow: '0 16px 60px rgba(0,0,0,.5)', width: 'min(1020px,96vw)', maxHeight: '94vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
            React.createElement("div", { style: { background: 'linear-gradient(135deg,#2a2a4e,#1a1a3e)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #3a3a5a' } },
                React.createElement("span", { style: { fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14, color: '#fff' } }, "\uD83C\uDFD7 Grundriss-Editor"),
                React.createElement("span", { style: { fontSize: 12, color: '#8080c0' } }, "R\u00E4ume anlegen, T\u00FCren und Fenster einbauen"),
                React.createElement("div", { style: { marginLeft: 'auto', display: 'flex', gap: 8 } },
                    React.createElement("button", { onClick: () => setShowGrundriss(false), style: { padding: '7px 16px', background: '#3a5a8a', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' } }, "\u2713 Fertig & schlie\u00DFen"))),
            React.createElement("div", { style: { background: '#12122a', padding: '8px 14px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #2a2a4a' } },
                React.createElement("div", { style: { display: 'flex', gap: 4 } }, [['select', '↖ Auswählen'], ['room', '⬛ Raum zeichnen'], ['wall', '🪟 Wand-Element']].map(([m, l]) => (React.createElement("button", { key: m, onClick: () => setDrawMode(m), style: { padding: '5px 10px', background: drawMode === m ? '#3a5aaa' : '#1e1e3e', color: drawMode === m ? '#fff' : '#8090c0', border: `1px solid ${drawMode === m ? '#5a7aca' : '#3a3a5a'}`, borderRadius: 6, fontSize: 11, fontWeight: drawMode === m ? 700 : 400, cursor: 'pointer' } }, l)))),
                drawMode === 'wall' && React.createElement("div", { style: { display: 'flex', gap: 8, alignItems: 'center', borderLeft: '1px solid #3a3a5a', paddingLeft: 10 } },
                    React.createElement("select", { value: wallAddType, onChange: e => setWallAddType(e.target.value), style: { background: '#1e1e3e', color: '#d0d0f0', border: '1px solid #3a3a5a', borderRadius: 5, padding: '4px 8px', fontSize: 11 } }, WALL_TYPES.map(k => React.createElement("option", { key: k, value: k }, ET[k].l))),
                    React.createElement("label", { style: { color: '#8090c0', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 } },
                        "Breite ",
                        React.createElement("input", { type: "number", value: wallW, onChange: e => setWallW(e.target.value), style: { width: 55, background: '#1e1e3e', color: '#d0d0f0', border: '1px solid #3a3a5a', borderRadius: 4, padding: '3px 5px', fontSize: 11 } }),
                        " cm"),
                    React.createElement("label", { style: { color: '#8090c0', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 } },
                        "Tiefe ",
                        React.createElement("input", { type: "number", value: wallH, onChange: e => setWallH(e.target.value), style: { width: 45, background: '#1e1e3e', color: '#d0d0f0', border: '1px solid #3a3a5a', borderRadius: 4, padding: '3px 5px', fontSize: 11 } }),
                        " cm")),
                React.createElement("div", { style: { display: 'flex', gap: 6, alignItems: 'center', borderLeft: '1px solid #3a3a5a', paddingLeft: 10, marginLeft: 'auto' } },
                    React.createElement("label", { style: { color: '#8090c0', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 } },
                        "Raumbreite ",
                        React.createElement("input", { type: "number", value: roomW, step: "50", onChange: e => setRoomW(parseInt(e.target.value) || 1200), style: { width: 70, background: '#1e1e3e', color: '#d0d0f0', border: '1px solid #3a3a5a', borderRadius: 4, padding: '3px 5px', fontSize: 11 } }),
                        " cm"),
                    React.createElement("label", { style: { color: '#8090c0', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 } },
                        "Tiefe ",
                        React.createElement("input", { type: "number", value: roomH, step: "50", onChange: e => setRoomH(parseInt(e.target.value) || 800), style: { width: 70, background: '#1e1e3e', color: '#d0d0f0', border: '1px solid #3a3a5a', borderRadius: 4, padding: '3px 5px', fontSize: 11 } }),
                        " cm"))),
            React.createElement("div", { style: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 } },
                React.createElement("div", { style: { flex: 1, overflow: 'auto', background: '#0c0c1a', padding: 10 } },
                    React.createElement("svg", { ref: grRef, width: GR_W, height: GR_H, style: { display: 'block', cursor: drawMode === 'room' ? 'crosshair' : drawMode === 'wall' ? 'cell' : 'default', userSelect: 'none', background: '#1a1a2e', border: '1px solid #3a3a5a', borderRadius: 6 }, onMouseDown: onGrDown, onMouseMove: onGrMove, onMouseUp: onGrUp, onMouseLeave: onGrUp },
                        React.createElement("rect", { width: GR_W, height: GR_H, fill: "#1a1a2e" }),
                        Array.from({ length: Math.ceil(roomW / 50) + 1 }, (_, i) => React.createElement("line", { key: 'gx' + i, x1: i * 50 * GR_SCALE, y1: 0, x2: i * 50 * GR_SCALE, y2: Math.min(GR_H, roomH * GR_SCALE), stroke: i % 4 ? '#23233e' : '#30305a', strokeWidth: i % 4 ? .4 : .9 })),
                        Array.from({ length: Math.ceil(roomH / 50) + 1 }, (_, i) => React.createElement("line", { key: 'gy' + i, x1: 0, y1: i * 50 * GR_SCALE, x2: Math.min(GR_W, roomW * GR_SCALE), y2: i * 50 * GR_SCALE, stroke: i % 4 ? '#23233e' : '#30305a', strokeWidth: i % 4 ? .4 : .9 })),
                        React.createElement("text", { x: 8, y: 14, fontSize: 9, fill: "#5060a0", fontFamily: "monospace" },
                            roomW,
                            "\u00D7",
                            roomH,
                            "cm \u00B7 Raster 50cm"),
                        rooms.map(r => (React.createElement("g", { key: r.id },
                            React.createElement("rect", { x: r.x * GR_SCALE, y: r.y * GR_SCALE, width: r.w * GR_SCALE, height: r.h * GR_SCALE, fill: r.color || '#f0f4ff', fillOpacity: .85, stroke: selRoom === r.id ? '#4080ff' : '#8090c0', strokeWidth: selRoom === r.id ? 2.5 : 1.5 }),
                            React.createElement("text", { x: (r.x + r.w / 2) * GR_SCALE, y: (r.y + r.h / 2) * GR_SCALE + 4, textAnchor: "middle", dominantBaseline: "middle", fontSize: Math.min(14, r.h * GR_SCALE * .2, r.w * GR_SCALE * .15), fontWeight: "700", fill: "#2a2a4e", fontFamily: "Arial" }, r.label),
                            selRoom === r.id && React.createElement("rect", { x: r.x * GR_SCALE - 2, y: r.y * GR_SCALE - 2, width: r.w * GR_SCALE + 4, height: r.h * GR_SCALE + 4, fill: "none", stroke: "#4080ff", strokeWidth: 1, strokeDasharray: "4,3" })))),
                        React.createElement("rect", { x: 0, y: 0, width: roomW * GR_SCALE, height: roomH * GR_SCALE, fill: "none", stroke: "#5060a0", strokeWidth: 2.5 }),
                        wallElems.map(el => (React.createElement("g", { key: el.id, transform: `translate(${el.x * GR_SCALE},${el.y * GR_SCALE})` },
                            React.createElement(Sym, { type: el.type, w: el.w * GR_SCALE, h: el.h * GR_SCALE, label: el.label })))),
                        drawMode === 'room' && drawStart && drawCurrent && (() => {
                            const x = Math.min(drawStart.x, drawCurrent.x) * GR_SCALE;
                            const y = Math.min(drawStart.y, drawCurrent.y) * GR_SCALE;
                            const w = Math.abs(drawCurrent.x - drawStart.x) * GR_SCALE;
                            const h = Math.abs(drawCurrent.y - drawStart.y) * GR_SCALE;
                            return React.createElement("rect", { x: x, y: y, width: w, height: h, fill: "#4080ff22", stroke: "#4080ff", strokeWidth: 2, strokeDasharray: "6,3" });
                        })())),
                React.createElement("div", { style: { width: 220, background: '#12122a', borderLeft: '1px solid #2a2a4a', padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 } },
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 9, color: '#5060a0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 } }, "R\u00E4ume"),
                    rooms.map(r => (React.createElement("div", { key: r.id, style: { background: selRoom === r.id ? '#1e3a6a' : '#1e1e3e', border: `1px solid ${selRoom === r.id ? '#4080ff' : '#3a3a5a'}`, borderRadius: 7, padding: '8px 10px', cursor: 'pointer' }, onClick: () => setSelRoom(r.id) },
                        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 } },
                            React.createElement("span", { style: { width: 12, height: 12, borderRadius: 3, background: r.color || '#f0f4ff', border: '1px solid #5060a0', flexShrink: 0 } }),
                            React.createElement("input", { value: r.label, onChange: e => setRooms(p => p.map(x => x.id === r.id ? { ...x, label: e.target.value } : x)), onClick: e => e.stopPropagation(), style: { background: 'transparent', border: 'none', color: '#d0d0f0', fontWeight: 700, fontSize: 12, flex: 1, outline: 'none' } })),
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } }, [['B', r.w, 'w'], ['T', r.h, 'h']].map(([l, v, f]) => (React.createElement("label", { key: f, style: { color: '#6070a0', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 } },
                            l,
                            ": ",
                            React.createElement("input", { type: "number", step: "50", value: v, onChange: e => setRooms(p => p.map(x => x.id === r.id ? { ...x, [f]: parseInt(e.target.value) || 100 } : x)), onClick: e => e.stopPropagation(), style: { width: 52, background: '#1a1a2e', color: '#c0c0e0', border: '1px solid #3a3a5a', borderRadius: 3, padding: '2px 4px', fontSize: 10 } }))))),
                        React.createElement("div", { style: { display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' } }, ROOM_COLORS.map(col => React.createElement("div", { key: col, onClick: e => { e.stopPropagation(); setRooms(p => p.map(x => x.id === r.id ? { ...x, color: col } : x)); }, style: { width: 16, height: 16, borderRadius: 4, background: col, border: `2px solid ${r.color === col ? '#4080ff' : 'transparent'}`, cursor: 'pointer' } }))),
                        rooms.length > 1 && React.createElement("button", { onClick: e => { e.stopPropagation(); setRooms(p => p.filter(x => x.id !== r.id)); if (selRoom === r.id)
                                setSelRoom(null); }, style: { marginTop: 6, width: '100%', padding: '3px', background: '#3a1a1a', color: '#ff8080', border: '1px solid #5a2a2a', borderRadius: 5, fontSize: 10, cursor: 'pointer' } }, "\uD83D\uDDD1 L\u00F6schen")))),
                    React.createElement("div", { style: { marginTop: 4, fontSize: 10, color: '#4050a0', lineHeight: 1.5 } },
                        drawMode === 'room' && 'Ziehe auf der Karte um einen neuen Raum zu zeichnen.',
                        drawMode === 'select' && 'Klicke auf einen Raum zum Auswählen. Verschieben per Drag.',
                        drawMode === 'wall' && 'Klicke auf eine Raumwand um Fenster/Tür einzufügen.'),
                    wallElems.length > 0 && React.createElement(React.Fragment, null,
                        React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 9, color: '#5060a0', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8 } }, "Wand-Elemente"),
                        wallElems.map(el => {
                            var _a;
                            return (React.createElement("div", { key: el.id, style: { background: '#1e1e3e', border: '1px solid #3a3a5a', borderRadius: 6, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6 } },
                                React.createElement("span", { style: { width: 8, height: 8, borderRadius: 2, background: ((_a = ET[el.type]) === null || _a === void 0 ? void 0 : _a.c) || '#888', flexShrink: 0 } }),
                                React.createElement("span", { style: { fontSize: 11, color: '#c0c0e0', flex: 1 } },
                                    el.label,
                                    " ",
                                    el.w,
                                    "\u00D7",
                                    el.h),
                                React.createElement("button", { onClick: () => setWallElems(p => p.filter(x => x.id !== el.id)), style: { background: 'none', border: 'none', color: '#ff8080', cursor: 'pointer', fontSize: 12 } }, "\u2715")));
                        })))))));
    // ── MAIN RENDER ───────────────────────────────────────────────────────────
    return (React.createElement("div", null,
        showGrundriss && React.createElement(GrundrissMod, null),
        React.createElement("div", { className: "card mb3", style: { padding: '10px 14px' } },
            React.createElement("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' } },
                React.createElement("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 8 } },
                    React.createElement("div", null,
                        React.createElement("span", { style: lbl }, "Breite cm"),
                        React.createElement("input", { type: "number", value: roomW, min: "100", step: "50", onChange: e => setRoomW(parseInt(e.target.value) || 1200), style: { width: 80 } })),
                    React.createElement("div", null,
                        React.createElement("span", { style: lbl }, "Tiefe cm"),
                        React.createElement("input", { type: "number", value: roomH, min: "100", step: "50", onChange: e => setRoomH(parseInt(e.target.value) || 800), style: { width: 80 } }))),
                !wallMode && React.createElement("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 6 } },
                    React.createElement("div", null,
                        React.createElement("span", { style: lbl }, "Element"),
                        React.createElement("select", { value: addType, onChange: e => setAddType(e.target.value), style: { width: 155 } }, CATS.filter(c => c !== 'wand').map(cat => React.createElement("optgroup", { key: cat, label: cat.toUpperCase() }, Object.entries(ET).filter(([, v]) => v.cat === cat).map(([k, v]) => React.createElement("option", { key: k, value: k }, v.l)))))),
                    React.createElement("button", { className: "btn bp bsm", onClick: addEl }, "+ Hinzuf\u00FCgen")),
                wallMode && React.createElement("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' } },
                    React.createElement("div", null,
                        React.createElement("span", { style: lbl }, "Wand-Typ"),
                        React.createElement("select", { value: wallAddType, onChange: e => setWallAddType(e.target.value) }, WALL_TYPES.map(k => React.createElement("option", { key: k, value: k }, ET[k].l)))),
                    React.createElement("div", null,
                        React.createElement("span", { style: lbl }, "Breite cm"),
                        React.createElement("input", { type: "number", value: wallW, min: "20", step: "10", onChange: e => setWallW(e.target.value), style: { width: 70 } })),
                    React.createElement("div", null,
                        React.createElement("span", { style: lbl }, "Tiefe cm"),
                        React.createElement("input", { type: "number", value: wallH, min: "8", step: "2", onChange: e => setWallH(e.target.value), style: { width: 60 } }))),
                React.createElement("div", { style: { display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginLeft: 'auto' } },
                    React.createElement("button", { className: "btn bs bsm", onClick: undo, disabled: histIdx <= 0, style: { opacity: histIdx <= 0 ? .4 : 1 } }, "\u21A9"),
                    React.createElement("button", { className: "btn bs bsm", onClick: redo, disabled: histIdx >= history.length - 1, style: { opacity: histIdx >= history.length - 1 ? .4 : 1 } }, "\u21AA"),
                    selEl && !wallMode && React.createElement(React.Fragment, null,
                        React.createElement("button", { className: "btn bs bsm", onClick: () => updEl(sel, { rot: ((selEl.rot || 0) + 90) % 360 }) }, "\u21BB 90\u00B0"),
                        React.createElement("button", { className: "btn bs bsm", onClick: () => cloneEl(sel) }, "\u29C9"),
                        React.createElement("button", { className: "btn bd bsm", onClick: () => delEl(sel) }, "\uD83D\uDDD1")),
                    React.createElement("button", { onClick: () => setWallMode(m => !m), style: { padding: '6px 12px', borderRadius: 6, border: `2px solid ${wallMode ? '#0070ff' : 'var(--bord)'}`, background: wallMode ? '#0070ff' : '#fff', color: wallMode ? '#fff' : 'var(--dk)', fontWeight: 700, fontSize: 11, cursor: 'pointer' } }, wallMode ? '✓ Wand-Modus' : '🧱 Wände'),
                    React.createElement("button", { onClick: () => setShowGrundriss(true), style: { padding: '6px 12px', borderRadius: 6, border: '2px solid #6d28d9', background: '#6d28d9', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' } }, "\uD83C\uDFD7 Grundriss"),
                    React.createElement("button", { className: "btn bs bsm", onClick: doPrint }, "\uD83D\uDDA8 Drucken")))),
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 215px', gap: 12, alignItems: 'start' } },
            React.createElement("div", { style: { background: '#e8e8f0', border: `2px solid ${wallMode ? '#0070ff' : 'var(--bord)'}`, borderRadius: 8, overflow: 'hidden', cursor: wallMode ? 'crosshair' : drag ? 'grabbing' : 'default', transition: 'border-color .2s' } },
                wallMode && React.createElement("div", { style: { background: '#0070ff', color: '#fff', fontSize: 11, padding: '4px 12px', fontWeight: 600 } }, "\uD83E\uDDF1 Wand-Modus \u00B7 Klicke auf eine Au\u00DFenwand \u00B7 Typ/Gr\u00F6\u00DFe oben konfigurierbar"),
                React.createElement("svg", { ref: svgRef, width: CANVAS_W, height: CANVAS_H, style: { display: 'block', userSelect: 'none' }, onMouseMove: e => { onFurMove(e); onWallHover(e); }, onMouseUp: e => { onFurUp(e); if (wallMode)
                        onWallClick(e); }, onMouseLeave: () => { onFurUp(); setWallHover(null); }, onClick: e => { if (!wallMode && (e.target === e.currentTarget || e.target.tagName === 'svg'))
                        setSel(null); } },
                    React.createElement("rect", { width: CANVAS_W, height: CANVAS_H, fill: "#c8c8d8" }),
                    rooms.map(r => React.createElement("rect", { key: r.id, x: r.x * SCALE, y: r.y * SCALE, width: r.w * SCALE, height: r.h * SCALE, fill: r.color || '#f0f4ff', fillOpacity: .9, stroke: "#9090a8", strokeWidth: 1 })),
                    Array.from({ length: Math.ceil(roomW / GRID) + 1 }, (_, i) => React.createElement("line", { key: 'gx' + i, x1: i * GRID * SCALE, y1: 0, x2: i * GRID * SCALE, y2: Math.min(CANVAS_H, roomH * SCALE), stroke: i % 10 ? '#dcdce8' : '#b8b8cc', strokeWidth: i % 10 ? .3 : .9 })),
                    Array.from({ length: Math.ceil(roomH / GRID) + 1 }, (_, i) => React.createElement("line", { key: 'gy' + i, x1: 0, y1: i * GRID * SCALE, x2: Math.min(CANVAS_W, roomW * SCALE), y2: i * GRID * SCALE, stroke: i % 10 ? '#dcdce8' : '#b8b8cc', strokeWidth: i % 10 ? .3 : .9 })),
                    React.createElement("text", { x: 8, y: 14, fontSize: 9, fill: "#8888a0", fontFamily: "monospace" },
                        roomW,
                        "\u00D7",
                        roomH,
                        "cm \u00B7 10cm Raster"),
                    rooms.map(r => React.createElement("text", { key: r.id, x: (r.x + 6) * SCALE, y: (r.y + 16) * SCALE, fontSize: 9, fill: "#6060a0", fontFamily: "Arial", fontWeight: "600" }, r.label)),
                    React.createElement("rect", { x: 0, y: 0, width: roomW * SCALE, height: roomH * SCALE, fill: "none", stroke: "#2a2a3e", strokeWidth: 3 }),
                    rooms.map(r => React.createElement("rect", { key: r.id + 'b', x: r.x * SCALE, y: r.y * SCALE, width: r.w * SCALE, height: r.h * SCALE, fill: "none", stroke: "#7080b0", strokeWidth: 1.5 })),
                    wallMode && React.createElement(React.Fragment, null,
                        React.createElement("rect", { x: 0, y: 0, width: roomW * SCALE, height: WALL_HIT, fill: "#0070ff", opacity: (wallHover === null || wallHover === void 0 ? void 0 : wallHover.wall) === 'top' ? .3 : .07 }),
                        React.createElement("rect", { x: 0, y: roomH * SCALE - WALL_HIT, width: roomW * SCALE, height: WALL_HIT, fill: "#0070ff", opacity: (wallHover === null || wallHover === void 0 ? void 0 : wallHover.wall) === 'bottom' ? .3 : .07 }),
                        React.createElement("rect", { x: 0, y: 0, width: WALL_HIT, height: roomH * SCALE, fill: "#0070ff", opacity: (wallHover === null || wallHover === void 0 ? void 0 : wallHover.wall) === 'left' ? .3 : .07 }),
                        React.createElement("rect", { x: roomW * SCALE - WALL_HIT, y: 0, width: WALL_HIT, height: roomH * SCALE, fill: "#0070ff", opacity: (wallHover === null || wallHover === void 0 ? void 0 : wallHover.wall) === 'right' ? .3 : .07 })),
                    React.createElement(WallPreview, null),
                    wallElems.map(el => (React.createElement("g", { key: el.id, transform: `translate(${el.x * SCALE},${el.y * SCALE})` },
                        React.createElement(Sym, { type: el.type, w: el.w * SCALE, h: el.h * SCALE, label: el.label })))),
                    elems.map(el => {
                        const isSel = el.id === sel && !wallMode;
                        const sw = el.w * SCALE, sh = el.h * SCALE;
                        const cx = (el.x + el.w / 2) * SCALE, cy = (el.y + el.h / 2) * SCALE;
                        return (React.createElement("g", { key: el.id, transform: `rotate(${el.rot || 0},${cx},${cy})` },
                            React.createElement("g", { transform: `translate(${el.x * SCALE},${el.y * SCALE})`, onMouseDown: e => { if (!wallMode)
                                    onFurDown(e, el.id, 'move'); }, style: { cursor: wallMode ? 'default' : 'grab' } },
                                React.createElement(Sym, { type: el.type, w: sw, h: sh, label: el.label }),
                                isSel && React.createElement("rect", { width: sw, height: sh, fill: "none", stroke: "#0070ff", strokeWidth: 2, strokeDasharray: "5,3", rx: 2 })),
                            isSel && [[el.x, el.y, 'nw'], [el.x + el.w, el.y, 'ne'], [el.x + el.w, el.y + el.h, 'se'], [el.x, el.y + el.h, 'sw']].map(([hx, hy, c]) => (React.createElement("rect", { key: c, x: hx * SCALE - HANDLE / 2, y: hy * SCALE - HANDLE / 2, width: HANDLE, height: HANDLE, rx: 2, fill: "#fff", stroke: "#0070ff", strokeWidth: 1.5, style: { cursor: 'nwse-resize' }, onMouseDown: e => onFurDown(e, el.id, 'resize', { corner: c }) }))),
                            isSel && React.createElement(React.Fragment, null,
                                React.createElement("line", { x1: cx, y1: el.y * SCALE, x2: cx, y2: Math.max(7, el.y * SCALE - 22), stroke: "#0070ff", strokeWidth: 1.5, strokeDasharray: "3,2" }),
                                React.createElement("circle", { cx: cx, cy: Math.max(7, el.y * SCALE - 26), r: 7, fill: "#0070ff", stroke: "#fff", strokeWidth: 2, style: { cursor: 'crosshair' }, onMouseDown: e => onFurDown(e, el.id, 'rotate') }),
                                React.createElement("text", { x: cx, y: Math.max(7, el.y * SCALE - 26), textAnchor: "middle", dominantBaseline: "middle", fontSize: 11, fill: "#fff", style: { pointerEvents: 'none' } }, "\u21BB"))));
                    }))),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                selEl && !wallMode ? React.createElement("div", { className: "card", style: { padding: 11 } },
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 } },
                        "\u270E ",
                        selEl.label),
                    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                        React.createElement("div", null,
                            React.createElement("span", { style: lbl }, "Bezeichnung"),
                            React.createElement("input", { value: selEl.label, onChange: e => updEl(sel, { label: e.target.value }) })),
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 } },
                            React.createElement("div", null,
                                React.createElement("span", { style: lbl }, "Breite cm"),
                                React.createElement("input", { type: "number", step: "10", value: selEl.w, onChange: e => updEl(sel, { w: Math.max(10, parseInt(e.target.value) || 10) }) })),
                            React.createElement("div", null,
                                React.createElement("span", { style: lbl }, "Tiefe cm"),
                                React.createElement("input", { type: "number", step: "10", value: selEl.h, onChange: e => updEl(sel, { h: Math.max(10, parseInt(e.target.value) || 10) }) })),
                            React.createElement("div", null,
                                React.createElement("span", { style: lbl }, "X cm"),
                                React.createElement("input", { type: "number", step: "10", value: selEl.x, onChange: e => updEl(sel, { x: parseInt(e.target.value) || 0 }) })),
                            React.createElement("div", null,
                                React.createElement("span", { style: lbl }, "Y cm"),
                                React.createElement("input", { type: "number", step: "10", value: selEl.y, onChange: e => updEl(sel, { y: parseInt(e.target.value) || 0 }) })),
                            React.createElement("div", { style: { gridColumn: 'span 2' } },
                                React.createElement("span", { style: lbl }, "Rotation \u00B0"),
                                React.createElement("input", { type: "number", step: "5", value: selEl.rot || 0, onChange: e => updEl(sel, { rot: parseInt(e.target.value) || 0 }) }))),
                        React.createElement("div", { style: { display: 'flex', gap: 5 } },
                            React.createElement("button", { className: "btn bs bsm", style: { flex: 1 }, onClick: () => cloneEl(sel) }, "\u29C9"),
                            React.createElement("button", { className: "btn bd bsm", style: { flex: 1 }, onClick: () => delEl(sel) }, "\uD83D\uDDD1"))))
                    : React.createElement("div", { style: { background: wallMode ? '#f0f5ff' : 'var(--card2)', border: `1px solid ${wallMode ? '#c0d0ff' : 'var(--bord)'}`, borderRadius: 8, padding: 12, fontSize: 11, color: wallMode ? '#2040a0' : 'var(--muted)', textAlign: 'center', lineHeight: 1.8 } }, wallMode ? React.createElement(React.Fragment, null,
                        React.createElement("strong", null, "\uD83E\uDDF1 Wand-Modus"),
                        React.createElement("br", null),
                        "Au\u00DFenwand anklicken",
                        React.createElement("br", null),
                        "Typ + Ma\u00DFe oben") : React.createElement(React.Fragment, null,
                        "Klicken \u2192 ausw\u00E4hlen",
                        React.createElement("br", null),
                        "Ecke \u2192 Gr\u00F6\u00DFe \u00E4ndern",
                        React.createElement("br", null),
                        "\u21BB Kreis \u2192 drehen",
                        React.createElement("br", null),
                        "Raster 10cm")),
                React.createElement("div", { className: "card", style: { padding: 10 } },
                    React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 8, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 } }, "Legende"),
                    CATS.filter(c => c !== 'wand').map(cat => (React.createElement("div", { key: cat },
                        React.createElement("div", { style: { fontSize: 8, color: 'var(--muted)', fontFamily: 'var(--fd)', letterSpacing: 1, marginTop: 5, marginBottom: 2, textTransform: 'uppercase' } }, cat),
                        Object.entries(ET).filter(([, v]) => v.cat === cat).map(([k, v]) => (React.createElement("div", { key: k, style: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2, cursor: 'pointer', opacity: typeCounts[k] ? 1 : .45 }, onClick: () => !wallMode && setAddType(k) },
                            React.createElement("span", { style: { width: 8, height: 8, borderRadius: 2, background: v.c, flexShrink: 0 } }),
                            React.createElement("span", { style: { fontSize: 10, color: k === addType ? 'var(--blue)' : 'var(--dk)', fontWeight: k === addType ? 700 : 400, flex: 1 } }, v.l),
                            typeCounts[k] && React.createElement("span", { style: { fontSize: 9, color: 'var(--muted)' } },
                                typeCounts[k],
                                "\u00D7")))))))))),
        elems.length > 0 && React.createElement("div", { style: { marginTop: 10, background: 'var(--card2)', border: '1px solid var(--bord)', borderRadius: 8, padding: '7px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' } },
            React.createElement("span", { style: { fontFamily: 'var(--fd)', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginRight: 4 } }, "Aufstellung:"),
            Object.entries(typeCounts).filter(([k]) => { var _a; return ((_a = ET[k]) === null || _a === void 0 ? void 0 : _a.cat) !== 'wand'; }).map(([k, n]) => {
                var _a, _b;
                return (React.createElement("span", { key: k, style: { display: 'flex', alignItems: 'center', gap: 3, background: '#fff', border: '1px solid var(--bord2)', borderRadius: 5, padding: '2px 8px', fontSize: 11 } },
                    React.createElement("span", { style: { width: 7, height: 7, borderRadius: 2, background: ((_a = ET[k]) === null || _a === void 0 ? void 0 : _a.c) || '#888', flexShrink: 0 } }),
                    React.createElement("strong", null,
                        n,
                        "\u00D7"),
                    " ",
                    ((_b = ET[k]) === null || _b === void 0 ? void 0 : _b.l) || k));
            }))));
}

// ── Ticker-Satz-Editor ────────────────────────────────────────────────────────
const TICKER_BAUSTEINE = [
  { label: 'Sieger', ph: '{WINNER}',   desc: 'Name des Gewinners oder Siegerteams' },
  { label: 'Verlierer', ph: '{LOSER}', desc: 'Name des Unterlegenen' },
  { label: 'Konsole', ph: '{KONSOLE}', desc: 'Konsolname (z.B. Switch, SNES)' },
  { label: 'Punkte', ph: '{W_PTS}',   desc: 'Punkte die der Sieger kassiert hat' },
  { label: 'Pronomen', ph: '{PRONOMEN}', desc: 'er/sie (Solo) oder "das Team" (Team)' },
];

const TICKER_KATEGORIEN = [
  { label: '🏆 Siegesmeldungen', items: [
    '{WINNER} schlägt {LOSER} auf {KONSOLE} und kassiert {W_PTS} Punkte!',
    'Klarer Sieg: {WINNER} lässt {LOSER} auf {KONSOLE} keine Chance.',
    '{WINNER} dominiert das Match auf {KONSOLE} — {W_PTS} Punkte gesichert!',
  ]},
  { label: '⚡ Knapper Ausgang', items: [
    'Knappes Rennen auf {KONSOLE}: {WINNER} setzt sich gerade noch durch.',
    'Hauchdünn: {WINNER} schlägt {LOSER} in einem Thriller auf {KONSOLE}.',
    'In letzter Sekunde: {WINNER} rettet den Sieg gegen {LOSER}!',
  ]},
  { label: '🎮 Atmosphäre', items: [
    '{WINNER} und {LOSER} liefern auf {KONSOLE} ein echtes Spektakel!',
    'Das Publikum tobt! {WINNER} siegt auf {KONSOLE}.',
    'Was für ein Rennen! Am Ende jubelt {WINNER} über {W_PTS} Punkte.',
  ]},
  { label: '📊 Sachlich', items: [
    '{WINNER} holt {W_PTS} Punkte auf {KONSOLE}. {LOSER} bleibt leer.',
    'Ergebnis {KONSOLE}: {WINNER} vor {LOSER}.',
    'Match auf {KONSOLE} abgeschlossen — {WINNER} siegt.',
  ]},
];

function TickerEditorTab({ orgaData, setOrgaData }) {
  const [activeInput, setActiveInput] = React.useState(null); // index of focused input
  const templates = (orgaData && Array.isArray(orgaData.tickerTemplates) && orgaData.tickerTemplates.length)
    ? orgaData.tickerTemplates
    : DEFAULT_TICKER_TEMPLATES;
  const speed = (orgaData && orgaData.tickerSpeed != null) ? parseFloat(orgaData.tickerSpeed) : 80;

  function saveTemplates(list) {
    setOrgaData(prev => ({ ...normalizeOrgaData(prev), tickerTemplates: list }));
  }
  function saveSpeed(val) {
    setOrgaData(prev => ({ ...normalizeOrgaData(prev), tickerSpeed: val }));
  }
  function update(idx, val) {
    const next = [...templates]; next[idx] = val; saveTemplates(next);
  }
  function remove(idx) { saveTemplates(templates.filter((_, i) => i !== idx)); }
  function addNew(tpl) { saveTemplates([...templates, tpl || '{WINNER} schlägt {LOSER} auf {KONSOLE}!']); }
  function reset() { saveTemplates([...DEFAULT_TICKER_TEMPLATES]); }
  function insertBaustein(ph) {
    if (activeInput === null) { addNew(ph); return; }
    const el = document.getElementById('ticker-tpl-' + activeInput);
    if (el) {
      const s = el.selectionStart || templates[activeInput].length;
      const e2 = el.selectionEnd || s;
      const next = [...templates];
      next[activeInput] = templates[activeInput].slice(0, s) + ph + templates[activeInput].slice(e2);
      saveTemplates(next);
      setTimeout(() => { el.focus(); el.setSelectionRange(s + ph.length, s + ph.length); }, 10);
    } else {
      addNew(ph);
    }
  }

  const speedLabel = speed <= 40 ? 'Sehr langsam' : speed <= 70 ? 'Langsam' : speed <= 100 ? 'Normal' : speed <= 150 ? 'Schnell' : 'Sehr schnell';

  return React.createElement('div', null,
    // ── Einstellungen ──
    React.createElement('div', { className: 'card mb3' },
      React.createElement('div', { className: 'card-hdr' },
        React.createElement('span', { className: 'ctitle' }, '⚙️ Ticker-Einstellungen')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', padding: '4px 0' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          React.createElement('div', { className: 'fp-player-label' }, '🚀 Geschwindigkeit'),
          React.createElement('input', { type: 'range', min: 20, max: 250, step: 10, value: speed, onChange: e => saveSpeed(parseFloat(e.target.value)),
            style: { width: 180, accentColor: 'var(--red)' } }),
          React.createElement('span', { style: { fontFamily: 'var(--fd)', fontSize: 11, color: 'var(--dk)', minWidth: 90 } },
            speed + ' px/s — ' + speedLabel)
        ),
        React.createElement('div', { style: { fontSize: 12, color: 'var(--muted)', borderLeft: '1px solid var(--bord)', paddingLeft: 16 } },
          'Niedrig = langsamer Lauf · Hoch = schnelles Band')
      )
    ),

    // ── Bausteine ──
    React.createElement('div', { className: 'card mb3' },
      React.createElement('div', { className: 'card-hdr' },
        React.createElement('span', { className: 'ctitle' }, '🧱 Bausteine einfügen'),
        React.createElement('span', { style: { fontSize: 11, color: 'var(--muted)', marginLeft: 8 } }, 'Klicke → wird in markierten Satz eingefügt (oder neuer Satz)')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 } },
        TICKER_BAUSTEINE.map(b => React.createElement('button', {
          key: b.ph, className: 'btn bs bsm',
          onClick: () => insertBaustein(b.ph),
          title: b.desc,
          style: { fontFamily: 'var(--fd)', letterSpacing: .5 }
        }, b.label + ' ' + b.ph))
      ),
      // ── Vorlagen-Kategorien ──
      React.createElement('div', { className: 'fp-player-label', style: { marginBottom: 6 } }, 'Satz-Vorlagen — klicken zum Hinzufügen:'),
      TICKER_KATEGORIEN.map(kat => React.createElement('div', { key: kat.label, style: { marginBottom: 8 } },
        React.createElement('div', { style: { fontSize: 10, fontFamily: 'var(--fd)', color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 } }, kat.label),
        React.createElement('div', { style: { display: 'flex', gap: 5, flexWrap: 'wrap' } },
          kat.items.map((tpl, i) => React.createElement('button', {
            key: i, className: 'btn bs bsm',
            style: { fontSize: 11, textAlign: 'left', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
            title: 'Hinzufügen: ' + tpl,
            onClick: () => addNew(tpl)
          }, '+ ' + tpl.slice(0, 55) + (tpl.length > 55 ? '…' : '')))
        )
      ))
    ),

    // ── Satz-Liste ──
    React.createElement('div', { className: 'card' },
      React.createElement('div', { className: 'card-hdr' },
        React.createElement('span', { className: 'ctitle' }, '📰 Aktive Sätze (' + templates.length + ')'),
        React.createElement('div', { className: 'flex g2 fca' },
          React.createElement('button', { className: 'btn bp bsm', onClick: () => addNew() }, '+ Leerer Satz'),
          React.createElement('button', { className: 'btn bd bsm', onClick: reset, title: '30 Standard-Sätze wiederherstellen' }, '↺ Standard')
        )
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
        templates.map((tpl, i) =>
          React.createElement('div', { key: i, style: { display: 'flex', gap: 8, alignItems: 'center', background: activeInput === i ? '#f0f5ff' : '#fff', border: '1px solid ' + (activeInput === i ? 'var(--blue)' : 'var(--bord)'), borderRadius: 8, padding: '6px 10px' } },
            React.createElement('span', { style: { fontFamily: 'var(--fd)', fontSize: 10, color: 'var(--muted)', minWidth: 22, textAlign: 'center', flexShrink: 0 } }, i + 1),
            React.createElement('input', {
              id: 'ticker-tpl-' + i,
              type: 'text', value: tpl,
              onFocus: () => setActiveInput(i),
              onBlur: () => setActiveInput(null),
              onChange: e => update(i, e.target.value),
              style: { flex: 1, fontSize: 12 }
            }),
            React.createElement('button', { className: 'btn bd bsm', onClick: () => remove(i), style: { flexShrink: 0 } }, '✕')
          )
        )
      )
    )
  );
}function roomPlanEscapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch));
}

export {
  isPaidPayment,
  getRealParticipants,
  makeUid,
  parseNum,
  money,
  inferShopCategory,
  shortNameLabel,
  getShopQty,
  makeOrgaParticipant,
  normalizeSourceTitle,
  normalizeSourceUrl,
  sourceLabelForItem,
  externalUrl,
  makeShopItem,
  makeTodoItem,
  makeIdeaItem,
  makeBringItem,
  makeRuleItem,
  makeSetupAsset,
  makeStation,
  makeChecklistItem,
  makeBringRequirement,
  normalizeBringCell,
  makeBringAssignment,
  makeDefaultBringPlan,
  normalizeBringPlan,
  makeDefaultOrgaData,
  normalizeOrgaData,
  MiniStat,
  BoolPill,
  OrgTeilnehmerTab,
  WerBringtWasTab,
  KostenTodoIdeenTab,
  IdeenTab,
  SpielregelnAdminTab,
  AufbauTab,
  TickerEditorTab,
  SHOP_CATEGORIES,
  DEFAULT_ORGA_RULES,
  TICKER_BAUSTEINE,
  TICKER_KATEGORIEN,
};
