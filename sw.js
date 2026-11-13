
// WAND METHOD — Service Worker existente + Web Push.
// Sem cache de dados do aluno.

const CACHE = 'wand-static-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('wand-')) {
        await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (
    req.mode === 'navigate' &&
    new URL(req.url).origin === self.location.origin
  ) {
    event.respondWith(fetch(req, { cache: 'no-store' }));
  }
});

self.addEventListener('push', event => {
  let data = {};

  try {
    data = event.data?.json() || {};
  } catch (e) {}

  if (data.type !== 'wand_descanso') return;

  const title = 'WAND METHOD · Descanso finalizado!';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: 'Seu intervalo terminou. Volte para a próxima série! 💪',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'wand-descanso-' + String(data.alert_id || ''),
      renotify: true,
      data: {
        url: new URL(
          './aluno.html#treinos',
          self.registration.scope
        ).href
      },
      vibrate: [250, 120, 250]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = new URL(
    './aluno.html#treinos',
    self.registration.scope
  ).href;

  event.waitUntil((async () => {
    const list = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    const existing = list.find(c =>
      new URL(c.url).origin === self.location.origin &&
      new URL(c.url).pathname.endsWith('/aluno.html')
    );

    if (existing) {
      await existing.focus();
      await existing.navigate(url);
      return;
    }

    await self.clients.openWindow(url);
  })());
});
