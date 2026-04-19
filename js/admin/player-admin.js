(function () {
  if (!window.__MKWC_PLAYER_ADMIN__) {
    throw new Error('Player-Admin-Modul wurde nicht initialisiert. Bitte die App über den Vite-Entry starten.');
  }
  Object.assign(window, window.__MKWC_PLAYER_ADMIN__);
})();
