// public/sw.js — Bejoice Group Service Worker
const CACHE_NAME  = 'bejoice-v1';
const VIDEO_CACHE = 'bejoice-video-v1';

const PRECACHE = [
  '/',
  '/hero-poster.webp',
];

// ── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove stale caches ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== VIDEO_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy ─────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Video: cache-first
  if (url.pathname.match(/\.(webm|mp4)$/)) {
    event.respondWith(cacheVideo(event.request));
    return;
  }

  // Images: cache-first
  if (url.pathname.match(/\.(webp|jpg|jpeg|png|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached ?? fetchAndCache(event.request, CACHE_NAME))
    );
    return;
  }

  // JS/CSS: stale-while-revalidate
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fresh = fetch(event.request).then(res => {
          if (res.ok) {
            caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          }
          return res;
        });
        return cached ?? fresh;
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// ── Video cache helper ─────────────────────────────────────────────────────
async function cacheVideo(request) {
  const cache  = await caches.open(VIDEO_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached ?? new Response('Video unavailable offline', { status: 503 });
  }
}

async function fetchAndCache(request, cacheName) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}
