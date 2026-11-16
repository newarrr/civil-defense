'use strict';
// Offline support for an emergency-information site.
//
//  · Pages, scripts, styles, language files and /content  → network first, so a visitor who is
//    online always gets one consistent, current version; the cached copy is used only offline.
//  · Images and fonts → cache first (they are large and change rarely), refreshed in the background.
//  · Nothing under /admin and nothing from other origins is ever touched.
//
//  · The first page a visitor opens loads its files before this worker exists; the page then sends
//    the list of those files (js/shell/shell.js) and they are cached, so that page also works offline.
//
// VERSION is written by tools/build.mjs: a fingerprint of the site's files. Every site update
// therefore installs a new worker, which removes the previous cache (activate, below).
//
// CORE holds only what offline.html needs. Pages are cached when they are visited: a page never
// opened online falls back to offline.html (with the 115 button) instead of a half-cached page.
const VERSION = 'cd-7d4e14435a15';
const CORE = ['offline.html', 'assets/brand/icon-192.png'];
const scope = new URL(self.registration.scope);
// Every copy this worker stores is confirmed with the server first ('no-cache'): GitHub Pages lets
// browsers reuse a file for 10 minutes, and a copy from before a site update must never be kept
// under the new VERSION.
const fresh = (url) => new Request(url, { cache: 'no-cache' });

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE.map(fresh))).then(() => self.skipWaiting()));
});

// The origin (newarrr.github.io) is shared with any other GitHub Pages site of the same account:
// remove only this site's own old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('cd-') && key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const inScope = (address) => {
  try {
    const url = new URL(address, scope);
    return url.origin === scope.origin && url.pathname.startsWith(scope.pathname) && !url.pathname.startsWith(scope.pathname + 'admin/');
  } catch {
    return false;
  }
};

self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'cache-urls' || !Array.isArray(event.data.urls)) return;
  const urls = [...new Set(event.data.urls.filter((url) => typeof url === 'string' && inScope(url)))].slice(0, 150);
  event.waitUntil(
    caches.open(VERSION).then((cache) => Promise.all(urls.map((url) => cache.match(url).then((hit) => hit || cache.add(fresh(url)).catch(() => {}))))),
  );
});

const store = (request, response) => {
  if (response.ok && response.type === 'basic') {
    const copy = response.clone();
    caches.open(VERSION).then((cache) => cache.put(request, copy));
  }
  return response;
};

// cache: 'no-cache' makes the browser confirm each file with the server (a cheap "not modified"
// answer when nothing changed), so right after an update a visitor never gets a new page with old
// scripts or an old language file left in the browser's own cache.
const networkFirst = (request, fallback) =>
  fetch(request, { cache: 'no-cache' })
    .then((response) => store(request, response))
    .catch(() => caches.match(request, { ignoreSearch: request.mode === 'navigate' }).then((hit) => hit || fallback()));

const cacheFirst = (request) =>
  caches.match(request).then((hit) => {
    const fresh = fetch(request).then((response) => store(request, response));
    if (!hit) return fresh;
    fresh.catch(() => {});
    return hit;
  });

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const path = url.pathname.slice(scope.pathname.length);
  if (path.startsWith('admin/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, () => caches.match('offline.html')));
  } else if (/\.(webp|png|jpe?g|svg|gif|ico|woff2)$/i.test(path)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request, () => Response.error()));
  }
});
