import { useEffect, useState } from 'react';
import { bootstrapLegacyApp } from './legacy/bootstrap.js';

function toMessage(error) {
  if (!error) return 'Unbekannter Fehler';
  return error.stack || error.message || String(error);
}

export default function App() {
  const [status, setStatus] = useState('booting');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    bootstrapLegacyApp()
      .then(() => {
        if (!cancelled) {
          setStatus('ready');
        }
      })
      .catch((err) => {
        const message = toMessage(err);

        if (typeof window !== 'undefined' && typeof window.__showBootError === 'function') {
          window.__showBootError(message);
        }

        if (!cancelled) {
          setError(message);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div id="root" data-runtime="vite-legacy-bridge" />
      {status === 'booting' && (
        <div className="vite-boot-splash" role="status" aria-live="polite">
          <div className="vite-boot-card">
            <p className="vite-boot-eyebrow">Mario Kart World Cup</p>
            <h1>Legacy-App wird über Vite gestartet</h1>
            <p>
              React läuft jetzt über npm + Vite. Die bestehende Fachlogik wird im nächsten
              Schritt weiter in ES-Module zerlegt.
            </p>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="vite-boot-fallback">
          <div className="vite-boot-card vite-boot-card--error">
            <p className="vite-boot-eyebrow">Startfehler</p>
            <h1>Die Legacy-App konnte nicht geladen werden</h1>
            <pre>{error}</pre>
          </div>
        </div>
      )}
    </>
  );
}
