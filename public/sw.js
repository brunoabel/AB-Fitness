const CACHE_NAME = 'ab-fitness-v25'; // v25: vídeos do treino do dia em cache, servidos com Range
const MEDIA_CACHE = 'ab-fitness-media-v1';
const MEDIA_MAX_ENTRIES = 150;
const VIDEO_CACHE = 'ab-fitness-video-v1';
const VIDEO_MAX_ENTRIES = 40;
const NETWORK_TIMEOUT_MS = 3000;
const MEDIA_HOST = 'pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev';
// Domínio de média próprio (VITE_MEDIA_BASE_URL), passado no registo: /sw.js?media=<host>
const EXTRA_MEDIA_HOST = (new URL(self.location.href).searchParams.get('media') || '').trim();
const MEDIA_HOSTS = new Set([MEDIA_HOST, EXTRA_MEDIA_HOST].filter(Boolean));
const isMediaHost = (hostname) => MEDIA_HOSTS.has(hostname);

// URLs de vídeo já guardadas: só estes pedidos passam pelo SW; os restantes vão direto à rede
const cachedVideoUrls = new Set();
caches.open(VIDEO_CACHE)
  .then((cache) => cache.keys())
  .then((keys) => keys.forEach((req) => cachedVideoUrls.add(req.url)))
  .catch(() => {});

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
  const keep = [CACHE_NAME, MEDIA_CACHE, VIDEO_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

function putInCache(cacheName, request, response) {
  if (!response || (response.status !== 200 && response.type !== 'opaque')) return;
  try {
    const reqUrl = new URL(request.url);
    const allowedOrigin = reqUrl.origin === self.location.origin || isMediaHost(reqUrl.hostname);
    if (!allowedOrigin) return;
  } catch {
    return;
  }
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

/**
 * Vídeo em cache servido com pedidos parciais (Range), como o <video> espera (o Safari exige 206).
 * Só funciona com respostas CORS: o bucket tem de ter a política de scripts/r2-cors.json.
 */
async function serveCachedVideo(request) {
  const cache = await caches.open(VIDEO_CACHE);
  const cached = await cache.match(request.url);
  if (!cached) return fetch(request);
  const buffer = await cached.arrayBuffer();
  const size = buffer.byteLength;
  const type = cached.headers.get('Content-Type') || 'video/mp4';
  const range = request.headers.get('range');
  if (!range) {
    return new Response(buffer, { status: 200, headers: { 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' } });
  }
  const match = /bytes=(\d*)-(\d*)/.exec(range);
  let start = match && match[1] ? Number(match[1]) : 0;
  let end = match && match[2] ? Number(match[2]) : size - 1;
  if (match && !match[1] && match[2]) {
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  }
  end = Math.min(end, size - 1);
  if (start > end || start >= size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  const slice = buffer.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    headers: {
      'Content-Type': type,
      'Content-Length': String(slice.byteLength),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes'
    }
  });
}

async function trimVideoCache() {
  const cache = await caches.open(VIDEO_CACHE);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - VIDEO_MAX_ENTRIES; i++) {
    cachedVideoUrls.delete(keys[i].url);
    await cache.delete(keys[i]);
  }
}

/** Descarrega os vídeos pedidos pela app (treino do dia). Sem CORS no bucket ou sem rede, ignora. */
async function precacheVideos(urls) {
  const cache = await caches.open(VIDEO_CACHE);
  for (const raw of urls) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      continue;
    }
    if (!isMediaHost(url.hostname) || !url.pathname.endsWith('.mp4')) continue;
    if (await cache.match(url.href)) {
      cachedVideoUrls.add(url.href);
      continue;
    }
    try {
      const res = await fetch(url.href, { mode: 'cors', credentials: 'omit' });
      if (res.ok && res.type !== 'opaque') {
        await cache.put(url.href, res);
        cachedVideoUrls.add(url.href);
      }
    } catch {
      // bucket sem CORS ou sem rede: o vídeo continua a vir da rede quando for aberto
    }
  }
  await trimVideoCache();
}

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type !== 'PRECACHE_VIDEOS' || !Array.isArray(data.urls)) return;
  event.waitUntil(precacheVideos(data.urls.slice(0, 12)));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Supabase (dados e autenticação do utilizador): nunca passa pelo cache, para não guardar dados
  // de uma conta num aparelho partilhado. Offline, a app já usa o LocalStorage e a fila de sincronização.
  if (url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.in')) return;

  // Vídeos: só os que foram pré-guardados (com CORS) saem do cache, com Range; os outros vão à rede
  if (request.destination === 'video' || request.headers.has('range') || url.pathname.endsWith('.mp4')) {
    if (isMediaHost(url.hostname) && cachedVideoUrls.has(url.href)) event.respondWith(serveCachedVideo(request));
    return;
  }

  // Capas dos vídeos (R2): cache primeiro, com limite de entradas
  // Posters (bucket de origem ou o teu R2 espelhado via VITE_MEDIA_BASE_URL)
  if ((isMediaHost(url.hostname) && !url.pathname.endsWith('.mp4')) || url.pathname.startsWith('/exercise-posters/')) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  // Bundles de produção com hash no nome: nunca mudam
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // App (mesma origem) + bucket de média autorizado: rede com limite de 3s e fallback para cache.
  // Pedidos externos (tiles de mapa, APIs OAuth/Analytics) passam direto para a rede sem poluir CACHE_NAME.
  const sameOrigin = url.origin === self.location.origin;
  const isAllowedOrigin = sameOrigin || isMediaHost(url.hostname);
  if (!isAllowedOrigin) return;

  event.respondWith(
    networkFirstWithTimeout(request, {
      fallbackToShell: request.mode === 'navigate',
      timeoutMs: sameOrigin ? NETWORK_TIMEOUT_MS : Infinity
    })
  );
});
