
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
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/core.js'), 'utf8'), sandbox);

function assert(cond, msg){ if(!cond) throw new Error(msg); }

const cons = sandbox.normalizeConsoles([{ id:'gc', name:'GC', game:'Test', emoji:'🎮', enabled:true, modes:[{ id:'gc_team_custom', name:'Team', af:['2v2'], sf:'2v2', rounds:1, enabled:true, points:[7,7,2,2] }] }]);
assert(cons[0].id === 'gc', 'Explizit übergebene Konsolen sollen bei der Normalisierung zuerst stehen.');
assert(cons[0].modes[0].scoringMode === 'team', 'Symmetrische Team-Punkte müssen bei Custom-Modes als Teamwertung erkannt werden.');
assert(cons.slice(1).every(con => con.enabled === false), 'Nicht übergebene Standard-Konsolen sollen im Sparse-Merge deaktiviert werden.');
console.log('OK test-normalize-consoles-migration');
