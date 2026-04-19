
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {
  console,
  React: { useState: () => {}, useMemo: fn => fn(), useEffect: () => {}, useRef: () => ({ current: null }) },
  document: { getElementById: () => null },
  window: {},
  parseStechenTimeObj: () => null,
  stechenPts: () => 0,
  isSolo: f => !String((f && f.teamName) || '').trim(),
  fpName: f => f.players?.[0]?.name || ('FP' + f.id),
  fpSub: () => '',
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/domain/ranking-domain.js'), 'utf8'), sandbox);

const { parseTimeFieldEntry, getGroupScoringAudit } = sandbox;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(Math.abs(parseTimeFieldEntry({ mm: '1', ss: '2', ms: '3' }) - 62.3) < 0.000001, 'Variable Zeitstellen müssen wie eingegeben gewertet werden');

const group = {
  id: 'tt_live_1',
  fps: ['fp_a', 'fp_b', 'fp_c'],
  teamMode: false,
  teamSize: 1,
  timeTrial: true,
  attempts: 3,
  modeId: 'sw2_time',
  modeName: 'Zeitfahren',
  points: [5, 3, 1],
};

let audit = getGroupScoringAudit(group, {
  timeTrials: {
    fp_a: [{ mm: '1', ss: '2', ms: '3' }],
    fp_b: [],
    fp_c: [],
  }
});
assert(audit.isScorable, 'Schon eine eingetragene Zeit muss live gewertet werden');
assert(audit.normalizedPlacements.fp_a === 1, 'Einziger Fahrer mit Zeit muss Platz 1 haben');
assert(audit.awarded.fp_a === 5, 'Einziger Fahrer mit Zeit muss Platz-1-Punkte bekommen');
assert(audit.awarded.fp_b == null && audit.awarded.fp_c == null, 'Leere Fahrerplätze dürfen nicht gewertet werden');

audit = getGroupScoringAudit(group, {
  timeTrials: {
    fp_a: [{ mm: '1', ss: '5', ms: '1' }],
    fp_b: [{ mm: '1', ss: '4', ms: '9' }],
    fp_c: [{ mm: '1', ss: '6', ms: '0' }],
  }
});
assert(audit.isScorable, 'Drei erste Versuche müssen live gewertet werden');
assert(audit.normalizedPlacements.fp_b === 1, 'Schnellster erster Versuch muss Platz 1 sein');
assert(audit.normalizedPlacements.fp_a === 2, 'Zweitbeste Zeit muss Platz 2 sein');
assert(audit.normalizedPlacements.fp_c === 3, 'Langsamste Zeit muss Platz 3 sein');
assert(audit.awarded.fp_b === 5 && audit.awarded.fp_a === 3 && audit.awarded.fp_c === 1, 'Live-Punktevergabe falsch');

console.log('OK test-time-trial-live');
