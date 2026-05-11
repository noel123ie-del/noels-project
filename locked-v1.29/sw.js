// Thrift Service Worker — self-uninstalling kill version
// The original SW was breaking routing. This version unregisters itself.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async (e) => {
  e.waitUntil((async () => {
    // Clear all caches
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    // Unregister this SW
    await self.registration.unregister();
    // Reload all clients
    const clients = await self.clients.matchAll();
    clients.forEach((c) => c.navigate(c.url));
  })());
});
