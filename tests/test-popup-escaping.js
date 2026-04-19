const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {
  console,
  RANKING_SHORT_NAME: { gc: 'GC', wii: 'Wii' },
  fpShort: f => f?.players?.[0]?.name || ('FP' + f.id),
  fpSub: () => '',
  fpName: f => f?.players?.[0]?.name || ('FP' + f.id),
  isSolo: f => !String((f && f.teamName) || '').trim(),
  React: { useState: () => {}, useMemo: fn => fn(), useEffect: () => {}, useRef: () => ({ current: null }) },
  document: { getElementById: () => null },
  window: {},
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/core.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/logic/ranking-popup.js'), 'utf8'), sandbox);

const { rankingPopupContentHtml } = sandbox;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const fps = [
  { id: 'fp_a', teamName: '', players: [{ name: '<b>Evil</b>', nickname: '<script>x</script>' }] }
];

const state = {
  title: 'Test',
  meta: { fps, conStats: { fp_a: { gc: { done: 1, total: 1 } } }, consoleOrder: ['gc'] },
  sections: [{
    title: 'Konsolen',
    isKonsolenGrid: true,
    columns: [{
      title: 'GC',
      entries: [{ rank: 1, fpId: 'fp_a', pts: 42.5 }]
    }]
  }]
};

const html = rankingPopupContentHtml(state);
assert(html.includes('&lt;script&gt;x&lt;/script&gt;') || html.includes('&lt;b&gt;Evil&lt;/b&gt;'), 'Popup-HTML muss Benutzerdaten escaped ausgeben.');
assert(!html.includes('<script>x</script>'), 'Popup-HTML darf keine unescaped Script-Tags enthalten.');
console.log('OK test-popup-escaping');
