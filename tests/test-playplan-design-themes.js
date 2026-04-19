
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
function textContent(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join('');
  return textContent(node.children) + textContent(node.props && node.props.children);
}

const fps = [
  { id: 'fp_1', teamName: '', players: [{ name: 'Mario' }] },
  { id: 'fp_2', teamName: '', players: [{ name: 'Luigi' }] },
];

const session = {
  id: 'sess_snes',
  round: 1,
  totalRounds: 2,
  consoleId: 'snes',
  consoleName: 'SNES',
  modeName: 'Grand Prix',
  groups: [
    { id: 'g1', fps: ['fp_1', 'fp_2'], teamMode: false, teamSize: 1, track: 'Marios Piste 1', points: [5, 0] },
    { id: 'g2', fps: ['fp_1', 'fp_2'], teamMode: false, teamSize: 1, track: 'Donut-Ebene 1', points: [5, 0] },
  ],
};

const tree = sandbox.ScheduleSessionCard({
  sess: session,
  fps,
  results: {},
  setResults(){},
  currentConsole: { id: 'snes', name: 'SNES' },
  order: 0,
});

let themedSession = false;
let trackLineFound = false;
let placementSelectFound = false;
const matchTree = sandbox.MatchCard({
  group: session.groups[0],
  idx: 0,
  fps,
  results: {},
  setResults(){},
});

walk(tree, (node) => {
  const cls = String(node?.props?.className || '');
  if (node.type === 'section' && cls.includes('schedule-session') && cls.includes('schedule-theme-snes')) {
    themedSession = true;
  }
  if (cls.includes('schedule-session-trackline') && /Marios Piste 1/.test(textContent(node))) {
    trackLineFound = true;
  }
});

walk(matchTree, (node) => {
  const cls = String(node?.props?.className || '');
  if (node.type === 'select' && cls.includes('placement-select')) {
    placementSelectFound = true;
  }
});

assert(themedSession, 'SNES-Session muss eine eigene Theme-Klasse im Spielplan bekommen');
assert(trackLineFound, 'Spielplan-Session muss eine sichtbare Strecken-Vorschau rendern');
assert(placementSelectFound, 'MatchCard muss Platzierungs-Selects mit Design-Klasse rendern');

console.log('OK test-playplan-design-themes');
