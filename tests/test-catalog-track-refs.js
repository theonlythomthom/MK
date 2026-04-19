
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

const con = sandbox.findCatalogConsole('switch');
const gp = sandbox.resolveCatalogMode(con, 'grand_prix');
const time = sandbox.resolveCatalogMode(con, 'zeitfahren');
assert(gp && time, 'Grand Prix und Zeitfahren müssen im Katalog vorhanden sein.');
assert(Array.isArray(time.cups) && time.cups.length === 0, 'Zeitfahren darf keine eigenen Cup-Dubletten enthalten.');
const timeCups = sandbox.getCatalogModeAllCups('switch', time);
assert(timeCups.length === gp.cups.length, 'Zeitfahren muss auf alle Grand-Prix-Cups verweisen.');
console.log('OK test-catalog-track-refs');
