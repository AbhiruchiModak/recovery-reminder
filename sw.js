const CACHE_NAME='fuel-reminder-v2';

const urlsToCache=[
'/',
'/recovery-reminder/',
'/recovery-reminder/index.html',
'/recovery-reminder/styles.css',
'/recovery-reminder/app.js',
'/recovery-reminder/manifest.json'
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