/* e-Kehadiran PPKI: only cache the public static application shell.
   NEVER intercept or cache Supabase/API requests or student data. */
const SHELL_CACHE = 'ppki-shell-2026-v1';
const APP_URL = new URL('./app.html', self.registration.scope).href;
const STATIC_URLS = [
  APP_URL,
  new URL('./pwa-icon.svg', self.registration.scope).href,
  new URL('./e_kehadiran_manifest.webmanifest', self.registration.scope).href
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(STATIC_URLS);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('ppki-shell-') && k !== SHELL_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate' || request.url !== APP_URL) return;
  event.respondWith(
    fetch(request, {cache:'no-store'}).then(response => {
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.put(APP_URL,copy)));}
      return response;
    }).catch(() => caches.match(APP_URL))
  );
});
