import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const LEGAL_PATHS = new Set(['/termos', '/privacidade', '/aviso-medico']);

// Bloqueia pinch-zoom no iOS Safari para sensação de app nativa (preservando zoom dentro do mapa Leaflet)
if (typeof document !== 'undefined') {
  const preventPinch = (e) => {
    if (e.target && typeof e.target.closest === 'function' && e.target.closest('.leaflet-container')) return;
    e.preventDefault();
  };
  document.addEventListener('gesturestart', preventPinch, { passive: false });
  document.addEventListener('gesturechange', preventPinch, { passive: false });
}

// Páginas legais públicas (/termos, /privacidade, /aviso-medico): fora da app, sem login e sem puxar os textos legais para o bundle principal
const legalPath = window.location.pathname.replace(/\/+$/, '') || '/';

const page = LEGAL_PATHS.has(legalPath)
  ? Promise.all([
      import('./legal/index.js'),
      import('./components/legal/LegalPageLayout.jsx')
    ]).then(([{ LEGAL_DOCS }, { default: Layout }]) => <Layout doc={LEGAL_DOCS[legalPath]} path={legalPath} />)
  : import('./App.jsx').then(({ default: App }) => <App />);

page.then((element) => {
  createRoot(document.getElementById('root')).render(<StrictMode>{element}</StrictMode>);
});

// Service Worker apenas em produção; em dev limpa registos antigos para evitar cache desatualizada no localhost.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (!import.meta.env.PROD) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      }).catch(() => {});
      return;
    }
    let mediaHost = '';
    try {
      mediaHost = import.meta.env.VITE_MEDIA_BASE_URL ? new URL(import.meta.env.VITE_MEDIA_BASE_URL).host : '';
    } catch {}
    navigator.serviceWorker.register(mediaHost ? `/sw.js?media=${encodeURIComponent(mediaHost)}` : '/sw.js').catch(() => {});
  });
}
