'use strict';
// Offline support. Pages and content: network first (always fresh when online),
// cached copy when offline, offline.html as last resort. Static files: cache, refreshed in background.
// The admin panel and other sites are never touched.
const VERSION = 'cd-v2';
const CORE = ['./', 'index.html', 'offline.html', 'assets/icon-192.png', 'typography/NotoSansArabic.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

const scope = new URL(self.registration.scope);

// The page sends the files it already loaded, so the first visited page works offline too.
self.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'cache-urls' || !Array.isArray(e.data.urls)) return;
  const urls = e.data.urls.filter((u) => {
    try { const x = new URL(u); return x.origin === scope.origin && x.pathname.startsWith(scope.pathname) && !x.pathname.includes('/admin/') && !x.pathname.includes('/content/'); } catch { return false; }
  }).slice(0, 120);
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(urls.map((u) => c.match(u).then((hit) => hit || c.add(u).catch(() => {}))))));
});
// key: what the response is stored under (data files ignore their cache-busting ?t=).
const fresh = (req, key = req) =>
  fetch(req).then((res) => {
    if (res.ok && res.type === 'basic') {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(key, copy));
    }
    return res;
  });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname.startsWith(scope.pathname + 'admin/')) return;
  const isPage = req.mode === 'navigate';
  const isData = url.pathname.includes('/content/');
  if (isPage || isData) {
    const key = isData ? url.origin + url.pathname : req;
    e.respondWith(
      fresh(req, key).catch(() =>
        caches.match(key, { ignoreSearch: isPage }).then((hit) => hit || (isPage ? caches.match('offline.html') : Response.error())),
      ),
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fresh(req).catch(() => hit);
      return hit || net;
    }),
  );
});
