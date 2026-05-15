
let isAdmin = false;

const MATCH_DAYS_KEY = 'globalMatchDays';

const USERS = {
admin:{
password:'admin123',
role:'admin'
},
user:{
password:'user123',
role:'user'
}
};

const reminders = [
{ time:'05:30', text:'Take Collagen + Fat Flush' },
{ time:'06:00', text:'Take Collagen + Fat Flush' },
{ time:'08:30', text:'Breakfast + Protein Time' },
{ time:'09:00', text:'Breakfast + Protein Time' },
{ time:'11:30', text:'Fruit + Seeds Snack' },
{ time:'12:00', text:'Lunch + Protein + Omega' },
{ time:'13:00', text:'Lunch + Protein + Omega' },
{ time:'16:30', text:'Evening Snack' },
{ time:'19:30', text:'Dinner + Omega' },
{ time:'21:00', text:'Take Magnesium' }
];

function login(){

const username=document.getElementById('username').value;
const password=document.getElementById('password').value;

if(!USERS[username]){
alert('Invalid Username');
return;
}

if(USERS[username].password !== password){
alert('Invalid Password');
return;
}

localStorage.setItem('loggedInUser',username);
localStorage.setItem('role',USERS[username].role);

isAdmin = USERS[username].role === 'admin';

initializeApp();

}

function logout(){
localStorage.removeItem('loggedInUser');
localStorage.removeItem('role');
location.reload();
}

function initializeApp(){

renderReminders();
renderMatchDays();
showSection('dashboard');
scheduleNotifications();

if(!isAdmin){
document.getElementById('adminControls').style.display='none';
}

document.getElementById('loginScreen').style.display='none';

}

function renderReminders(){

const reminderList=document.getElementById('reminderList');
reminderList.innerHTML='';

reminders.forEach((reminder,index)=>{

const item=document.createElement('div');
item.className='reminder-item';

item.innerHTML=`
<strong>${reminder.time}</strong>
<p>${reminder.text}</p>
<input type="checkbox">
`;

item.querySelector('input').addEventListener('change',()=>{
item.classList.toggle('completed');
});

reminderList.appendChild(item);

});

}

function getMatchDays(){
return JSON.parse(localStorage.getItem(MATCH_DAYS_KEY)) || [];
}

function saveMatchDays(days){
localStorage.setItem(MATCH_DAYS_KEY,JSON.stringify(days));
}

function renderMatchDays(){

const container=document.getElementById('matchDays');
container.innerHTML='';

const days=getMatchDays();

days.forEach((day,index)=>{

const div=document.createElement('div');

if(isAdmin){

div.innerHTML=`
<div class="reminder-item">
<strong>${day}</strong>
<button onclick="deleteMatchDay(${index})">Delete</button>
</div>
`;

}else{

div.innerHTML=`
<div class="reminder-item">
<strong>${day}</strong>
</div>
`;

}

container.appendChild(div);

});

}

function deleteMatchDay(index){

const days=getMatchDays();
days.splice(index,1);

saveMatchDays(days);
renderMatchDays();

}

document.getElementById('addMatchBtn').addEventListener('click',()=>{

const date=document.getElementById('matchDate').value;

if(!date)return;

const days=getMatchDays();

if(!days.includes(date)){
days.push(date);
}

saveMatchDays(days);

renderMatchDays();

});

function sendNotification(title,body){

if(Notification.permission === 'granted'){

navigator.serviceWorker.getRegistration().then(reg=>{

if(reg){

reg.showNotification(title,{
body,
icon:'icons/icon-192.png',
badge:'icons/icon-192.png',
vibrate:[200,100,200],
requireInteraction:true
});

}

});

}

}

async function requestNotificationPermission(){
await Notification.requestPermission();
}

/* FIXED MATCH DAY LOGIC */

function isTodayMatchDay(){

const today = new Date().toISOString().split('T')[0];

const days = getMatchDays();

return days.includes(today);

}

function scheduleNotifications(){

setInterval(()=>{

const now = new Date();
const currentTime = now.toTimeString().slice(0,5);

reminders.forEach(reminder=>{

if(reminder.time===currentTime){

/* MATCH DAY MORNING NOTIFICATION */

if(
isTodayMatchDay() &&
(currentTime === '05:30' || currentTime === '06:00')
){

sendNotification(
'Fuel & Match Day Reminder',
`Take Collagen + Fat Flush

Carry:
• Dark Chocolate
• Pumpkin Seeds
• Glucon-D
• Fast&Up
• Protein Shake`
);

} else {

sendNotification(
'Fuel & Recovery Reminder',
reminder.text
);

}

}

});

/* WEDNESDAY VITAMIN D */

if(now.getDay()===3 && currentTime==='08:00'){

sendNotification(
'Breakfast + Vitamin D',
'Breakfast + Protein Time\nTake Vitamin D'
);

}

},60000);

}

function showSection(sectionId){

const sections=document.querySelectorAll('main section');

sections.forEach(section=>{
section.style.display='none';
});

document.getElementById(sectionId).style.display='block';

}

document.getElementById('enableNotifications')
.addEventListener('click',requestNotificationPermission);

document.getElementById('testNotification')
.addEventListener('click',()=>{

if(isTodayMatchDay()){

sendNotification(
'Fuel & Match Day Reminder',
`Take Collagen + Fat Flush

Carry:
• Dark Chocolate
• Pumpkin Seeds
• Glucon-D
• Fast&Up
• Protein Shake`
);

}else{

sendNotification(
'Test Notification',
'Notifications Working'
);

}

});

document.getElementById('toggleDarkMode')
.addEventListener('click',()=>{
document.body.classList.toggle('dark-mode');
});

if('serviceWorker' in navigator){
navigator.serviceWorker.register('sw.js');
}

const savedUser = localStorage.getItem('loggedInUser');
const savedRole = localStorage.getItem('role');

if(savedUser && savedRole){

isAdmin = savedRole === 'admin';

initializeApp();

}
