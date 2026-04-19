(function () {
  if (!window.__MKWC_TOURNAMENT_TABS__) {
    throw new Error('Tournament-Tabs-Modul wurde nicht initialisiert. Bitte die App über den Vite-Entry starten.');
  }
  Object.assign(window, window.__MKWC_TOURNAMENT_TABS__);
})();
