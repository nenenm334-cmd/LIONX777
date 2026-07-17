/* Minbar service worker v5 — offline shell without intercepting manifest/api. */

const VERSION = 'minbar-v6';
const SHELL_CACHE = `minbar-shell-${VERSION}`;
const RUNTIME_CACHE = `minbar-runtime-${VERSION}`;

const SHELL_URLS = ['/', '/index.html', '/icon.svg', '/icon-192.png', '/icon-512.png', '/manifest.json', '/robots.txt'];

function offlineResponse() {
  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

function shouldBypass(req) {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return true;
  if (url.pathname === '/manifest.json') return true;
  if (url.pathname === '/sw.js') return true;
  return false;
}

async function cacheAddSafe(cache, url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (res.ok && res.type === 'basic') await cache.put(url, res);
  } catch (err) {
    console.warn('[SW] precache skipped:', url, err);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.all(SHELL_URLS.map((url) => cacheAddSafe(cache, url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => { clients.forEach((c) => c.postMessage({ type: 'SW_UPDATED' })); })
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (shouldBypass(req)) return;

  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match('/index.html');
      try {
        const res = await fetch(req);
        if (res.ok && res.type === 'basic') cache.put('/index.html', res.clone());
        return res;
      } catch (_) {
        return cached || offlineResponse();
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      try {
        const res = await fetch(req);
        if (res.ok && res.type === 'basic') cache.put(req, res.clone());
        return res;
      } catch (_) {
        return cached || offlineResponse();
      }
    })());
    return;
  }

  if (['font', 'image', 'style'].includes(req.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch (_) {
        return cached || offlineResponse();
      }
    })());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if ('focus' in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow('/');
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION' && self.registration?.showNotification) {
    const { title, body, tag, icon } = data;
    self.registration.showNotification(title || 'Minbar', {
      body: body || '',
      tag: tag || 'minbar',
      icon: icon || '/icon.svg',
      badge: '/icon.svg',
      renotify: true,
    });
  }
});
