const CACHE_NAME = 'anjy-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon-512.png',
  '/manifest.json'
];

// Install Event: Pre-cache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate caching strategy
self.addEventListener('fetch', (event) => {
  // Only handle local GET requests (skip API, Supabase, external requests)
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Don't intercept development Hot Module Replacement requests
  if (event.request.url.includes('@vite') || event.request.url.includes('node_modules')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Return cached version if network fails (offline fallback)
            return cachedResponse;
          });

        // Return cached version immediately if we have it, else wait for network
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
