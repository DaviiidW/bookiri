self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Passthrough fetch handler: no offline caching, just satisfies PWA
// installability requirements (Chrome requires a registered fetch handler).
self.addEventListener("fetch", () => {});
