/* Service worker: keeps the site's own files on the phone so it opens with no signal.
   Trip data is saved separately by app.js (last good copy from the sheet).
   Bump VERSION whenever a site file changes, so phones pick up the new files. */
var VERSION = 'trip-v2';
var SHELL = [
  './', 'index.html', 'styles.css', 'fonts.css', 'app.js', 'manifest.webmanifest',
  'samples/montenegro-sample.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/cormorant-garamond-latin-300-normal.woff2', 'fonts/cormorant-garamond-latin-400-normal.woff2',
  'fonts/cormorant-garamond-latin-600-normal.woff2', 'fonts/cormorant-garamond-latin-ext-300-normal.woff2',
  'fonts/cormorant-garamond-latin-ext-400-normal.woff2', 'fonts/cormorant-garamond-latin-ext-600-normal.woff2',
  'fonts/dm-sans-latin-300-normal.woff2', 'fonts/dm-sans-latin-400-normal.woff2',
  'fonts/dm-sans-latin-500-normal.woff2', 'fonts/dm-sans-latin-600-normal.woff2',
  'fonts/dm-sans-latin-ext-300-normal.woff2', 'fonts/dm-sans-latin-ext-400-normal.woff2',
  'fonts/dm-sans-latin-ext-500-normal.woff2', 'fonts/dm-sans-latin-ext-600-normal.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Own files: answer from the phone instantly, refresh the saved copy in the background.
// Anything else (Google Sheets data) goes straight to the network; app.js handles its fallback.
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    var key = e.request.mode === 'navigate' ? 'index.html' : e.request;
    return cache.match(key, { ignoreSearch: true }).then(function (hit) {
      var fresh = fetch(e.request).then(function (res) {
        if (res.ok && e.request.mode !== 'navigate') cache.put(e.request, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || fresh;
    });
  }));
});
