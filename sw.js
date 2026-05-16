const CACHE_NAME = 'fuel-reminder-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/recovery-reminder/')); // adjust path if needed
});

// ← THIS IS THE IMPORTANT PART
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Time for your reminder!',
    icon: '/recovery-reminder/icons/icon-192.png',   // make sure this exists
    badge: '/recovery-reminder/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: '/' },   // optional: open specific page on click
    requireInteraction: true   // keeps notification until user interacts
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Fuel & Recovery Reminder', options)
  );
});