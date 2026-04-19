
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
for (const rel of ['js/core.js', 'js/domain/schedule-domain.js', 'js/domain/ranking-domain.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'), sandbox, { filename: rel });
}
function assert(c, m){ if(!c) throw new Error(m); }

const consoles = [{
  id:'sw2',
  name:'Switch 2',
  emoji:'🔥',
  enabled:true,
  modes:[{
    id:'custom_tt',
    name:'Zeitrennen',
    sf:'3ffa',
    rounds:1,
    enabled:true,
    attempts:3,
    points:[5,1,0]
  }]
}];

const staleSchedule = [{
  id:'custom_tt_r1',
  consoleId:'sw2',
  consoleName:'Switch 2',
  consoleEmoji:'🔥',
  modeId:'custom_tt',
  modeName:'Rennen',
  round:1,
  totalRounds:1,
  fmt:{ label:'3 Spieler', pc:3, team:false, ts:1, teamCount:3 },
  groups:[{
    id:'custom_tt_r1_g0',
    fps:['fp_1','fp_2','fp_3'],
    teamMode:false,
    teamSize:1,
    scoringMode:'individual',
    pointSlotCount:3,
    points:[5,3,1],
    timeTrial:false,
    attempts:1,
    modeId:'custom_tt',
    modeName:'Rennen',
    track:'Rainbow Road'
  }]
}];

const normalized = sandbox.normalizeScheduleForConsoles(staleSchedule, consoles);
assert(normalized !== staleSchedule, 'Schedule wurde nicht aktualisiert');
const group = normalized[0].groups[0];
assert(group.timeTrial === true, 'Zeitrennen wurde im bestehenden Spielplan nicht auf Zeitmodus umgestellt');
assert(group.attempts === 3, 'Versuchsanzahl wurde nicht aus Spiele & Modi übernommen');
assert(group.modeName === 'Zeitrennen', 'Modusname im Spielplan wurde nicht synchronisiert');

const audit = sandbox.getGroupScoringAudit(group, {
  timeTrials: {
    fp_1: [{ mm:'1', ss:'02', ms:'123' }],
    fp_2: [{ mm:'1', ss:'05', ms:'000' }],
    fp_3: []
  }
});
assert(audit.awarded.fp_1 === 5, 'Beste Zeit wird nach Spielplan-Sync nicht gewertet');
assert(audit.awarded.fp_2 === 1, 'Zweitbeste Zeit wird nach Spielplan-Sync nicht gewertet');
assert(audit.awarded.fp_3 == null || audit.awarded.fp_3 === 0, 'Leere Zeit darf nicht in die Wertung kommen');

console.log('OK test-time-trial-schedule-sync');
