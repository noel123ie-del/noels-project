// Thrift Service Worker — minimal offline support
const CACHE = 'thrift-v1.21';
const ASSETS = [
  '/bold/app',
  '/bold/app.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network-first for status.json, Firestore, Anthropic — never cache live data
  const url = e.request.url;
  if (url.includes('status.json') || url.includes('firestore.googleapis.com') || url.includes('api.anthropic.com')) {
    return; // let it pass through
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      if (e.request.method === 'GET' && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match('/bold/app')))
  );
});
