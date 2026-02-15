const CACHE = 'hello-offline-v1';

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['./', './index.html', './script.js'])));
});

self.addEventListener('fetch', e => {
    // Network-first strategy: Try network, fallback to cache if offline
    // This ensures fresh content when online and automatic cache updates
    e.respondWith(
        fetch(e.request)
            .then(response => {
                // Update cache with fresh response for offline use
                caches.open(CACHE).then(cache => cache.put(e.request, response.clone()));
                return response;
            })
            .catch(() => caches.match(e.request)) // Fallback to cache when offline
    );
});
