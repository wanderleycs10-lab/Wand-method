// WAND METHOD: sem cache de páginas, autenticação ou respostas do Supabase.
const CACHE = 'wand-static-v1';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil((async () => { for(const key of await caches.keys()) if(key.startsWith('wand-')) await caches.delete(key); await self.clients.claim(); })()); });
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.mode === 'navigate' && new URL(req.url).origin === self.location.origin) {
    event.respondWith(fetch(req, {cache:'no-store'}));
  }
});
