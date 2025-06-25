// src/service-worker.js
const CACHE_NAME = 'shoe-customizer-v3';
const RUNTIME_CACHE = 'runtime-v3';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/static/js/main.*.js',
  '/static/css/main.*.css'
];

const NETLIFY_FUNCTION_PATHS = [
  '/.netlify/functions/generate-shoe',
  '/.netlify/functions/save-design'
];

// Custom strategy for 3D models
class ModelCacheFirst {
  async handle({ request }) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      // Update cache in background
      this._updateCache(request, cache);
      return cached;
    }
    
    return this._fetchAndCache(request, cache);
  }

  async _fetchAndCache(request, cache) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (err) {
      return new Response(null, { status: 408 });
    }
  }

  async _updateCache(request, cache) {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== RUNTIME_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 1. Handle Netlify Functions
  if (NETLIFY_FUNCTION_PATHS.some(path => url.pathname.startsWith(path))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache API responses for offline viewing
          const cloned = response.clone();
          caches.open(RUNTIME_CACHE)
            .then(cache => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Handle 3D Models
  if (url.pathname.includes('/assets/models/')) {
    event.respondWith(new ModelCacheFirst().handle({ request: event.request }));
    return;
  }

  // 3. Default strategy for other assets
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const fetched = fetch(event.request)
          .then(response => {
            // Cache successful responses
            if (response.ok) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE)
                .then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => new Response(null, { status: 503 }));
        
        return cached || fetched;
      })
  );
});

// Background sync for failed API calls
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-designs') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then(cache => cache.keys())
        .then(keys => {
          return Promise.all(
            keys.filter(key => NETLIFY_FUNCTION_PATHS.some(path => key.url.includes(path)))
              .map(request => fetch(request))
          );
        })
    );
  }
});

// Periodic cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.keys().then(keys => {
          keys.forEach(request => {
            if (!PRECACHE_ASSETS.includes(new URL(request.url).pathname)) {
              cache.delete(request);
            }
          });
        });
      })
    );
  }
});