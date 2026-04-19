
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = { console, React: { useState: () => {}, useMemo: fn => fn(), useEffect: () => {}, useRef: () => ({ current: null }) }, document: { getElementById: () => null } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/domain/schedule-domain.js'), 'utf8'), sandbox);

const { normalizeConsoles, buildSchedule } = sandbox;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const fps = [
  { id: 'fp1', teamName: 'Rot', players: [{ name: 'A', nickname: '' }] },
  { id: 'fp2', teamName: 'Rot', players: [{ name: 'B', nickname: '' }] },
  { id: 'fp3', teamName: 'Blau', players: [{ name: 'C', nickname: '' }] },
  { id: 'fp4', teamName: 'Blau', players: [{ name: 'D', nickname: '' }] },
];

(function testTeamModeDefaultsCollapseToTeamFieldsWhenSymmetric() {
  const consoles = normalizeConsoles([{
    id: 'gc',
    name: 'GC',
    game: 'Test',
    emoji: '🎮',
    enabled: true,
    modes: [{
      id: 'gc_team',
      name: 'Teammatch',
      desc: 'Test',
      af: ['2v2'],
      sf: '2v2',
      rounds: 1,
      enabled: true,
      points: [7, 7, 2, 2]
    }]
  }]);
  const mode = consoles[0].modes[0];
  assert(mode.scoringMode === 'team', 'Symmetrische 2v2-Punkte sollten als Teamwertung erkannt werden.');
  assert(JSON.stringify(mode.points) === JSON.stringify([7, 2]), 'Symmetrische Team-Punkte sollten auf zwei Felder kollabieren.');
  const schedule = buildSchedule(fps, consoles, {});
  const group = schedule[0].groups[0];
  assert(group.scoringMode === 'team', 'Teamwertung muss in den Spielplan übernommen werden.');
  assert(group.pointSlotCount === 2, '2v2-Teamwertung braucht zwei Punktefelder.');
})();

(function testExplicitIndividualTeamScoringKeepsPlayerFieldCount() {
  const consoles = normalizeConsoles([{
    id: 'gc',
    name: 'GC',
    game: 'Test',
    emoji: '🎮',
    enabled: true,
    modes: [{
      id: 'gc_team_ind',
      name: 'Teammatch',
      desc: 'Test',
      af: ['2v2'],
      sf: '2v2',
      rounds: 1,
      enabled: true,
      scoringMode: 'individual',
      points: [9, 7]
    }]
  }]);
  const mode = consoles[0].modes[0];
  assert(mode.scoringMode === 'individual', 'Explizite Einzelwertung muss erhalten bleiben.');
  assert(JSON.stringify(mode.points) === JSON.stringify([9, 9, 7, 7]), 'Team-Punkte müssen für Einzelfahrerwertung auf Fahrerfelder expandieren.');
})();

console.log('OK test-mode-points');
