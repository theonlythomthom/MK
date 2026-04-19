import React from 'react';

const { useState, useMemo } = React;

function Modal({ title, children, onCancel, onConfirm, confirmLabel = 'OK', confirmColor = 'var(--red)', maxWidth = 420 }) {
    return (React.createElement("div", { style: { position: 'fixed', inset: 0, background: 'rgba(5,5,18,.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(3px)' }, onClick: e => e.target === e.currentTarget && onCancel() },
        React.createElement("div", { style: { background: '#fff', borderRadius: 14, boxShadow: '0 16px 60px rgba(0,0,0,.4),0 0 0 1px rgba(0,0,0,.08)', maxWidth, width: '100%', overflow: 'hidden', animation: 'modal-in .18s ease-out' } },
            React.createElement("div", { style: { background: 'linear-gradient(135deg,#e60012,#ff4455)', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 10 } },
                React.createElement("div", { style: { fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 13, color: '#fff', letterSpacing: .5 } }, title),
                React.createElement("button", { onClick: onCancel, style: { marginLeft: 'auto', background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\u2715")),
            React.createElement("div", { style: { padding: '20px 22px', color: 'var(--ds)', fontSize: 14, lineHeight: 1.6 } }, children),
            React.createElement("div", { style: { display: 'flex', gap: 10, padding: '14px 22px', borderTop: '1px solid var(--bord)', justifyContent: 'flex-end', background: 'var(--card2)' } },
                React.createElement("button", { className: "btn bs", onClick: onCancel }, "Abbrechen"),
                React.createElement("button", { id: "modal-confirm", className: "btn", style: { background: confirmColor, color: '#fff', boxShadow: `0 3px 12px ${confirmColor}55` }, onClick: onConfirm }, confirmLabel)))));
}
function MasterListEditor({ title, items, onAdd, onRemove }) {
    const [input, setInput] = useState('');
    return (React.createElement("div", { className: "card", style: { padding: 14 } },
        React.createElement("div", { className: "card-hdr", style: { marginBottom: 10 } },
            React.createElement("span", { className: "ctitle", style: { fontSize: 12 } }, title),
            React.createElement("span", { className: "chip chip-b" },
                items.length,
                " Eintr\u00E4ge")),
        React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 } },
            items.map(item => (React.createElement("span", { key: item, className: "chip", style: { fontSize: 10, padding: '6px 8px' } },
                item,
                React.createElement("button", { className: "bic", style: { marginLeft: 6, padding: '0 5px', fontSize: 10 }, onClick: () => onRemove(item) }, "\u2715")))),
            !items.length && React.createElement("span", { className: "muted text-sm" }, "Noch keine Eintr\u00E4ge.")),
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 } },
            React.createElement("input", { type: "text", value: input, onChange: e => setInput(e.target.value), placeholder: `${title} hinzufügen`, onKeyDown: e => { if (e.key === 'Enter' && input.trim()) {
                    onAdd(input.trim());
                    setInput('');
                } } }),
            React.createElement("button", { className: "btn bp bsm", onClick: () => { if (input.trim()) {
                    onAdd(input.trim());
                    setInput('');
                } } }, "+ Hinzuf\u00FCgen"))));
}
function PlayerPrefEditor({ label, options, entries, onChange }) {
    function addEntry() { onChange([...(entries || []), makePrefEntry((options === null || options === void 0 ? void 0 : options[0]) || '', 0)]); }
    function updEntry(id, field, value) { onChange((entries || []).map(entry => entry.id === id ? { ...entry, [field]: field === 'count' ? Math.max(0, parseInt(value, 10) || 0) : value } : entry)); }
    function remEntry(id) { onChange((entries || []).filter(entry => entry.id !== id)); }
    return (React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 10 } },
        React.createElement("div", { className: "card-hdr", style: { marginBottom: 10 } },
            React.createElement("span", { className: "ctitle", style: { fontSize: 12 } }, label),
            React.createElement("button", { className: "btn bs bsm", onClick: addEntry }, "+ Zuordnung")),
        (entries || []).length === 0 && React.createElement("div", { className: "muted text-sm" }, "Noch keine Zuordnung."),
        (entries || []).map(entry => {
            var _a;
            return (React.createElement("div", { key: entry.id, style: { display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 8, marginBottom: 8, alignItems: 'center' } },
                React.createElement("select", { value: entry.item, onChange: e => updEntry(entry.id, 'item', e.target.value) },
                    React.createElement("option", { value: "" }, "Bitte ausw\u00E4hlen"),
                    (options || []).map(opt => React.createElement("option", { key: opt, value: opt }, opt))),
                React.createElement("input", { type: "number", min: "0", step: "1", value: (_a = entry.count) !== null && _a !== void 0 ? _a : 0, onChange: e => updEntry(entry.id, 'count', e.target.value), placeholder: "Anzahl" }),
                React.createElement("button", { className: "bic", onClick: () => remEntry(entry.id) }, "\u2715")));
        })));
}
function SpielerDatenTab({ playerDb, setPlayerDb, consoles }) {
    const [editPlayer, setEditPlayer] = useState(null);
    const data = normalizePlayerDb(playerDb, consoles);
    const players = [...data.players].sort((a, b) => fullPlayerName(a).localeCompare(fullPlayerName(b), 'de'));
    const consoleCatalog = useMemo(() => getOrderedConsoleCatalog(consoles), [consoles]);
    function savePlayer() {
        if (!editPlayer)
            return;
        if (!editPlayer.firstName.trim() && !editPlayer.lastName.trim())
            return;
        const cleaned = {
            ...editPlayer,
            firstName: editPlayer.firstName.trim(),
            lastName: editPlayer.lastName.trim(),
            nickname: (editPlayer.nickname || '').trim(),
            prefs: Object.fromEntries(PLAYER_PREF_CATS.map(cat => {
                var _a;
                return [
                    cat.key,
                    (((_a = editPlayer.prefs) === null || _a === void 0 ? void 0 : _a[cat.key]) || []).filter(x => x.item && prefCountFromLegacy(x.count) > 0).map(x => ({ ...x, count: prefCountFromLegacy(x.count) }))
                ];
            }))
        };
        setPlayerDb(prev => {
            const next = normalizePlayerDb(prev, consoles);
            const exists = next.players.some(p => String(p.id) === String(cleaned.id));
            return {
                ...next,
                players: exists ? next.players.map(p => String(p.id) === String(cleaned.id) ? cleaned : p) : [...next.players, cleaned]
            };
        });
        setEditPlayer(null);
    }
    function deletePlayer(id) {
        if (!confirm('Spieler wirklich entfernen?'))
            return;
        setPlayerDb(prev => {
            const next = normalizePlayerDb(prev, consoles);
            return { ...next, players: next.players.filter(p => String(p.id) !== String(id)) };
        });
    }
    function openNew() { setEditPlayer(makePlayerRecord(`pl_${Date.now()}`)); }
    function openEdit(player) { setEditPlayer(JSON.parse(JSON.stringify(player))); }
    function updateInventory(consoleName, gameName, type, value) {
        const safe = Math.max(0, parseInt(value, 10) || 0);
        setEditPlayer(prev => {
            if (!prev)
                return prev;
            const prefs = { ...(prev.prefs || {}) };
            if (type === 'console')
                prefs.consoles = setPrefCountForExactItem(prefs.consoles || [], consoleName, safe);
            if (type === 'controller')
                prefs.controllers = setPrefCountForExactItem(prefs.controllers || [], controllerItemLabelForConsole(consoleName), safe);
            if (type === 'game')
                prefs.games = setPrefCountForExactItem(prefs.games || [], gameName, safe);
            if (type === 'tv')
                prefs.tvs = safe > 0 ? [makePrefEntry('TV', safe)] : [];
            return { ...prev, prefs };
        });
    }
    return (React.createElement("div", null,
        React.createElement("div", { className: "card" },
            React.createElement("div", { className: "card-hdr" },
                React.createElement("span", { className: "ctitle" }, "\uD83E\uDDD1\u200D\uD83D\uDCBC Spielerdaten"),
                React.createElement("div", { className: "flex g2 fca" },
                    React.createElement("span", { className: "chip chip-b" },
                        players.length,
                        " Personen"),
                    React.createElement("button", { className: "btn bp", onClick: openNew }, "+ Person anlegen"))),
            React.createElement("div", { style: { display: 'grid', gap: 10 } },
                players.map(player => {
                    const tvCount = getPlayerTvCount(player);
                    return (React.createElement("div", { key: player.id, style: { border: '1px solid var(--bord)', borderTop: '3px solid var(--red)', borderRadius: 10, overflow: 'hidden', background: '#fff' } },
                        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(220px,1.3fr) minmax(150px,.9fr) 120px auto', gap: 12, alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--bord)', background: 'linear-gradient(180deg,#fafafe,#f4f4fa)' } },
                            React.createElement("div", { style: { minWidth: 0 } },
                                React.createElement("div", { className: "fp-player-label" }, "Name"),
                                React.createElement("div", { style: { fontWeight: 700, fontSize: 15, color: 'var(--dk)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, fullPlayerName(player) || 'Ohne Namen')),
                            React.createElement("div", { style: { minWidth: 0 } },
                                React.createElement("div", { className: "fp-player-label" }, "Spitzname"),
                                React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: 'var(--dk)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, player.nickname || '–')),
                            React.createElement("div", null,
                                React.createElement("div", { className: "fp-player-label" }, "\u00DC/U18"),
                                React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: 'var(--dk)' } }, player.ageGroup === 'u18' ? 'U18' : 'Ü18')),
                            React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' } },
                                React.createElement("button", { className: "btn bs bsm", onClick: () => openEdit(player) }, "Bearbeiten"),
                                React.createElement("button", { className: "btn bd bsm", onClick: () => deletePlayer(player.id) }, "Entfernen"))),
                        React.createElement("div", { style: { padding: '12px 14px' } },
                            React.createElement("div", { style: { overflowX: 'auto' } },
                                React.createElement("table", { style: { width: '100%', minWidth: Math.max(620, consoleCatalog.length * 108 + 110), tableLayout: 'fixed', borderCollapse: 'collapse' } },
                                    React.createElement("thead", null,
                                        React.createElement("tr", null,
                                            consoleCatalog.map((con, ci) => React.createElement("th", { key: `${con.id}_top`, colSpan: 3, style: { padding: '0 0 6px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', borderLeft: ci > 0 ? '2px solid var(--bord2)' : 'none', background: ci % 2 ? '#f4f6fb' : '#fff' } }, con.consoleName)),
                                            React.createElement("th", { rowSpan: 2, style: { width: 72, padding: '0 4px 6px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' } }, "TV")),
                                        React.createElement("tr", null, consoleCatalog.map(con => (React.createElement(React.Fragment, { key: `${con.id}_sub` },
                                            React.createElement("th", { style: { padding: '0 2px 8px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)' } }, "K"),
                                            React.createElement("th", { style: { padding: '0 2px 8px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)' } }, "C"),
                                            React.createElement("th", { style: { padding: '0 2px 8px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)' } }, "S")))))),
                                    React.createElement("tbody", null,
                                        React.createElement("tr", null,
                                            consoleCatalog.map(con => {
                                                const counts = getPlayerInventoryCounts(player, con.consoleName, con.gameName);
                                                return (React.createElement(React.Fragment, { key: con.id },
                                                    React.createElement("td", { style: { padding: '8px 2px', textAlign: 'center', borderTop: '1px solid var(--bord2)', opacity: counts.console ? 1 : .25 } },
                                                        React.createElement("strong", null, counts.console || '–')),
                                                    React.createElement("td", { style: { padding: '8px 2px', textAlign: 'center', borderTop: '1px solid var(--bord2)', opacity: counts.controller ? 1 : .25 } },
                                                        React.createElement("strong", null, counts.controller || '–')),
                                                    React.createElement("td", { style: { padding: '8px 2px', textAlign: 'center', borderTop: '1px solid var(--bord2)', opacity: counts.game ? 1 : .25 } },
                                                        React.createElement("strong", null, counts.game || '–'))));
                                            }),
                                            React.createElement("td", { style: { padding: '8px 2px', textAlign: 'center', borderTop: '1px solid var(--bord2)' } },
                                                React.createElement("strong", null, tvCount)))))))));
                }),
                !players.length && React.createElement("div", { style: { textAlign: 'center', padding: 24, color: 'var(--muted)' } }, "Noch keine Personen angelegt."))),
        editPlayer && (React.createElement(Modal, { title: editPlayer.id && data.players.some(p => String(p.id) === String(editPlayer.id)) ? '✎ Spieler bearbeiten' : '+ Spieler anlegen', confirmLabel: "Speichern", onCancel: () => setEditPlayer(null), onConfirm: savePlayer, maxWidth: 1200 },
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 180px', gap: 12, marginBottom: 16 } },
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Vorname"),
                    React.createElement("input", { type: "text", value: editPlayer.firstName, onChange: e => setEditPlayer(p => ({ ...p, firstName: e.target.value })), style: { marginTop: 4 } })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Nachname"),
                    React.createElement("input", { type: "text", value: editPlayer.lastName, onChange: e => setEditPlayer(p => ({ ...p, lastName: e.target.value })), style: { marginTop: 4 } })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "Spitzname"),
                    React.createElement("input", { type: "text", value: editPlayer.nickname || '', onChange: e => setEditPlayer(p => ({ ...p, nickname: e.target.value })), style: { marginTop: 4 } })),
                React.createElement("div", null,
                    React.createElement("div", { className: "fp-player-label" }, "\u00DC/U18"),
                    React.createElement("select", { value: editPlayer.ageGroup, onChange: e => setEditPlayer(p => ({ ...p, ageGroup: e.target.value })), style: { marginTop: 4 } }, AGE_OPTIONS.map(opt => React.createElement("option", { key: opt.value, value: opt.value }, opt.label))))),
            React.createElement("div", { className: "sep", style: { margin: '10px 0 14px' } }),
            React.createElement("div", { style: { fontFamily: 'var(--fd)', fontSize: 11, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 } }, "Vorhandenes Inventar"),
            React.createElement("div", { style: { overflowX: 'auto' } },
                React.createElement("table", { style: { width: '100%', minWidth: Math.max(720, consoleCatalog.length * 126 + 110), tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid var(--bord)', borderRadius: 8, overflow: 'hidden' } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: 'var(--card2)' } },
                            consoleCatalog.map(con => React.createElement("th", { key: `${con.id}_top`, colSpan: 3, style: { padding: '10px 4px 6px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--bord)' } }, con.consoleName)),
                            React.createElement("th", { rowSpan: 2, style: { width: 72, padding: '10px 4px 6px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--bord)' } }, "TV")),
                        React.createElement("tr", { style: { background: 'var(--card2)' } }, consoleCatalog.map(con => (React.createElement(React.Fragment, { key: `${con.id}_sub` },
                            React.createElement("th", { style: { padding: '0 2px 8px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', borderBottom: '1px solid var(--bord)' } }, "K"),
                            React.createElement("th", { style: { padding: '0 2px 8px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', borderBottom: '1px solid var(--bord)' } }, "C"),
                            React.createElement("th", { style: { padding: '0 2px 8px', textAlign: 'center', fontFamily: 'var(--fd)', fontSize: 9, color: 'var(--muted)', borderBottom: '1px solid var(--bord)' } }, "S")))))),
                    React.createElement("tbody", null,
                        React.createElement("tr", null,
                            consoleCatalog.map(con => {
                                const counts = getPlayerInventoryCounts(editPlayer, con.consoleName, con.gameName);
                                return (React.createElement(React.Fragment, { key: con.id },
                                    React.createElement("td", { style: { padding: '8px 4px', textAlign: 'center' } },
                                        React.createElement("input", { type: "number", min: "0", step: "1", value: counts.console, onChange: e => updateInventory(con.consoleName, con.gameName, 'console', e.target.value), style: { width: 52, minWidth: 52, padding: '6px 2px', textAlign: 'center' } })),
                                    React.createElement("td", { style: { padding: '8px 4px', textAlign: 'center' } },
                                        React.createElement("input", { type: "number", min: "0", step: "1", value: counts.controller, onChange: e => updateInventory(con.consoleName, con.gameName, 'controller', e.target.value), style: { width: 52, minWidth: 52, padding: '6px 2px', textAlign: 'center' } })),
                                    React.createElement("td", { style: { padding: '8px 4px', textAlign: 'center' } },
                                        React.createElement("input", { type: "number", min: "0", step: "1", value: counts.game, onChange: e => updateInventory(con.consoleName, con.gameName, 'game', e.target.value), style: { width: 52, minWidth: 52, padding: '6px 2px', textAlign: 'center' } }))));
                            }),
                            React.createElement("td", { style: { padding: '8px 4px', textAlign: 'center' } },
                                React.createElement("input", { type: "number", min: "0", step: "1", value: getPlayerTvCount(editPlayer), onChange: e => updateInventory('', '', 'tv', e.target.value), style: { width: 56, minWidth: 56, padding: '6px 2px', textAlign: 'center' } })))))),
            React.createElement("div", { className: "muted text-sm", style: { marginTop: 8 } }, "K = Konsole \u00B7 C = Controller \u00B7 S = Spiel. Konsolen, Controller und Spiele werden automatisch aus \u201EKonsolen & Modi\u201C \u00FCbernommen.")))));
}
// ── Passwort Tab (under Matchmaking) ──────────────────────────────────────────
function PasswortTab({ password, setPassword }) {
    const [input, setInput] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState('');
    const [oldPw, setOldPw] = useState('');
    function save() {
        if (password && oldPw !== password) {
            setMsg('Altes Passwort falsch.');
            return;
        }
        if (input.length < 4) {
            setMsg('Mindestens 4 Zeichen.');
            return;
        }
        if (input !== confirm) {
            setMsg('Passwörter stimmen nicht überein.');
            return;
        }
        setPassword(input);
        setInput('');
        setConfirm('');
        setOldPw('');
        setMsg('✓ Passwort gesetzt!');
    }
    function clear() {
        if (password && oldPw !== password) {
            setMsg('Altes Passwort falsch.');
            return;
        }
        setPassword('');
        setInput('');
        setConfirm('');
        setOldPw('');
        setMsg('✓ Passwort entfernt.');
    }
    return (React.createElement("div", { className: "card", style: { maxWidth: 420 } },
        React.createElement("div", { className: "card-hdr" },
            React.createElement("span", { className: "ctitle" }, "\uD83D\uDD12 Plan-Passwort")),
        React.createElement("div", { style: { color: 'var(--ds)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 } },
            "Wenn ein Passwort gesetzt ist, wird dieses beim Generieren und Zur\u00FCcksetzen des Spielplans abgefragt.",
            password ? React.createElement(React.Fragment, null,
                React.createElement("br", null),
                React.createElement("span", { style: { color: 'var(--green)', fontWeight: 700 } }, "\u2713 Passwort ist aktiv gesetzt.")) : React.createElement(React.Fragment, null,
                React.createElement("br", null),
                React.createElement("span", { style: { color: 'var(--muted)' } }, "Aktuell kein Passwort gesetzt."))),
        password && (React.createElement("div", { style: { marginBottom: 12 } },
            React.createElement("div", { className: "fp-player-label" }, "Aktuelles Passwort"),
            React.createElement("input", { type: "password", value: oldPw, onChange: e => setOldPw(e.target.value), placeholder: "Aktuelles Passwort eingeben", style: { marginTop: 4 } }))),
        React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement("div", { className: "fp-player-label" }, "Neues Passwort"),
            React.createElement("input", { type: "password", value: input, onChange: e => setInput(e.target.value), placeholder: "Neues Passwort (min. 4 Zeichen)", style: { marginTop: 4 } })),
        React.createElement("div", { style: { marginBottom: 14 } },
            React.createElement("div", { className: "fp-player-label" }, "Passwort best\u00E4tigen"),
            React.createElement("input", { type: "password", value: confirm, onChange: e => setConfirm(e.target.value), placeholder: "Wiederholen", style: { marginTop: 4 }, onKeyDown: e => e.key === 'Enter' && save() })),
        msg && React.createElement("div", { style: { marginBottom: 10, fontSize: 13, color: msg.startsWith('✓') ? 'var(--green)' : 'var(--red)', fontWeight: 600 } }, msg),
        React.createElement("div", { style: { display: 'flex', gap: 8 } },
            React.createElement("button", { className: "btn bp", onClick: save }, password ? 'Passwort ändern' : 'Passwort setzen'),
            password && React.createElement("button", { className: "btn bd", onClick: clear }, "Passwort entfernen"))));
}
// ── Save / Load ─────────────────────────────────────────────────────────────
// ── Organisation / Eventdaten ─────────────────────────────────────────────
const ORGA_PAYMENT_OPTIONS = [['offen', 'Offen'], ['bar', 'Bar'], ['überweisung', 'Überweisung'], ['paypal', 'PayPal']];
const ORGA_EVENT_MODES = ['Solo', 'Teams', 'Gast', 'Helfer'];
const ORGA_AGE_OPTIONS = [['', '–'], ['ue18', 'Über 18'], ['u18', 'Unter 18']];

export {
  Modal,
  MasterListEditor,
  PlayerPrefEditor,
  SpielerDatenTab,
  PasswortTab,
  ORGA_PAYMENT_OPTIONS,
  ORGA_EVENT_MODES,
  ORGA_AGE_OPTIONS,
};
