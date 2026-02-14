# M1A: Offline Support Implementation

## What Was Done

This project implements offline support using a **Service Worker** and **PWA (Progressive Web App)** features. This allows the app to work even when there's no internet connection.

## Files Created

### 1. `index.html`
The main HTML file that displays "Hello". It includes:
- A `<script>` tag that registers the service worker
- A link to `manifest.json` for PWA support

### 2. `sw.js` (Service Worker)
This is the magic behind offline support. It runs in the background and intercepts network requests.

**How it works:**
- **Install event**: When the service worker is first installed, it caches the files (`/` and `/index.html`)
- **Fetch event**: When the browser requests a file, the service worker checks the cache first. If found, it serves the cached version. If not, it fetches from the network.

### 3. `manifest.json`
Defines the app as a PWA, allowing it to be installed on devices and run standalone.

## How NOT to Break Offline Support

### ⚠️ Critical Rules:

1. **Don't remove the service worker registration**
   - Keep this code in `index.html`:
   ```javascript
   if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('sw.js');
   }
   ```

2. **Update the cache version when making changes**
   - In `sw.js`, change `const CACHE = 'v1';` to `'v2'`, `'v3'`, etc.
   - This ensures users get the latest version

3. **Add new files to the cache**
   - If you add CSS, JS, or other files, add them to the cache array:
   ```javascript
   cache.addAll(['/', '/index.html', '/style.css', '/app.js'])
   ```

4. **Don't rename core files without updating the cache**
   - If you rename `index.html`, update the cache array in `sw.js`

5. **Keep the manifest.json link**
   - Don't remove `<link rel="manifest" href="manifest.json">` from `index.html`

## Testing Offline Support

1. Open the app in a browser (use a local server, not `file://`)
2. Open DevTools → Application → Service Workers
3. Check "Offline" mode
4. Refresh the page - it should still work!

## Common Issues

- **Service worker not updating**: Increment the cache version and hard refresh (Ctrl+Shift+R)
- **Files not loading offline**: Make sure they're added to the cache array
- **Service worker not registering**: Must be served over HTTPS or localhost
