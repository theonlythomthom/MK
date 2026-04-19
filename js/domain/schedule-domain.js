// Legacy-Kompatibilität: scheduleDomain läuft seit Block B.4 als ES-Modul.
// Die eigentliche Implementierung wird im Vite-Bootstrap nach window gehängt.
(function attachLegacyScheduleDomainBridge(globalScope) {
  const runtime = globalScope && globalScope.__MKWC_SCHEDULE_DOMAIN__;
  if (!runtime || typeof runtime !== 'object') return;
  if (typeof globalScope.getSelectionKindForMode !== 'function' && typeof runtime.getSelectionKindForMode === 'function') {
    globalScope.getSelectionKindForMode = runtime.getSelectionKindForMode;
  }
  if (typeof globalScope.pickTrackForMode !== 'function' && typeof runtime.pickTrackForMode === 'function') {
    globalScope.pickTrackForMode = runtime.pickTrackForMode;
  }
  if (typeof globalScope.buildSchedule !== 'function' && typeof runtime.buildSchedule === 'function') {
    globalScope.buildSchedule = runtime.buildSchedule;
  }
  if (typeof globalScope.normalizeScheduleForConsoles !== 'function' && typeof runtime.normalizeScheduleForConsoles === 'function') {
    globalScope.normalizeScheduleForConsoles = runtime.normalizeScheduleForConsoles;
  }
})(typeof window !== 'undefined' ? window : globalThis);
