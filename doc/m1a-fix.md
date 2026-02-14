# M1A Fix: GitHub Pages Subdirectory Issue

## Problem

The app loaded fine when online but failed to work offline when deployed to GitHub Pages at `https://slowbubble.github.io/hello-offline/`.

## Root Cause

The service worker was using **absolute paths** (`/`, `/index.html`) which work fine when the app is at the root domain, but fail in subdirectories.

When deployed to `/hello-offline/`:
- The service worker cached files at `/` and `/index.html` (root domain)
- But the actual files were at `/hello-offline/` and `/hello-offline/index.html`
- When offline, the browser couldn't find the cached files because they were cached at the wrong paths

## Solution

Changed all absolute paths to **relative paths** using `./`:

### Changes Made:

1. **sw.js** - Updated cache paths:
   ```javascript
   // Before:
   cache.addAll(['/', '/index.html'])
   
   // After:
   cache.addAll(['./', './index.html'])
   ```

2. **index.html** - Added scope to service worker registration:
   ```javascript
   // Before:
   navigator.serviceWorker.register('sw.js');
   
   // After:
   navigator.serviceWorker.register('sw.js', { scope: './' });
   ```

3. **manifest.json** - Updated start URL:
   ```json
   // Before:
   "start_url": "/"
   
   // After:
   "start_url": "./"
   ```

4. **Cache version bumped** from `v1` to `v2` to force update

## Why This Works

Relative paths (`./`) resolve based on the current location:
- At `https://slowbubble.github.io/hello-offline/`, `./` means `/hello-offline/`
- At `http://localhost:8000/`, `./` means `/`
- Works anywhere without hardcoding the path

## Key Takeaway

**Always use relative paths (`./`) for PWAs that might be deployed to subdirectories.** This makes your app portable and works on GitHub Pages, subdirectories, or any hosting environment.
