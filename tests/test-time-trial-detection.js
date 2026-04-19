
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {
  console,
  React: { useState(){}, useMemo(fn){ return fn(); }, useEffect(){}, useRef(){ return { current:null }; }, createElement(){ return null; } },
  document: { getElementById(){ return null; } },
  window: {},
  isSolo: f => !String((f && f.teamName) || '').trim(),
  fpName: f => f.players?.[0]?.name || ('FP' + f.id),
  fpSub: () => '',
  parseStechenTimeObj: () => null,
  stechenPts: () => 0,
};
vm.createContext(sandbox);
for (const rel of ['js/core.js', 'js/domain/ranking-domain.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'), sandbox, { filename: rel });
}
function assert(c, m){ if(!c) throw new Error(m); }
assert(sandbox.isTimeTrialMode({ name: 'Zeitrennen' }) === true, 'Zeitrennen wird nicht erkannt');
assert(sandbox.isTimeTrialMode({ timeTrial: true }) === true, 'timeTrial-Flag wird nicht erkannt');
const audit = sandbox.getGroupScoringAudit({ id:'g1', fps:['fp_1','fp_2'], timeTrial:true, attempts:3, teamMode:false, points:[5,3] }, { timeTrials:{ fp_1:[{mm:'1',ss:'02',ms:'123'}], fp_2:[{mm:'1',ss:'05',ms:'000'}] } });
assert(audit.awarded['fp_1'] === 5, 'fp_1');
assert(audit.awarded['fp_2'] === 3, 'fp_2');
console.log('OK test-time-trial-detection');
