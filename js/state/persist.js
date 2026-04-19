(function () {
  if (!window.__MKWC_PERSIST__) {
    throw new Error('Persistenz-Modul wurde nicht initialisiert. Bitte die App über den Vite-Entry starten.');
  }
  Object.assign(window, window.__MKWC_PERSIST__);
})();
