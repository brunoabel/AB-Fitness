import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const LEGAL_PATHS = new Set(['/termos', '/privacidade', '/aviso-medico']);

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

// Service Worker (PWA e offline). O host de média próprio (VITE_MEDIA_BASE_URL) vai no URL de registo,
// para o SW também guardar e servir vídeos desse domínio.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let mediaHost = '';
    try {
      mediaHost = import.meta.env.VITE_MEDIA_BASE_URL ? new URL(import.meta.env.VITE_MEDIA_BASE_URL).host : '';
    } catch {}
    navigator.serviceWorker.register(mediaHost ? `/sw.js?media=${encodeURIComponent(mediaHost)}` : '/sw.js').catch(() => {});
  });
}
