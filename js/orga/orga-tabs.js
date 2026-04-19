(function () {
  if (!window.__MKWC_ORGA_TABS__) {
    throw new Error('Orga-Tabs-Modul wurde nicht initialisiert. Bitte die App über den Vite-Entry starten.');
  }
  Object.assign(window, window.__MKWC_ORGA_TABS__);
})();
