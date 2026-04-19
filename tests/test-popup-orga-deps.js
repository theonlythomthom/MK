const fs = require('fs');
const path = require('path');
const assert = require('assert');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'app-main.js'), 'utf8');

assert(
  src.includes('buildRankingPopupState(fps, schedule, results, stechenBlocks, stechenTimes, rankingPopupView, orgaData), [fps, schedule, results, stechenBlocks, stechenTimes, rankingPopupView, orgaData]'),
  'rankingPopupState muss orgaData in der useMemo-Abhängigkeit berücksichtigen.'
);

assert(
  src.includes('buildRankingPopupState(fps, schedule, results, stechenBlocks, stechenTimes, v, orgaData);') &&
  src.includes('}, [fps, schedule, results, stechenBlocks, stechenTimes, orgaData]);'),
  'Pinned Popup-States müssen orgaData in der useMemo-Abhängigkeit berücksichtigen.'
);

assert(
  src.includes('const state = buildRankingPopupState(fps, schedule, results, stechenBlocks, stechenTimes, initialView, orgaData);'),
  'Die initiale Rotationsansicht muss orgaData an buildRankingPopupState weiterreichen.'
);

console.log('OK test-popup-orga-deps');
