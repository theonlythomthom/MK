
const fs = require('fs');
const vm = require('vm');
const path = require('path');

function h(type, props, ...children) {
  return { type, props: props || {}, children: children.flat() };
}

const sandbox = {
  console,
  React: {
    Fragment: Symbol('Fragment'),
    useState(initial){ return [initial, () => {}]; },
    useMemo(fn){ return fn(); },
    useEffect(){},
    useRef(){ return { current: null }; },
    createElement: h,
  },
  document: { getElementById(){ return null; } },
  window: {},
  exportSchedulePdf(){},
  chunkArray(arr){ return [arr]; },
  pickRandom(arr){ return Array.isArray(arr) && arr.length ? arr[0] : null; },
  stechenPts(){ return 0; },
  parseStechenTimeObj(){ return null; },
  isSolo(fp){ return !String((fp && fp.teamName) || '').trim(); },
  fpName(fp){ return fp?.players?.[0]?.name || fp?.id || '?'; },
  fpShort(fp){ return fp?.players?.[0]?.name || fp?.id || '?'; },
  fpLines(){ return []; },
  computeRankingCore(){ return { gesamtEntries: [], teamRank: [], conPts: {} }; },
  STECHEN_PTS: [5,3,1,0],
  TRACKS: {},
  requestAnimationFrame(){},
  cancelAnimationFrame(){},
  confirm(){ return true; },
  alert(){},
};
vm.createContext(sandbox);
for (const rel of ['js/core.js', 'js/domain/ranking-domain.js', 'js/ui/tournament-tabs.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'), sandbox, { filename: rel });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function walk(node, visit) {
  if (node == null || typeof node === 'boolean') return;
  if (Array.isArray(node)) {
    node.forEach(child => walk(child, visit));
    return;
  }
  if (typeof node === 'object') {
    visit(node);
    if (node.children) node.children.forEach(child => walk(child, visit));
    if (node.props && node.props.children) walk(node.props.children, visit);
  }
}

const fps = Array.from({ length: 24 }, (_, index) => ({
  id: `fp_${index + 1}`,
  teamName: '',
  players: [{ name: `Fahrer ${index + 1}`, nickname: '' }],
}));

const group = {
  id: 'sw2_time_ui',
  fps: fps.map(fp => fp.id),
  teamMode: false,
  teamSize: 1,
  timeTrial: true,
  attempts: 3,
  modeId: 'sw2_time',
  modeName: 'Zeitfahren',
  track: 'Mario Bros.-Piste',
  points: [15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
};

const tree = sandbox.MatchCard({
  group,
  idx: 0,
  fps,
  results: {},
  setResults(){},
});

let inputCount = 0;
walk(tree, (node) => {
  if (node.type === 'input') inputCount += 1;
});

assert(inputCount === 24 * 3 * 3, 'Switch-2-Zeitrennen muss pro Fahrer und Versuch alle Zeitfelder rendern');

console.log('OK test-time-trial-matchcard-switch2');
