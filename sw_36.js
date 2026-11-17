/* Frido dashboard app — keeps the app shell available offline.
   The dashboard page is always fetched fresh first (so updates reach everyone);
   the saved copy is used only when there is no internet. Data calls to Apps Script are never cached. */
const CACHE = "frido-app-v21";
const SHELL = ["./", "./index.html", "./manifest.json", "./pwa/icon-192.png", "./pwa/icon-512.png", "./pwa/icon-maskable-512.png", "./pwa/apple-touch-icon.png", "./pwa/intro.mp3", "./pwa/ambient.mp3"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;            // Apps Script data, fonts etc. go straight to the network
  if (req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html")) {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("./index.html", c)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })));
});
