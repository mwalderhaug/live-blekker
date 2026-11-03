/* Live-blekker – lagrer selve appen på enheten, så den åpner og virker uten nett.
   Blekkene hentes fra GitHub-API-et og lagres av appen selv (ikke her).
   Ny versjon av appen hentes i bakgrunnen og brukes neste gang appen åpnes.
   Øk versjonsnummeret når fillista endres. */
const CACHE = "live-blekker-v1";
const FILES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icon-180.png", "./icon-192.png", "./icon-512.png",
  "./fonts/source-sans-3-latin-wght-normal.woff2", "./fonts/source-sans-3-latin-wght-italic.woff2",
  "./fonts/barlow-semi-condensed-latin-500-normal.woff2", "./fonts/barlow-semi-condensed-latin-600-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // GitHub-API-et går rett på nett
  const key = e.request.mode === "navigate" ? "./index.html" : e.request;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(key, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request).then(res => {
          if (res && res.ok) cache.put(key, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
