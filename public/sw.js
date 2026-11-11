const CACHE_NAME = 'ab-fitness-v8'; // v8: novo design oficial do logo AB Fitness (PWA e ícones renovados); v7: ícones PNG do manifesto
const MEDIA_CACHE = 'ab-fitness-media-v1';
const MEDIA_MAX_ENTRIES = 150;
const NETWORK_TIMEOUT_MS = 3000;
const MEDIA_HOST = 'pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const keep = [CACHE_NAME, MEDIA_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

function putInCache(cacheName, request, response) {
  if (!response || (response.status !== 200 && response.type !== 'opaque')) return;
  const copy = response.clone();
  caches.open(cacheName).then((cache) => cache.put(request, copy)).catch(() => {});
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i]);
  }
}

/**
 * Rede primeiro, mas sem ficar preso: se a rede não responder em 3s (sinal fraco no ginásio),
 * serve a cópia em cache. Sem cópia, continua à espera da rede.
 */
function networkFirstWithTimeout(request, { fallbackToShell = false, timeoutMs = NETWORK_TIMEOUT_MS } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (res) => {
      if (!settled && res) {
        settled = true;
        resolve(res);
      }
    };

    const network = fetch(request).then((res) => {
      putInCache(CACHE_NAME, request, res);
      return res;
    });

    const fromCache = () =>
      caches.match(request).then((cached) => cached || (fallbackToShell ? caches.match('/') : undefined));

    const timer = Number.isFinite(timeoutMs)
      ? setTimeout(() => {
          fromCache().then(finish);
        }, timeoutMs)
      : null;

    network
      .then((res) => {
        clearTimeout(timer);
        finish(res);
      })
      .catch(() => {
        clearTimeout(timer);
        fromCache().then((cached) => {
          if (cached) finish(cached);
          else if (!settled) reject(new Error('offline'));
        });
      });
  });
}

/** Cache primeiro: para ficheiros imutáveis (bundles com hash) e imagens de capa. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  putInCache(cacheName, request, res);
  if (cacheName === MEDIA_CACHE) trimCache(MEDIA_CACHE, MEDIA_MAX_ENTRIES);
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Supabase (dados e autenticação do utilizador): nunca passa pelo cache, para não guardar dados
  // de uma conta num aparelho partilhado. Offline, a app já usa o LocalStorage e a fila de sincronização.
  if (url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.in')) return;

  // Vídeos: o bucket não envia CORS, por isso não é possível servir pedidos parciais (Range)
  // a partir do cache. Deixa passar diretamente para a rede.
  if (request.destination === 'video' || request.headers.has('range') || url.pathname.endsWith('.mp4')) return;

  // Capas dos vídeos (R2): cache primeiro, com limite de entradas
  // Posters (bucket de origem ou o teu R2 espelhado via VITE_MEDIA_BASE_URL)
  if ((url.hostname === MEDIA_HOST && !url.pathname.endsWith('.mp4')) || url.pathname.startsWith('/exercise-posters/')) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  // Bundles de produção com hash no nome: nunca mudam
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // App (mesma origem): rede com limite de 3s e fallback para cache.
  // Outros pedidos externos (fontes etc.): rede primeiro sem limite.
  const sameOrigin = url.origin === self.location.origin;
  event.respondWith(
    networkFirstWithTimeout(request, {
      fallbackToShell: request.mode === 'navigate',
      timeoutMs: sameOrigin ? NETWORK_TIMEOUT_MS : Infinity
    })
  );
});
