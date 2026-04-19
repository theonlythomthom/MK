(function () {
  if (!window.__MKWC_APP_MAIN__) {
    throw new Error('App-Main-Modul wurde nicht initialisiert. Bitte die App über den Vite-Entry starten.');
  }
  Object.assign(window, window.__MKWC_APP_MAIN__);
})();
