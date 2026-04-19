
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {
  console,
  React: {
    useState(){ return [null, () => {}]; },
    useMemo(fn){ return fn(); },
    useEffect(){},
    useRef(){ return { current: null }; },
    createElement(){ return null; },
  },
  document: { getElementById(){ return null; } },
  window: {},
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/core.js'), 'utf8'), sandbox);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const routes = sandbox.getCatalogModeRoutes('switch2', 'ko_tour');
const names = routes.map(route => route.name);
const expectedNames = [
  'Gold-Rallye',
  'Eis-Rallye',
  'Mond-Rallye',
  'Stachel-Rallye',
  'Kirsch-Rallye',
  'Eichel-Rallye',
  'Wolken-Rallye',
  'Herz-Rallye',
];

assert(routes.length === 8, 'Switch-2-K.O.-Tour muss 8 Rallyes enthalten');
assert(JSON.stringify(names) === JSON.stringify(expectedNames), 'K.O.-Tour-Rallye-Namen stimmen nicht');

const gold = routes[0];
assert(Array.isArray(gold.tracks) && gold.tracks.length === 6, 'Gold-Rallye muss 6 Etappen enthalten');
assert(
  sandbox.getRouteSequenceText(gold) === 'Staubtrockene Hügel → Mario Bros.-Piste → Choco Mountain → Kuhmuh-Weide → Mario Circuit → Acorn Heights',
  'Gold-Rallye-Streckenfolge stimmt nicht'
);

console.log('OK test-ko-routes-data');
