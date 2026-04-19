// Legacy-Kompatibilitäts-Shim: Ranking-Domain wird über Vite aus src/domain/rankingDomain.js bereitgestellt.
(function attachLegacyRankingDomain(global){
  if (global && global.__MKWC_RANKING_DOMAIN__) {
    Object.assign(global, global.__MKWC_RANKING_DOMAIN__);
  }
})(typeof window !== 'undefined' ? window : globalThis);
