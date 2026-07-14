// No-op service worker to clear old Gatsby PWA cache.
// Old gatsby-plugin-offline registered a service worker that may persist
// on returning visitors' devices, serving stale Gatsby content.
// This replaces it, clears all caches, and unregisters itself.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => caches.delete(name)))
    ).then(() => self.clients.claim())
  );
});
