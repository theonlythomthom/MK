(function (global) {
  const runtime = global && global.__MKWC_CORE_RUNTIME__;
  if (runtime && typeof runtime === 'object') {
    Object.assign(global, runtime);
    return;
  }
  console.warn('MKWC: js/core.js ist jetzt nur noch ein Legacy-Shim. Der eigentliche Runtime-Core liegt in src/core/coreRuntime.js.');
})(typeof window !== 'undefined' ? window : globalThis);
