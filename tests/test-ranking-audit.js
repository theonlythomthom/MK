const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {
  console,
  parseStechenTimeObj: () => null,
  stechenPts: () => 0,
  isSolo: f => !String((f && f.teamName) || '').trim(),
  fpName: f => f.players?.[0]?.name || ('FP' + f.id),
  fpSub: f => '',
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/domain/ranking-domain.js'), 'utf8'), sandbox);

const {
  computeRankingCore,
  getGroupScoringAudit,
  normalizeResultsForSchedule,
} = sandbox;

function mk(id, teamName, name) {
  return { id, teamName, players: [{ name, nickname: '' }] };
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function deepEq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const fps = [
  mk(1, 'Alpha', 'A1'),
  mk(2, 'Alpha', 'A2'),
  mk(3, 'Beta', 'B1'),
  mk(4, 'Beta', 'B2'),
  mk(5, '', 'S1'),
  mk(6, '', 'S2'),
  mk(7, '', 'S3'),
  mk(8, '', 'S4'),
];

const schedule = [
  { consoleId: 'gc', consoleName: 'GameCube', consoleEmoji: 'G', groups: [
    { id: 'gc_r1_g0', fps: [1,2,3,4], teamMode: true, teamSize: 2, points: [5,5,0,0] }
  ]},
  { consoleId: 'wii', consoleName: 'Wii', consoleEmoji: 'W', groups: [
    { id: 'wii_r1_g0', fps: [5,6,7,8], teamMode: false, teamSize: 1, points: [5,3,1,0] },
    { id: 'wii_coin_r1_g0', fps: [1,2,3,4], teamMode: true, teamSize: 2, points: [5,5,0,0] }
  ]},
  { consoleId: 'switch2', consoleName: 'Switch 2', consoleEmoji: 'S', groups: [
    { id: 'sw2_team_r1_g0', fps: [1,2,3,4,5,6,7,8], teamMode: true, teamSize: 2, points: [5,5,3,3,1,1,0,0] }
  ]},
];

(function testModernTeamPlacements() {
  const results = {
    gc_r1_g0: { teamPlacements: { 0: 1, 1: 2 } },
    wii_r1_g0: { placements: { 5: 1, 6: 2, 7: 3, 8: 4 } },
    wii_coin_r1_g0: { teamPlacements: { 0: 2, 1: 1 } },
    sw2_team_r1_g0: { teamPlacements: { 0: 1, 1: 2, 2: 3, 3: 4 } },
  };
  const core = computeRankingCore(fps, schedule, results, [], {});
  assert(core.conPts.gc[1] === 5 && core.conPts.gc[2] === 5, 'GC winner team must get 5 each');
  assert(core.conPts.gc[3] === 0 && core.conPts.gc[4] === 0, 'GC loser team must get 0 each');
  assert(core.conPts.wii[5] === 5 && core.conPts.wii[6] === 3 && core.conPts.wii[7] === 1 && core.conPts.wii[8] === 0, 'Wii solo points wrong');
  assert(core.conPts.wii[3] === 5 && core.conPts.wii[4] === 5, 'Wii 2v2 winner team must score');
  assert(core.teamConPts.switch2.Alpha === 10, 'Switch2 team console points for Alpha wrong');
  assert(core.teamConPts.switch2.Beta === 6, 'Switch2 team console points for Beta wrong');
})();

(function testLegacyWinningTeamMigration() {
  const results = {
    gc_r1_g0: { winningTeam: 1 },
  };
  const normalized = normalizeResultsForSchedule(schedule, results);
  assert(deepEq(normalized.gc_r1_g0.teamPlacements, { 0: 2, 1: 1 }), 'Legacy winningTeam should migrate to teamPlacements');
  const core = computeRankingCore(fps, schedule, results, [], {});
  assert(core.conPts.gc[3] === 5 && core.conPts.gc[4] === 5, 'Legacy winningTeam should still score');
})();

(function testInvalidDuplicatePlacementsAreBlocked() {
  const group = { id: 'bad', fps: [5,6,7,8], teamMode: false, teamSize: 1, points: [5,3,1,0] };
  const audit = getGroupScoringAudit(group, { placements: { 5: 1, 6: 1, 7: 3, 8: 4 } });
  assert(audit.hasAnyPlacement === true, 'Audit should see entered placements');
  assert(audit.isScorable === false, 'Duplicate placements must not be scorable');
  assert(audit.issues.length > 0, 'Duplicate placements should create an issue');
})();

(function testShortPointSchemaFallsBackToZero() {
  const group = { id: 'short', fps: [5,6,7,8], teamMode: false, teamSize: 1, points: [5,3] };
  const audit = getGroupScoringAudit(group, { placements: { 5: 1, 6: 2, 7: 3, 8: 4 } });
  assert(audit.isScorable === true, 'Short point schema should still be scorable');
  assert(audit.awarded[7] === 0 && audit.awarded[8] === 0, 'Missing point slots should award 0');
  assert(audit.warnings.length > 0, 'Short point schema should warn');
})();

console.log('All ranking audit tests passed.');
