// Legacy-Kompatibilitäts-Shim: Druck-/Exportlogik kommt aus src/logic/printExport.js
(function attachLegacyPrintExport(global){
  if (global && global.__MKWC_PRINT_EXPORT__) {
    Object.assign(global, global.__MKWC_PRINT_EXPORT__);
  }
})(typeof window !== 'undefined' ? window : globalThis);
