const fs = require('fs');
const path = require('path');
const assert = require('assert');

const appSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'app-main.js'), 'utf8');
const reactDomVendor = fs.readFileSync(path.join(__dirname, '..', 'js', 'vendor', 'react-dom.production.min.js'), 'utf8');

const vendorHasCreateRoot = /createRoot/.test(reactDomVendor);

assert(
  /function mountApp\(rootEl\)/.test(appSrc),
  'app-main.js muss einen zentralen Mount-Pfad besitzen.'
);

if (!vendorHasCreateRoot) {
  assert(
    /typeof ReactDOM\.render === 'function'/.test(appSrc),
    'Wenn die lokale ReactDOM-Vendor-Datei kein createRoot enthält, muss app-main.js auf ReactDOM.render zurückfallen.'
  );
}

assert(
  /typeof ReactDOM\.createRoot === 'function'/.test(appSrc),
  'Der moderne createRoot-Pfad soll erhalten bleiben, falls eine neuere ReactDOM-Version verwendet wird.'
);

console.log('OK test-reactdom-mount-compat');
