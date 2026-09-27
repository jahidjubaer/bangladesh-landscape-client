/* Bangladesh Landscape service worker — offline support.
   Strategy:
   - navigations: network-first, fall back to cached shell (offline app boot)
   - hashed /assets/*, /uploads/* images, Google Fonts: cache-first (immutable-ish)
   - API GETs (/api/v1/*): network-first with cache fallback — any plan,
     district or spot the user has opened stays readable offline (key for
     purchased tour plans in low-network haor areas) */
const VERSION = 'bl-v1';
const CACHE = `bl-cache-${VERSION}`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function putCache(request, response) {
  try {
    const cache = await caches.open(CACHE);
    await cache.put(request, response);
  } catch {
    /* storage full/opaque — ignore */
  }
}

async function networkFirst(request, fallbackKey) {
  try {
    const res = await fetch(request);
    if (res && res.ok) putCache(fallbackKey || request, res.clone());
    return res;
  } catch {
    const cached = await caches.match(fallbackKey || request);
    if (cached) return cached;
    throw new Error('offline');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && (res.ok || res.type === 'opaque')) putCache(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Never touch the mock payment gateway or downloads
  if (url.pathname.includes('/payments/') || url.pathname.endsWith('/download')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/index.html'));
    return;
  }

  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/uploads/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|woff2?)$/) ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
  }
});
