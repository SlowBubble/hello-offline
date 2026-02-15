# M1B: Network-First Caching Strategy

## What Changed

Switched from **Cache-First** to **Network-First** caching strategy in the service worker.

## Why the Change?

### Problem with Cache-First:
- Served cached content even when online
- Required manually bumping cache version (`v1` → `v2` → `v3`) to get updates
- Users could see stale content until cache version changed

### Benefits of Network-First:
- Always fetches fresh content when online
- Automatically updates cache with latest version
- No need to manually bump cache versions
- Falls back to cache only when offline

## How It Works

```javascript
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)                    // 1. Try network first
            .then(response => {
                caches.open(CACHE).then(    // 2. Update cache with fresh response
                    cache => cache.put(e.request, response.clone())
                );
                return response;             // 3. Return fresh response
            })
            .catch(() => caches.match(e.request))  // 4. If offline, use cache
    );
});
```

### Flow:

**When Online:**
1. Request goes to network
2. Fresh response received
3. Cache automatically updated
4. Fresh response served to user

**When Offline:**
1. Network request fails (`.catch()` triggered)
2. Service worker checks cache
3. Cached version served
4. App works offline

## Trade-offs

### Network-First (Current):
- ✓ Always fresh when online
- ✓ No manual cache version updates
- ✓ Automatic cache updates
- ✗ Slightly slower (network latency)
- ✗ Requires network round-trip when online

### Cache-First (Previous):
- ✓ Instant loading (no network wait)
- ✓ Works great offline
- ✗ Can serve stale content
- ✗ Requires manual cache version bumps

## When to Use Each Strategy

**Network-First** (what we use now):
- Content that changes frequently
- When freshness is important
- When you don't want to manage cache versions

**Cache-First**:
- Static assets that rarely change (fonts, logos)
- When speed is critical
- When you have a good cache versioning system

## Result

The app now stays up-to-date automatically when online while still working perfectly offline. No more manual cache version management needed.
