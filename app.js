let isAdmin = false;

const MATCH_DAYS_KEY = 'globalMatchDays';

const USERS = {
  admin: { password: 'admin123', role: 'admin' },
  user: { password: 'user123', role: 'user' }
};

const reminders = [
  { time: '05:30', text: 'Take Collagen + Fat Flush' },
  { time: '06:00', text: 'Take Collagen + Fat Flush' },
  { time: '08:30', text: 'Breakfast + Protein Time' },
  { time: '09:00', text: 'Breakfast + Protein Time' },
  { time: '11:30', text: 'Fruit + Seeds Snack' },
  { time: '12:00', text: 'Lunch + Protein + Omega' },
  { time: '13:00', text: 'Lunch + Protein + Omega' },
  { time: '16:30', text: 'Evening Snack' },
  { time: '19:30', text: 'Dinner + Omega' },
  { time: '21:00', text: 'Take Magnesium' }
];

// ==================== FIREBASE FCM SETUP ====================
const firebaseConfig = {
  apiKey: "AIzaSyB3L0F4Ffj2Y371yJmAscQoqK1tQ5wXOsY",
  authDomain: "recovery-reminder-399a1.firebaseapp.com",
  projectId: "recovery-reminder-399a1",
  storageBucket: "recovery-reminder-399a1.firebasestorage.app",
  messagingSenderId: "912324624878",
  appId: "1:912324624878:web:9cd0c48bfe52f03520ceff"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

let currentToken = null;

// Request permission and get FCM token (Best for Mobile)
// Request permission and get FCM token
async function requestNotificationPermission() {
  try {
    console.log("Requesting notification permission...");

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert("❌ Notification permission denied");
      return;
    }

    // Use relative path (no leading slash) - better for GitHub Pages
    const swRegistration = await navigator.serviceWorker.register('firebase-messaging-sw.js');
    console.log("✅ Firebase Messaging SW registered");

    // Get FCM Token
    currentToken = await messaging.getToken({
      vapidKey: ' BDsGaG5NgghU_4NcapvznUTVxwgY0ciAOXncI7kTHQWSMlHp_HJCzo2zFkTUpWuKZqme7L8JU_433MNpRJ-jD0E ',
      serviceWorkerRegistration: swRegistration
    });

    if (currentToken) {
      console.log("✅ FCM Token:", currentToken);
      localStorage.setItem('fcmToken', currentToken);
      alert("✅ Push notifications enabled successfully!\n\nToken saved.");
    } else {
      alert("⚠️ Failed to generate token");
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
    alert("Failed to enable notifications.\n\nCheck if 'firebase-messaging-sw.js' is uploaded correctly.");
  }
}

// ==================== CORE APP FUNCTIONS ====================

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!USERS[username]) return alert('Invalid Username');
  if (USERS[username].password !== password) return alert('Invalid Password');

  localStorage.setItem('loggedInUser', username);
  localStorage.setItem('role', USERS[username].role);
  isAdmin = USERS[username].role === 'admin';

  initializeApp();
}

function logout() {
  localStorage.clear();
  location.reload();
}

function initializeApp() {
  if ('serviceWorker' in navigator) {
    // Register regular caching SW
    navigator.serviceWorker.register('firebase-messaging-sw.js')
      .then(reg => console.log('✅ firebase SW registered'))
      .catch(err => console.error('SW failed', err));

    // Also register caching SW
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('✅ Caching SW registered'))
      .catch(err => console.error('Caching SW failed', err));
  }

  renderReminders();
  renderMatchDays();
  showSection('dashboard');
  scheduleNotifications();

  if (!isAdmin) {
    const adminControls = document.getElementById('adminControls');
    if (adminControls) adminControls.style.display = 'none';
  }

  document.getElementById('loginScreen').style.display = 'none';
}

