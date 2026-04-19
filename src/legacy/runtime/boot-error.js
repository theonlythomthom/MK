function escapeBootHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

export function showBootError(message, { rootId = 'root' } = {}) {
  const root = typeof document !== 'undefined' ? document.getElementById(rootId) : null;
  if (!root) {
    return;
  }

  root.innerHTML = `<div style="min-height:100vh;background:#0c0c14;color:#fff;display:flex;align-items:flex-start;justify-content:center;padding:32px;font-family:Arial,sans-serif;">
    <div style="max-width:1000px;width:100%;background:#161625;border:1px solid #3a3a52;border-radius:14px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.35)">
      <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.2">Datei konnte nicht korrekt geladen werden</h1>
      <p style="margin:0 0 14px 0;color:#d7d7e8;line-height:1.5">Beim Start ist ein Fehler aufgetreten. Der genaue Hinweis steht unten.</p>
      <pre style="white-space:pre-wrap;word-break:break-word;background:#0f0f18;border:1px solid #31314a;border-radius:10px;padding:14px;color:#ffb4b4;overflow:auto">${escapeBootHtml(message)}</pre>
    </div>
  </div>`;
}

export function installLegacyBootErrorGuards({ rootId = 'root' } = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.__MKWC_BOOT_GUARDS_INSTALLED__) {
    return;
  }

  const renderError = (message) => showBootError(message, { rootId });

  window.__showBootError = renderError;

  window.addEventListener('error', (event) => {
    const message = (event && event.error && (event.error.stack || event.error.message))
      || event?.message
      || 'Unbekannter Fehler';
    renderError(message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const message = (reason && (reason.stack || reason.message))
      || String(reason || 'Unbehandelte Promise-Ablehnung');
    renderError(message);
  });

  window.__MKWC_BOOT_GUARDS_INSTALLED__ = true;
}
