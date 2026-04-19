import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../styles/main.css';
import './vite-bridge.css';

const mountNode = document.getElementById('app');

function toMessage(error) {
  if (!error) return 'Unbekannter Fehler';
  return error.stack || error.message || String(error);
}

class RuntimeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    const message = toMessage(error);
    if (typeof window !== 'undefined' && typeof window.__showBootError === 'function') {
      window.__showBootError(message);
    }
    console.error('[MKWC] Runtime-Fehler', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="vite-boot-fallback">
          <div className="vite-boot-card vite-boot-card--error">
            <p className="vite-boot-eyebrow">React-Laufzeitfehler</p>
            <h1>Die App ist gestartet, aber beim Rendern abgestürzt</h1>
            <pre>{toMessage(this.state.error)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

if (!mountNode) {
  throw new Error('Vite-Root #app wurde nicht gefunden.');
}

createRoot(mountNode).render(
  <RuntimeErrorBoundary>
    <App />
  </RuntimeErrorBoundary>,
);
