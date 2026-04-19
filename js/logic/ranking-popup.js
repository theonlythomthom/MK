// Legacy-Kompatibilitäts-Shim: Ranking-Popup kommt aus src/logic/rankingPopup.js
(function attachLegacyRankingPopup(global){
  if (global && global.__MKWC_RANKING_POPUP__) {
    Object.assign(global, global.__MKWC_RANKING_POPUP__);
  }
})(typeof window !== 'undefined' ? window : globalThis);
