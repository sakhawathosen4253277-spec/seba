// Self-destroying service worker to fix Vercel white screen bundle caching issues
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.registration.unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach(client => {
        if (client.navigate) {
          client.navigate(client.url);
        }
      });
    });
});
