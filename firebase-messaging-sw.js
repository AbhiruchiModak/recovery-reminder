// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyB3L0F4Ffj2Y371yJmAscQoqK1tQ5wXOsY",
    authDomain: "recovery-reminder-399a1.firebaseapp.com",
    projectId: "recovery-reminder-399a1",
    storageBucket: "recovery-reminder-399a1.firebasestorage.app",
    messagingSenderId: "912324624878",
    appId: "1:912324624878:web:9cd0c48bfe52f03520ceff",
    measurementId: "G-E29ZK3GQPE"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Fuel & Recovery Reminder';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Time for your reminder!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { url: '/' }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});