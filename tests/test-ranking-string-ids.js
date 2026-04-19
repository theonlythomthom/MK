
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {
  console,
  parseStechenTimeObj: v => {
    if (v == null) return null;
    const mins = Number(v.minutes) || 0;
    const secs = Number(v.seconds) || 0;
    return mins * 60 + secs;
  },
  stechenPts: rank => ({1:3, 2:2, 3:1}[rank] || 0),
  isSolo: f => !String((f && f.teamName) || '').trim(),
  fpName: f => f.players?.[0]?.name || ('FP' + f.id),
  fpSub: () => '',
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/domain/ranking-domain.js'), 'utf8'), sandbox);

const { computeRankingCore } = sandbox;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function mk(id, teamName, name) {
  return { id, teamName, players: [{ name, nickname: '' }] };
}

const fps = [
  mk('fp_1001', '', 'Solo A'),
  mk('fp_1002', '', 'Solo B'),
  mk('fp_1003', 'Team Rot', 'Rot 1'),
  mk('fp_1004', 'Team Rot', 'Rot 2'),
  mk('fp_1005', 'Team Blau', 'Blau 1'),
  mk('fp_1006', 'Team Blau', 'Blau 2'),
];

const schedule = [
  {
    consoleId: 'wii',
    consoleName: 'Wii',
    consoleEmoji: '🎮',
    groups: [
      { id: 'g_solo', fps: ['fp_1001', 'fp_1002'], teamMode: false, teamSize: 1, points: [7, 3] },
      { id: 'g_team', fps: ['fp_1003', 'fp_1004', 'fp_1005', 'fp_1006'], teamMode: true, teamSize: 2, points: [5, 5, 2, 2] },
    ]
  }
];

const results = {
  g_solo: { placements: { fp_1001: 1, fp_1002: 2 } },
  g_team: { teamPlacements: { 0: 1, 1: 2 } },
};

const stechenBlocks = [
  { id: 'gesamt_demo', entries: [{ key: 'sfp_1001' }, { key: 'sfp_1002' }, { key: 'tTeam Rot' }] },
  { id: 'solo_demo', entries: [{ key: 'sfp_1001' }, { key: 'sfp_1002' }] },
  { id: 'con_wii', entries: [{ key: 'sfp_1001' }, { key: 'sfp_1002' }] },
];
const stechenTimes = {
  gesamt_demo: { 'sfp_1001': { minutes: 0, seconds: 10 }, 'sfp_1002': { minutes: 0, seconds: 20 }, 'tTeam Rot': { minutes: 0, seconds: 30 } },
  solo_demo: { 'sfp_1001': { minutes: 0, seconds: 11 }, 'sfp_1002': { minutes: 0, seconds: 21 } },
  con_wii: { 'sfp_1001': { minutes: 0, seconds: 12 }, 'sfp_1002': { minutes: 0, seconds: 22 } },
};

const core = computeRankingCore(fps, schedule, results, stechenBlocks, stechenTimes);

const soloA = core.gesamtEntries.find(e => e.type === 'solo' && e.fp?.id === 'fp_1001');
const soloB = core.gesamtEntries.find(e => e.type === 'solo' && e.fp?.id === 'fp_1002');
const teamRot = core.teamRank.find(e => e.t === 'Team Rot');
const conWii = core.conPts['wii'] || {};

assert(soloA && soloA.pts === 10, 'Solo A sollte 7 Grundpunkte + 3 Stechenpunkte haben.');
assert(soloB && soloB.pts === 5, 'Solo B sollte 3 Grundpunkte + 2 Stechenpunkte haben.');
assert(teamRot && teamRot.pts === 10, 'Team Rot sollte 10 Punkte aus dem Teammatch behalten.');
assert(conWii['fp_1001'] === 10, 'Konsole Wii sollte String-ID fp_1001 korrekt führen.');
assert(conWii['fp_1002'] === 5, 'Konsole Wii sollte String-ID fp_1002 korrekt führen.');

console.log('OK: String-ID-Rankingpfad inklusive Stechen bleibt vollständig erhalten.');
