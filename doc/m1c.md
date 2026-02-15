# M1C: Service Worker Deep Dive

## Key Concepts Explained

### 1. Why Service Workers Are Needed for Offline Support

**Without a service worker:**
- Browser tries to fetch files from the server
- No internet = request fails
- Browser shows "No internet connection" error
- App doesn't load at all

**With a service worker:**
- Service worker intercepts network requests
- Checks cache first before going to network
- Returns cached version when offline
- App loads even without internet

**Key insight:** The browser's normal cache is unreliable and uncontrollable. Service workers give you programmatic control over caching.

### 2. Cache Storage API vs Service Worker Interception

The `caches` API is available in both service workers and regular page scripts:

```javascript
// Both can access the same cache storage
caches.open('v1').then(cache => cache.match('/index.html'))
```

**But only service workers can intercept requests:**

```javascript
// This ONLY works in service workers
self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request))
})
```

**Why this matters:**
- Regular scripts can't help with offline support because they don't run if the page fails to load
- Service workers run independently and intercept requests before they fail
- This is the service worker's superpower

### 3. Install Event vs Fetch Event

Our service worker has two caching mechanisms:

#### Install Event (Pre-caching)
```javascript
self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(cache => 
        cache.addAll(['./', './index.html', './script.js'])
    ));
});
```

**Purpose:**
- Runs once when service worker is first installed (or when sw.js changes)
- Pre-caches critical files upfront
- Guarantees offline support from first visit
- You manually specify which files to cache

**When it runs again:**
- Any time you modify sw.js (even just adding a file to the list)
- Browser detects the change and reinstalls the service worker
- New files get pre-cached for all users

#### Fetch Event (Dynamic caching)
```javascript
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
            .then(response => {
                // Automatically cache the response
                caches.open(CACHE).then(cache => cache.put(e.request, response.clone()));
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});
```

**Purpose:**
- Runs on every network request
- Automatically caches any file that gets fetched
- Keeps cache up-to-date with fresh content
- Generic logic that never needs to change

**Key difference:**
- Install: You specify files, runs once per sw.js version
- Fetch: Caches everything automatically, runs on every request

**Why both?**
- Install ensures critical files are cached immediately
- Fetch keeps the cache fresh and handles new files automatically
- Install changes when you add files; fetch logic stays the same

### 4. Network-First vs Cache-First Strategies

#### Cache-First (Previous approach)
```javascript
e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
);
```
- Check cache first, fallback to network
- Fast but can serve stale content
- Requires manual cache version bumps to update

#### Network-First (Current approach)
```javascript
e.respondWith(
    fetch(e.request)
        .then(response => {
            caches.open(CACHE).then(cache => cache.put(e.request, response.clone()));
            return response;
        })
        .catch(() => caches.match(e.request))
);
```
- Try network first, fallback to cache if offline
- Always fresh when online
- Automatically updates cache
- No manual version management needed

### 5. Service Worker Scope and Cache Isolation

**Service workers are scoped by path:**
```
slowbubble.github.io/app1/sw.js → controls /app1/* only
slowbubble.github.io/app2/sw.js → controls /app2/* only
```

Each service worker only controls pages under its own path.

**Cache Storage is shared across the domain:**
- Both apps can access the same cache storage
- But cache keys include full URLs, so they don't collide:
  - `https://slowbubble.github.io/app1/index.html`
  - `https://slowbubble.github.io/app2/index.html`

**Best practice:** Use unique cache names per app:
```javascript
// app1/sw.js
const CACHE = 'app1-v1';

// app2/sw.js
const CACHE = 'app2-v1';
```

This makes debugging easier and allows independent cache management.

### 6. The 'serviceWorker' in navigator Check

```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: './' });
}
```

**Why needed:**
- Prevents errors in browsers that don't support service workers
- Old browsers (IE, Safari < 11.1, Chrome < 40)
- Insecure contexts (http:// except localhost)
- Some restricted environments

**Without the check:**
- Code would crash in unsupported browsers
- App would break completely

**With the check:**
- App gracefully degrades
- Works normally, just without offline support

### 7. Is the Manifest Needed for Offline Support?

**No.** The manifest.json is NOT required for offline support.

**Offline support** = Service Worker only
- Service worker handles all caching and offline functionality
- Works completely independently

**Manifest** = PWA installability
- Allows "Add to Home Screen"
- Defines app name, icons, display mode
- Makes it feel like a native app
- But has nothing to do with offline functionality

You could remove the manifest and offline support would still work perfectly.

## Summary

Service workers provide offline support through two mechanisms:
1. **Install event**: Pre-caches critical files when sw.js is installed/updated
2. **Fetch event**: Intercepts requests and serves cached content when offline

The network-first strategy ensures fresh content when online while maintaining offline support, without requiring manual cache version management.
