
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
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/domain/schedule-domain.js'), 'utf8'), sandbox);

const { getGroupScoringAudit, buildSchedule, normalizeConsoles } = sandbox;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function mk(id, name) {
  return { id, teamName: '', players: [{ name, nickname: '' }] };
}

const fps = [mk('fp_a', 'A'), mk('fp_b', 'B'), mk('fp_c', 'C')];
const group = {
  id: 'tt_1',
  fps: ['fp_a', 'fp_b', 'fp_c'],
  teamMode: false,
  teamSize: 1,
  timeTrial: true,
  attempts: 2,
  modeId: 'sw2_time',
  modeName: 'Zeitfahren',
  points: [5, 3, 1],
};

const result = {
  timeTrials: {
    fp_a: [{ mm: '01', ss: '10', ms: '500' }, { mm: '01', ss: '09', ms: '100' }],
    fp_b: [{ mm: '01', ss: '08', ms: '900' }, { mm: '01', ss: '10', ms: '000' }],
    fp_c: [{ mm: '01', ss: '15', ms: '250' }, { mm: '01', ss: '14', ms: '900' }],
  }
};

const audit = getGroupScoringAudit(group, result);
assert(audit.isScorable, 'Zeitfahren-Audit muss scorable sein');
assert(audit.normalizedPlacements.fp_b === 1, 'Schnellste Bestzeit muss Platz 1 sein');
assert(audit.normalizedPlacements.fp_a === 2, 'Zweitbeste Bestzeit muss Platz 2 sein');
assert(audit.normalizedPlacements.fp_c === 3, 'Langsamste Bestzeit muss Platz 3 sein');
assert(audit.awarded.fp_b === 5 && audit.awarded.fp_a === 3 && audit.awarded.fp_c === 1, 'Zeitfahren-Punkte falsch verteilt');

const consoles = normalizeConsoles([{
  id: 'switch2',
  name: 'Switch 2',
  game: 'Mario Kart World (2025)',
  emoji: '🔥',
  enabled: true,
  modes: [{
    id: 'sw2_time_custom',
    name: 'Zeitfahren',
    desc: 'Test',
    af: ['3ffa'],
    sf: '3ffa',
    rounds: 1,
    enabled: true,
    attempts: 3,
    points: [5,3,1]
  }]
}]);

const schedule = buildSchedule(fps, consoles, {});
const schedGroup = schedule[0].groups[0];
assert(schedGroup.timeTrial === true, 'Zeitfahren muss im Spielplan als timeTrial markiert sein');
assert(schedGroup.attempts === 3, 'Versuchsanzahl muss in den Spielplan übernommen werden');

console.log('OK test-time-trial');
