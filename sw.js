const CACHE_NAME='fuel-reminder-v1';

const urlsToCache=[
'/',
'/index.html',
'/styles.css',
'/app.js',
'/manifest.json'
];

self.addEventListener('install',event=>{
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache=>cache.addAll(urlsToCache))
);
});

self.addEventListener('fetch',event=>{
event.respondWith(
caches.match(event.request)
.then(response=>response || fetch(event.request))
);
});

self.addEventListener('notificationclick',event=>{
event.notification.close();
event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Reminder', {
      body: data.body || 'Time to refuel!',
      icon: '/recovery-reminder/icon.png'
    })
  );
});


// function sendNotification(title,body){

// if(Notification.permission === 'granted'){

// navigator.serviceWorker.getRegistration().then(reg=>{

// if(reg){

// reg.showNotification(title,{
// body,
// icon:'icons/icon-192.png',
// badge:'icons/icon-192.png',
// });

// }

// });

// }

// }