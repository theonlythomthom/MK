
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {
  console,
  React: { useState: () => {}, useMemo: fn => fn(), useEffect: () => {}, useRef: () => ({ current: null }) },
  document: { getElementById: () => null },
  parseStechenTimeObj: () => null,
  stechenPts: () => 0,
  isSolo: f => !String((f && f.teamName) || '').trim(),
  fpName: f => f.players?.[0]?.name || ('FP' + f.id),
  fpSub: () => '',
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/domain/ranking-domain.js'), 'utf8'), sandbox);

const { getGroupScoringAudit } = sandbox;
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const teamGroupDirect = {
  id: 'g_team_direct',
  fps: ['fp1', 'fp2', 'fp3', 'fp4'],
  teamMode: true,
  teamSize: 2,
  scoringMode: 'team',
  points: [6, 2]
};
const teamGroupIndividual = {
  id: 'g_team_individual',
  fps: ['fp1', 'fp2', 'fp3', 'fp4'],
  teamMode: true,
  teamSize: 2,
  scoringMode: 'individual',
  points: [9, 7, 4, 2]
};
const result = { teamPlacements: { 0: 1, 1: 2 } };

(function testDirectTeamPoints() {
  const audit = getGroupScoringAudit(teamGroupDirect, result);
  assert(audit.isScorable, 'Direkte Teamwertung muss scorable sein.');
  assert(audit.awarded.fp1 === 6 && audit.awarded.fp2 === 6, 'Siegerteam muss direkte Team-Punkte je Fahrer erhalten.');
  assert(audit.awarded.fp3 === 2 && audit.awarded.fp4 === 2, 'Verliererteam muss direkte Team-Punkte je Fahrer erhalten.');
})();

(function testIndividualizedTeamPoints() {
  const audit = getGroupScoringAudit(teamGroupIndividual, result);
  assert(audit.isScorable, 'Einzelfahrerwertung im Teammatch muss scorable sein.');
  assert(audit.awarded.fp1 === 8 && audit.awarded.fp2 === 8, 'Siegerteam muss Durchschnitt aus Platz 1+2 erhalten.');
  assert(audit.awarded.fp3 === 3 && audit.awarded.fp4 === 3, 'Verliererteam muss Durchschnitt aus Platz 3+4 erhalten.');
})();

console.log('OK test-team-scoring');