// Rest of your functions (renderReminders, match days, etc.) remain the same
function renderReminders() {
  const reminderList = document.getElementById('reminderList');
  reminderList.innerHTML = '';

  const matchDay = isTodayMatchDay();

  reminders.forEach(reminder => {
    const item = document.createElement('div');
    item.className = 'reminder-item';

    let reminderText = reminder.text;

    if (matchDay && (reminder.time === '05:30' || reminder.time === '06:00')) {
      reminderText = `Take Collagen + Fat Flush\n\nCarry:\n• Dark Chocolate\n• Pumpkin Seeds\n• Glucon-D\n• Fast&Up\n• Protein Shake`;
    }

    const now = new Date();
    if (now.getDay() === 3 && reminder.time === '08:00') {
      reminderText = `Breakfast + Protein Time\nTake Vitamin D`;
    }

    item.innerHTML = `
            <strong>${reminder.time}</strong>
            <p style="white-space: pre-line;">${reminderText}</p>
            <input type="checkbox">
        `;

    item.querySelector('input').addEventListener('change', () => {
      item.classList.toggle('completed');
    });

    reminderList.appendChild(item);
  });
}

function getMatchDays() {
  return JSON.parse(localStorage.getItem(MATCH_DAYS_KEY)) || [];
}

function saveMatchDays(days) {
  localStorage.setItem(MATCH_DAYS_KEY, JSON.stringify(days));
}

function renderMatchDays() {
  const container = document.getElementById('matchDays');
  container.innerHTML = '';

  getMatchDays().forEach((day, index) => {
    const div = document.createElement('div');
    div.innerHTML = isAdmin ?
      `<div class="reminder-item"><strong>${day}</strong><button onclick="deleteMatchDay(${index})">Delete</button></div>` :
      `<div class="reminder-item"><strong>${day}</strong></div>`;
    container.appendChild(div);
  });
}

function deleteMatchDay(index) {
  const days = getMatchDays();
  days.splice(index, 1);
  saveMatchDays(days);
  renderMatchDays();
}

document.getElementById('addMatchBtn').addEventListener('click', () => {
  const date = document.getElementById('matchDate').value;
  if (!date) return;
  const days = getMatchDays();
  if (!days.includes(date)) {
    days.push(date);
    saveMatchDays(days);
    renderMatchDays();
  }
});

function isTodayMatchDay() {
  const today = new Date().toISOString().split('T')[0];
  return getMatchDays().includes(today);
}

// Foreground notification (in-app)
function sendNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    });
  }
}

function scheduleNotifications() {
  setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    reminders.forEach(reminder => {
      if (reminder.time === currentTime) {
        const isMatchDay = isTodayMatchDay();
        if (isMatchDay && (currentTime === '05:30' || currentTime === '06:00')) {
          sendPushNotification('Fuel & Match Day Reminder',
            `Take Collagen + Fat Flush\n\nCarry: Dark Chocolate, Pumpkin Seeds, Glucon-D, Fast&Up, Protein Shake`);
        } else {
          sendPushNotification('Fuel & Recovery Reminder', reminder.text);
        }
      }
    });

    if (now.getDay() === 3 && currentTime === '08:00') {
      sendPushNotification('Breakfast + Vitamin D', 'Breakfast + Protein Time\nTake Vitamin D');
    }
  }, 60000);
}

function showSection(sectionId) {
  document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
}

// ==================== EVENT LISTENERS ====================
document.getElementById('enableNotifications').addEventListener('click', requestNotificationPermission);

document.getElementById('testNotification').addEventListener('click', () => {
  if (isTodayMatchDay()) {
    sendPushNotification('Fuel & Match Day Reminder', `Take Collagen + Fat Flush\n\nCarry items ready!`);
  } else {
    sendPushNotification('Test Notification', 'Push notifications are working on your phone!');
  }
});

document.getElementById('toggleDarkMode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Auto login
const savedUser = localStorage.getItem('loggedInUser');
const savedRole = localStorage.getItem('role');

if (savedUser && savedRole) {
  isAdmin = savedRole === 'admin';
  initializeApp();
}


// Simple version - works without Cloud Functions
async function sendPushNotification(title, body) {
  try {
    const token = localStorage.getItem('fcmToken');

    // Fallback to local notification if no token
    if (!token) {
      console.warn("No FCM token found - showing local notification");
      sendNotification(title, body);
      return;
    }

    // For now, just show local notification (we'll use Console for real push)
    sendNotification(title, body);

    console.log(`📱 Notification triggered: ${title}`);
    console.log(`💡 Use Firebase Console to send real push to token: ${token}`);

  } catch (error) {
    console.error("Notification error:", error);
    sendNotification(title, body); // fallback
  }
}