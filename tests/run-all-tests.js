const { spawnSync } = require('child_process');
const path = require('path');

const tests = [
  'test-ranking-audit.js',
  'test-ranking-string-ids.js',
  'test-time-trial.js',
  'test-time-trial-live.js',
  'test-mode-points.js',
  'test-team-scoring.js',
  'test-popup-escaping.js',
  'test-catalog-track-refs.js',
  'test-ko-mode-separation.js',
  'test-ko-routes-data.js',
  'test-playplan-compact-rendering.js',
  'test-time-trial-matchcard-switch2.js',
  'test-normalize-consoles-migration.js',
  'test-index-offline-vendor.js',
  'test-reactdom-mount-compat.js',
  'test-popup-orga-deps.js',
  'test-mode-array-dedup.js',
  'test-playplan-design-themes.js',
];

let failed = false;
for (const testFile of tests) {
  const res = spawnSync(process.execPath, [path.join(__dirname, testFile)], { stdio: 'inherit' });
  if (res.status !== 0) {
    failed = true;
    break;
  }
}
if (failed) {
  process.exit(1);
}
console.log('\nAlle Audit-Tests erfolgreich.');
