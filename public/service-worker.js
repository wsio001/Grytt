// Grytt Service Worker - Offline Support
// Cache version - increment this to force cache refresh on deploy
const CACHE_VERSION = 'grytt-v1.2.0';
const CACHE_NAME = `grytt-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force this service worker to become active immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (cacheName !== CACHE_NAME && cacheName.startsWith('grytt-cache-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip Supabase API requests (always go to network for fresh data)
  if (url.hostname.includes('supabase')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            // Cache successful responses for future use
            // Only cache GET requests
            if (request.method === 'GET') {
              const responseToCache = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  // Cache JavaScript, CSS, images, fonts
                  if (
                    request.url.includes('/assets/') ||
                    request.url.match(/\.(js|css|png|jpg|jpeg|svg|woff2|woff|ttf)$/)
                  ) {
                    console.log('[SW] Caching new asset:', request.url);
                    cache.put(request, responseToCache);
                  }
                });
            }

            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed, serving offline fallback:', error);

            // If request is for HTML page and we're offline, serve cached index.html
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }

            // For other resources, just fail
            throw error;
          });
      })
  );
});

// Message event - allow pages to communicate with service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log('[SW] Service worker script loaded, version:', CACHE_VERSION);
