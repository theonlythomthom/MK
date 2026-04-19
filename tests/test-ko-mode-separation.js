
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {
  console,
  React: { useState(){}, useMemo(fn){ return fn(); }, useEffect(){}, useRef(){ return { current:null }; }, createElement(){ return null; } },
  document: { getElementById(){ return null; } },
  window: {},
};
vm.createContext(sandbox);
for (const rel of ['js/core.js', 'js/domain/schedule-domain.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'), sandbox, { filename: rel });
}

function assert(cond, msg){ if(!cond) throw new Error(msg); }

const consoles = sandbox.normalizeConsoles();
const switch2 = consoles.find(con => con.id === 'switch2');
assert(switch2, 'Switch 2 fehlt im Normalisierungsmodell');
const koMode = switch2.modes.find(mode => mode.id === 'sw2_ko');
assert(koMode, 'Switch-2-K.O.-Tour fehlt');
assert(koMode.trackDrawMode === 'route', 'K.O.-Tour muss als eigener Verlauf-Modus normalisiert werden');
assert(Array.isArray(koMode.drawModes) && koMode.drawModes.length === 1 && koMode.drawModes[0] === 'route', 'K.O.-Tour darf keine Cup-Auswahl anbieten');

const catalogKo = sandbox.resolveCatalogMode('switch2', koMode);
const routes = sandbox.getCatalogModeRoutes('switch2', catalogKo);
const cups = sandbox.getCatalogModeAllCups('switch2', catalogKo);
assert(routes.length > 0, 'K.O.-Tour braucht feste Verläufe');
assert(cups.length === 0, 'K.O.-Tour darf nicht in Cup-Logik aufgehen');

const drawn = sandbox.pickTrackForMode('switch2', koMode, {});
const routeNames = routes.map(route => route.name);
assert(routeNames.includes(drawn), 'K.O.-Tour muss einen K.O.-Verlauf statt eines Cups ziehen');

const fps = Array.from({ length: 24 }, (_, index) => ({ id: `fp_${index + 1}` }));
const savedSwitch2 = {
  id: 'switch2',
  name: 'Switch 2',
  game: 'Mario Kart World',
  emoji: '🟡',
  enabled: true,
  modes: switch2.modes.map(mode => ({
    ...mode,
    enabled: mode.id === 'sw2_ko'
  }))
};
const schedule = sandbox.buildSchedule(fps, [savedSwitch2], {});
assert(schedule.length === koMode.rounds, 'K.O.-Tour-Runden wurden nicht korrekt in den Spielplan übernommen');
assert(schedule.every(sess => sess.selectionKind === 'route'), 'Session-Auswahl muss als Verlauf markiert sein');
assert(schedule.every(sess => sess.groups.every(group => group.selectionKind === 'route')), 'Gruppen-Auswahl muss als Verlauf markiert sein');
assert(schedule.every(sess => sess.groups.every(group => routeNames.includes(group.track))), 'Im Spielplan dürfen bei K.O.-Tour nur K.O.-Verläufe auftauchen');

console.log('OK test-ko-mode-separation');
