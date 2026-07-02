// Minimalny Service Worker — wymagany przez przeglądarki, żeby uznać
// stronę za instalowalną Progressive Web App (PWA).
// Nie cache'uje danych (plan pracy, repertuar, notatki mają zawsze być
// świeże, pobierane na żywo z Apps Script), służy wyłącznie do spełnienia
// wymogu instalowalności.

const CACHE_NAME = 'plan-pracy-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategia: network-first dla wszystkiego. Dane (Apps Script) mają być
// zawsze świeże. Tylko gdy sieć całkowicie zawiedzie (np. brak internetu
// przy starcie), spróbuj zwrócić zcache'owaną powłokę aplikacji.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
    )
  );
});
