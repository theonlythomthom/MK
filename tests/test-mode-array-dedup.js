const fs = require('fs');
const path = require('path');
const assert = require('assert');

global.window = global;
global.document = { getElementById: () => null };
global.React = { useState(){}, useMemo(){}, useEffect(){}, useRef(){}, createElement(){} };

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
const api = new Function(src + '; return { DEFAULT_CONSOLES };')();

for (const con of api.DEFAULT_CONSOLES) {
  for (const mode of con.modes || []) {
    const af = Array.isArray(mode.af) ? mode.af : [];
    const drawModes = Array.isArray(mode.drawModes) ? mode.drawModes : [];
    const refModeIds = Array.isArray(mode.refModeIds) ? mode.refModeIds : [];
    assert.strictEqual(new Set(af).size, af.length, `Doppelte Format-IDs in ${con.id}/${mode.id}`);
    assert.strictEqual(new Set(drawModes).size, drawModes.length, `Doppelte Draw-Mode-IDs in ${con.id}/${mode.id}`);
    assert.strictEqual(new Set(refModeIds).size, refModeIds.length, `Doppelte Referenz-Modi in ${con.id}/${mode.id}`);
  }
}

console.log('OK test-mode-array-dedup');
