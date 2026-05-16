
// function isTodayMatchDay(){

// const today = new Date()
// .toISOString()
// .split('T')[0];

// const days = getMatchDays();

// return days.includes(today);

// }

function renderReminders(){

const reminderList = document.getElementById('reminderList');

reminderList.innerHTML = '';

const matchDay = isTodayMatchDay();

reminders.forEach((reminder,index)=>{

const item = document.createElement('div');

item.className = 'reminder-item';

let reminderText = reminder.text;

/* MATCH DAY MORNING REMINDER */
console.log('Reminder Time:', reminder.time);

if(
matchDay &&
(reminder.time === '05:30' || reminder.time === '06:00')
){

reminderText = `Take Collagen + Fat Flush

Carry:
• Dark Chocolate
• Pumpkin Seeds
• Glucon-D
• Fast&Up
• Protein Shake`;

}

/* WEDNESDAY VITAMIN D */

const now = new Date();

if(
now.getDay() === 3 &&
reminder.time === '08:00'
){

reminderText = `Breakfast + Protein Time
Take Vitamin D`;

}

item.innerHTML = `
<strong>${reminder.time}</strong>
<p style="white-space: pre-line;">
${reminderText}
</p>
<input type="checkbox">
`;

item.querySelector('input')
.addEventListener('change',()=>{

item.classList.toggle('completed');

});

reminderList.appendChild(item);

});

}
