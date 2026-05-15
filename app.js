const reminders = [
  { time: "05:30", text: "Take Collagen + Fat Flush" },
  { time: "06:00", text: "Take Collagen + Fat Flush" },
  { time: "08:30", text: "Breakfast + Protein Time" },
  { time: "09:00", text: "Breakfast + Protein Time" },
  { time: "11:30", text: "Fruit + Seeds Snack" },
  { time: "12:00", text: "Lunch + Protein + Omega" },
  { time: "13:00", text: "Lunch + Protein + Omega" },
  { time: "16:30", text: "Evening Snack" },
  { time: "19:30", text: "Dinner + Omega" },
  { time: "21:00", text: "Take Magnesium" }
];

const reminderList = document.getElementById("reminderList");
const nextReminderEl = document.getElementById("nextReminder");
const countdownEl = document.getElementById("countdown");

function renderReminders() {
  reminderList.innerHTML = "";

  reminders.forEach((reminder, index) => {
    const item = document.createElement("div");
    item.className = "reminder-item";

    item.innerHTML = `
      <div>
        <strong>${reminder.time}</strong>
        <p>${reminder.text}</p>
      </div>
      <input type="checkbox" id="check-${index}" />
    `;

    const checkbox = item.querySelector("input");

    checkbox.addEventListener("change", () => {
      item.classList.toggle("completed");
    });

    reminderList.appendChild(item);
  });
}

function getNextReminder() {
  const now = new Date();

  for (let reminder of reminders) {
    const [hours, minutes] = reminder.time.split(":");

    const reminderDate = new Date();
    reminderDate.setHours(hours);
    reminderDate.setMinutes(minutes);
    reminderDate.setSeconds(0);

    if (reminderDate > now) {
      return {
        ...reminder,
        date: reminderDate
      };
    }
  }

  return {
    ...reminders[0],
    date: new Date(now.getTime() + 24 * 60 * 60 * 1000)
  };
}

function updateNextReminder() {
  const next = getNextReminder();

  nextReminderEl.innerHTML = `
    ${next.time} - ${next.text}
  `;

  const diff = next.date - new Date();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownEl.textContent = `${hours}h ${minutes}m ${seconds}s remaining`;
}

setInterval(updateNextReminder, 1000);

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Notifications not supported");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    alert("Notifications Enabled");
  }
}

function sendNotification(title, body) {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.showNotification(title, {
          body,
          icon: "icons/icon-192.png",
          badge: "icons/icon-192.png",
          vibrate: [200, 100, 200],
          data: {
            url: window.location.href
          }
        });
      }
    });
  }
}

function scheduleNotifications() {
  setInterval(() => {
    const now = new Date();

    const currentTime = now.toTimeString().slice(0,5);

    reminders.forEach((reminder) => {
      if (reminder.time === currentTime) {
        sendNotification(
          "Fuel & Recovery Reminder",
          reminder.text
        );

        checkMatchDayNotification(currentTime);
      }
    });

    if (
      now.getDay() === 3 &&
      currentTime === "08:00"
    ) {
      sendNotification(
        "Vitamin D Reminder",
        "Take Vitamin D"
      );
    }

  }, 60000);
}

function getMatchDays() {
  return JSON.parse(localStorage.getItem("matchDays")) || [];
}

function saveMatchDays(days) {
  localStorage.setItem("matchDays", JSON.stringify(days));
}

function renderMatchDays() {
  const container = document.getElementById("matchDays");
  container.innerHTML = "";

  const days = getMatchDays();

  days.forEach((day, index) => {
    const div = document.createElement("div");
    div.className = "match-day-item";

    div.innerHTML = `
      <strong>${day}</strong>
      <button onclick="deleteMatchDay(${index})">
        Delete
      </button>
    `;

    container.appendChild(div);
  });
}

function deleteMatchDay(index) {
  const days = getMatchDays();
  days.splice(index, 1);
  saveMatchDays(days);
  renderMatchDays();
}

document.getElementById("addMatchBtn")
.addEventListener("click", () => {

  const date = document.getElementById("matchDate").value;

  if (!date) return;

  const days = getMatchDays();

  days.push(date);

  saveMatchDays(days);

  renderMatchDays();
});

function checkMatchDayNotification(time) {
  const today = new Date().toISOString().split("T")[0];

  const days = getMatchDays();

  if (
    days.includes(today) &&
    (time === "05:30" || time === "06:00")
  ) {
    sendNotification(
      "Match Day Essentials",
      `Carry:\n• Dark Chocolate\n• Pumpkin Seeds\n• Glucon-D\n• Fast&Up\n• Protein Shake`
    );
  }
}

document.getElementById("enableNotifications")
.addEventListener("click", requestNotificationPermission);

document.getElementById("testNotification")
.addEventListener("click", () => {
  sendNotification(
    "Test Notification",
    "Your reminder system is working"
  );
});

document.getElementById("toggleDarkMode")
.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker Registered"));
}

renderReminders();
renderMatchDays();
updateNextReminder();
scheduleNotifications();
