const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert(!/cdnjs\.cloudflare\.com\/ajax\/libs\/react/i.test(html), 'index.html darf React nicht mehr vom CDN laden.');
assert(/src="\.\/js\/vendor\/react\.production\.min\.js"/i.test(html), 'index.html muss lokale React-Vendor-Datei laden.');
assert(/src="\.\/js\/vendor\/react-dom\.production\.min\.js"/i.test(html), 'index.html muss lokale ReactDOM-Vendor-Datei laden.');

console.log('OK test-index-offline-vendor');
