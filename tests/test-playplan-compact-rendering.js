
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
    createElement(){ return null; }
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

function assert(cond, msg){ if(!cond) throw new Error(msg); }

assert(typeof sandbox.shouldUseCompactPlacementCard === 'function', 'Render-Helfer für kompakte Karten fehlt');

const timeTrialGroup = {
  fps: Array.from({ length: 24 }, (_, index) => `fp_${index + 1}`),
  teamMode: false,
  timeTrial: true,
  modeName: 'Zeitfahren'
};
const teamGroup = {
  fps: Array.from({ length: 16 }, (_, index) => `fp_${index + 1}`),
  teamMode: true,
  teamSize: 2,
  timeTrial: false,
  modeName: 'Teammatch'
};
const soloLargeGroup = {
  fps: Array.from({ length: 16 }, (_, index) => `fp_${index + 1}`),
  teamMode: false,
  timeTrial: false,
  modeName: 'Versus'
};

assert(sandbox.shouldUseCompactPlacementCard(timeTrialGroup) === false, 'Zeitrennen mit vielen Fahrerplätzen darf nicht auf den kompakten Select-Renderer fallen');
assert(sandbox.shouldUseCompactPlacementCard(teamGroup) === false, 'Team-Modi mit vielen Fahrerplätzen dürfen nicht auf den Solo-Kompaktrenderer fallen');
assert(sandbox.shouldUseCompactPlacementCard(soloLargeGroup) === true, 'Große Solo-Gruppen ohne Zeitrennen sollen kompakt dargestellt werden');

console.log('OK test-playplan-compact-rendering');
