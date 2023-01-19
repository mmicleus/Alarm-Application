const buttonContainer = document.querySelector(".button-container");
const outerContainer = document.querySelector(".container");
const alarmContainer = document.querySelector(".alarm-container");
const plusButton = document.querySelector(".plus-button");
const view1 = document.getElementById("view-1");
const view2 = document.getElementById("view-2");
const hourSelect = document.querySelector(".hour-selector");
const minuteSelect = document.querySelector(".minute-selector");
const nameSelect = document.querySelector(".alarm-name");
const dateSelect = document.querySelector(".date-selector");
const weekdays = document.querySelectorAll(".days-of-week button");
const dateDisplay = document.querySelector(".date-display");
const saveButton = document.querySelector("button.save");
const cancelButton = document.querySelector(".cancel");
const display1 = document.querySelector(".display-1");
const display2 = document.querySelector(".display-2");
const daysDisplay = display1.querySelector(".daysDisplay");
const hoursDisplay = display1.querySelector(".hoursDisplay");
const minutesDisplay = display1.querySelector(".minutesDisplay");
const nextTriggerTimeDisplay = display1.querySelector(".nextTriggerTime");


plusButton.addEventListener('click',addAlarm);
hourSelect.addEventListener('change',hourChanged);
minuteSelect.addEventListener('change',minutesChanged);
dateSelect.addEventListener('change',dateChanged);
nameSelect.addEventListener('change',setAlarmName);
plusButton.addEventListener('click',addAlarm);
saveButton.addEventListener('click',saveAlarm);
cancelButton.addEventListener('click',cancel);
weekdays.forEach((day) => {
    day.addEventListener('click',toggleWeekday);
})

//Other variables
let alarmIndex = null;
let dateSelected = false;




//Model
const defaultAlarm = {
    hour: 13,
    minute:0,
     date:null,
    // date:new Date(2023, 11, 31),
    days_of_week:[false,false,false,false,false,false,false],
    name:null,
    nextTriggerTime:null
}

let alarm = createAlarmCopy(defaultAlarm);

let alarms = [];
let upcomingAlarms = [];


function removeCurrentAlarm(){
    if(alarmIndex || alarmIndex === 0){
        alarms.splice(alarmIndex,1);
    }
}

function updateUpcomingAlarms(upcomingAlarms){
    upcomingAlarms.forEach((item) => {
        if(item.date){
            item.date = getTomorrow(item.date);
            calculateNextTriggerTime(item);
        }
        else{
            calculateNextTriggerTime(item);
        }
        console.log(item.nextTriggerTime);
    })
}

//Utility functions


function returnDayNames(days){
    let mapping = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

    let remainingDays = mapping.filter((day,index) => {
        return days[index];
    });

    return "Every " + remainingDays.join(",");
}

function formatDate(date){
    // const mapping = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const mapping = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const month_names_short =  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return mapping[date.getDay()] + ", " + date.getDate() + " " + month_names_short[date.getMonth()];
}

function formatAlarm(alarm){
    
    const hours = addZero(alarm.nextTriggerTime.getHours());
    const minutes = addZero(alarm.nextTriggerTime.getMinutes());

    return formatDate(alarm.nextTriggerTime) + `, ${hours}:${minutes}`;
}

function isItToday(alarm){
    const alarmHour = alarm.hour;
    const currentHour = new Date().getHours()
    const alarmMinutes = alarm.minute;
    const currentMinutes = new Date().getMinutes();

    if(currentHour < alarmHour){
        return true;
    }
    else if(currentHour === alarmHour)
    {
        if(currentMinutes < alarmMinutes){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

function addZero(num){
    let number;

    if(typeof(num) === "string")
    {
        number = parseInt(num,10);
    }
    else{
        number = num;
    }
    
    if(number >= 10)
        return number;
    else{
        return "0" + num;
    }
}

function validateHour(value){
    let num = parseInt(value,10);

    if(num > 23) num = 0;
    else if(num < 0) num = 23;

    return addZero(num);
}


function validateMinutes(value){
    let num = parseInt(value,10);

    if(num > 59) num = 0;
    else if(num < 0) num = 59;

    return addZero(num);
}

function isSameDay(date){
    const today = new Date();

    if((today.getFullYear() === date.getFullYear()) && (today.getMonth() === date.getMonth()) && (today.getDate() === date.getDate())){
        return true;
    }

    return false;

}

function isTomorrow(date) {

    const tomorrow = new Date();
  
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    return date.toDateString() === tomorrow.toDateString();
  
  }

  function getTomorrow(date){
    const tomorrow = date;
  
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    return tomorrow;
  }

  function getNthDay(date,n){
    const tomorrow = date;
  
    tomorrow.setDate(tomorrow.getDate() + n);
  
    return tomorrow;
  }

  function getDateByTime(){
    if(isItToday(alarm)){
        return new Date();
    }
    else{
        return getTomorrow(new Date());
    }
  }

  function createAlarmCopy(alrm){
    const aux = JSON.parse(JSON.stringify(alrm));
    aux.date = new Date(Date.parse(aux.date));

    return aux;
  }

  function reset(){
    alarmIndex = null;
    dateSelected = false;
  }

  function getCorrectWeekdayIndex(){
    let wrongIndex = new Date().getDay();

    // console.log(wrongIndex);

    if(wrongIndex === 0){
        return 6;
    }
    else{
        return wrongIndex - 1;
    }
    
}

function computeDaysLeft(){
    let dayIndex = getCorrectWeekdayIndex();
    let i = dayIndex;
    let offset = 0;
    let tab = [0,0,0,0,0,0,0];


    do{

        
        i+=1;
        if(i == 7) i = 0;

        offset+=1;
        tab[i] = offset;

    }while(i != dayIndex);

    return tab;
}

function computeDaysTillNextTrigger(alarm,daysLeftArray){
    let minDays = 8;

    for(let i = 0;i < 7;i++){
        if((alarm.days_of_week[i] === true) && (daysLeftArray[i] < minDays)) {
            minDays = daysLeftArray[i];
        }
    }

    return minDays;
}

  function calculateNextTriggerTime2(alarm){
    const weekdayIndex = getCorrectWeekdayIndex();
    

    if(alarm.days_of_week[weekdayIndex]){
        if(isItToday(alarm)){
            alarm.nextTriggerTime = new Date(new Date().setHours(alarm.hour,alarm.minute,0,0));
            return;
        }
    }

    const daysLeftArray = computeDaysLeft();

    const daysTillNextTrigger = computeDaysTillNextTrigger(alarm,daysLeftArray);

    const dayOfNextTrigger = getNthDay(new Date(),daysTillNextTrigger);

    alarm.nextTriggerTime = new Date(dayOfNextTrigger.setHours(alarm.hour,alarm.minute,0,0));
  }


  function calculateNextTriggerTime(alarm){
    if(alarm.date){
        alarm.nextTriggerTime = new Date(alarm.date.getFullYear(),alarm.date.getMonth(),alarm.date.getDate(),alarm.hour,alarm.minute,0,0);
    }
    else{
        calculateNextTriggerTime2(alarm);
    }
  }


  function sortAlarms(a1,a2){
    if(a1.hour > a2.hour){
        return 1;
    }
    else if(a1.hour < a2.hour){
        return -1;
    }
    else{
            if(a1.minute > a2.minute){
                return 1;
            }
            else if(a1.minute < a2.minute){
                return -1;
            }
            else{
                if(a1.nextTriggerTime > a2.nextTriggerTime){
                    return 1;
                }
                else if(a1.nextTriggerTime < a2.nextTriggerTime){
                    return -1;
                }
                else{
                    return 0
                }
            }
    }
}

function getUpcomingAlarms(alarms){
    upcomingAlarms = [];
    let minimumTriggerTime = alarms[0].nextTriggerTime.getTime();

    alarms.forEach((item) => {
        if(item.nextTriggerTime.getTime() < minimumTriggerTime){
            minimumTriggerTime = item.nextTriggerTime.getTime();
        }
    })

    alarms.forEach((item) => {
        if(item.nextTriggerTime.getTime() == minimumTriggerTime){
            upcomingAlarms.push(item);
        }
    })
}

function resetRemainingTimeDisplay(){
    display1.classList.remove("visible");
    display2.classList.remove("visible");
    daysDisplay.classList.remove("visible-span");
    hoursDisplay.classList.remove("visible-span");
    minutesDisplay.classList.remove("visible-span");

}


function getDays(remainingTime){
    let millisecondsInDay = 86400000;

    return Math.floor(remainingTime / millisecondsInDay);
}

function getHours(remainingTime){
    let millisecondsInDay = 86400000;
    let millisecondsInHour = 3600000;
    let remainingMillisecs = remainingTime % millisecondsInDay;

    return Math.floor(remainingMillisecs / millisecondsInHour);
}

function getMinutes(remainingTime){
    let millisecondsInHour = 3600000;
    let millisecondsInMinutes = 60000;
    let remainingMillisecs = remainingTime % millisecondsInHour;

    return Math.ceil(remainingMillisecs / millisecondsInMinutes);
}

// function getDays(remainingTime){
//     let millisecondsInDay = 86400000;

//     return Math.floor(remainingTime / millisecondsInDay);
// }

// function getHours(remainingTime){
//     let millisecondsInDay = 86400000;
//     let millisecondsInHour = 3600000;
//     let remainingMillisecs = remainingTime % millisecondsInDay;

//     return Math.floor(remainingMillisecs / millisecondsInHour);
// }

// function getMinutes(remainingTime){
//     let millisecondsInHour = 3600000;
//     let millisecondsInMinutes = 60000;
//     let remainingMillisecs = remainingTime % millisecondsInHour;

//     return Math.floor(remainingMillisecs / millisecondsInMinutes);
// }



//View

function displayRemainingTime(upcomingAlarms){

    resetRemainingTimeDisplay();

    if(upcomingAlarms.length === 0){
        display2.classList.add("visible");
        display2.innerText="All alarms are off";
    }
    else{
        let remainingTime = upcomingAlarms[0].nextTriggerTime.getTime() - new Date().getTime();
        let remainingDays = getDays(remainingTime);
        let remainingHours = getHours(remainingTime);
        let remainingMinutes = getMinutes(remainingTime);

        //populate nextTriggerTimeDisplay
        nextTriggerTimeDisplay.innerText = formatAlarm(upcomingAlarms[0]);

        display1.classList.add("visible");
        if(remainingDays > 0){
            daysDisplay.classList.add("visible-span");
            daysDisplay.querySelector('span').innerText = remainingDays;
        }
        else{
            if(remainingHours > 0){
                hoursDisplay.classList.add("visible-span");
                hoursDisplay.querySelector('span').innerText = remainingHours;
            }

            if(remainingMinutes > 0){
                minutesDisplay.classList.add("visible-span");
                minutesDisplay.querySelector('span').innerText = remainingMinutes;
            }
        }
    }


}



function renderAlarms(){
    let content;
    let dayAbbrev = ["M","T","W","T","F","S","S"];
    let elements=[];

    const htmlAlarms = alarms.map((item,index) => {

        if(item.date){
            content = formatDate(item.date);
        }
        else{
            elements = [];
            for(let i = 0;i < 7;i++)
            {
                
                let htmlElem;
                if(item.days_of_week[i]){
                    htmlElem = `<span class="day selected">${dayAbbrev[i]}</span>`;
                }
                else{
                    htmlElem = `<span class="day">${dayAbbrev[i]}</span>`;
                }
                elements.push(htmlElem);
            }

            content = elements.join("");
        }


        return `<div class="alarm" data-id=${index}>
        <span class="time-container"> <span class="hours">${addZero(item.hour)}</span>:<span class="minutes">${addZero(item.minute)}</span> </span>
        <span class="right-container"><span class="date">${content}</span>
        <label class="switch">
            <input type="checkbox" checked>
            <span class="slider round"></span>
          </label>
        </span>
    </div>`;
    });

    alarmContainer.innerHTML = htmlAlarms.join("");
}


function insertAlarmData(){

    hourSelect.value = addZero(alarm.hour);
    minuteSelect.value = addZero(alarm.minute);

    weekdays.forEach((day,index)=>{
        if(alarm.days_of_week[index]){
            day.classList.add("active");
        }
        else{
            day.classList.remove("active");
        }
    })

    if(alarm.date){
        if(isSameDay(alarm.date)){
            dateDisplay.innerText = "Today-" + formatDate(alarm.date);
            dateSelected = false;
        }
        else if(isTomorrow(alarm.date)){
            dateDisplay.innerText = "Tomorrow-" + formatDate(alarm.date);
        }
        else{
            dateDisplay.innerText = formatDate(alarm.date);
        }
    }
    else if(alarm.days_of_week.includes(true)){
        dateDisplay.innerText = returnDayNames(alarm.days_of_week);
        weekdays.forEach((day,index)=>{
            if(alarm.days_of_week[index]){
                day.classList.add("active");
            }
        })
    }
    // else{
    //     let today = isItToday(alarm);

    //     if(today){
    //         dateDisplay.innerText = "Today-" + formatDate(new Date()); 
    //     }
    //     else{
    //         // Create new Date instance
    //             var date = new Date()

    //             // Add a day
    //             date.setDate(date.getDate() + 1)
    //             dateDisplay.innerText = "Tomorrow-" + formatDate(date);
    //     }
    // }
}

function updateWeekdaysView(){

    alarm.days_of_week.forEach((day,index) => {
        if(day){
            weekdays[index].classList.add("active");
        }
        else{
            weekdays[index].classList.remove("active");
        }
    })
}


function swapViews(){
    dateSelected = false;

    if(view1.classList.contains("show-view")){
        view1.classList.remove("show-view");
        view2.classList.add("show-view");
    }
    else{
        view1.classList.add("show-view");
        view2.classList.remove("show-view");
    }
}




// Controller


function hourChanged(){

    hourSelect.value = validateHour(hourSelect.value);
    alarm.hour = parseInt(hourSelect.value,10);
    if(!dateSelected && !alarm.days_of_week.includes(true)){
        if(isItToday(alarm)){
            alarm.date = new Date();
        }
        else{
            alarm.date = getTomorrow(new Date());

        }
    }
    insertAlarmData();
}

function minutesChanged(){
    minuteSelect.value = validateMinutes(minuteSelect.value);
    alarm.minute = parseInt(minuteSelect.value,10);

    if(!dateSelected && !alarm.days_of_week.includes(true)){
        if(isItToday(alarm)){
            alarm.date = new Date();
        }
        else{
            alarm.date = getTomorrow(new Date());
        }
    }

    insertAlarmData();
}

function dateChanged(){
    dateSelected = true;
    alarm.date = new Date(Date.parse(dateSelect.value));
    alarm.days_of_week = alarm.days_of_week.map((day) => {
        return false;
    })

    updateWeekdaysView();
    insertAlarmData();
}

function setAlarmName(){
    let name = nameSelect.value;

    if(name){
        alarm.name = name;
    }
    else{
        alarm.name = null;
    }
}


function toggleWeekday(e){
    const element = e.currentTarget;
    const dayId = parseInt(element.dataset.id,10);

    alarm.date = null;
    dateSelected = false;

    if(element.classList.contains("active")){
        alarm.days_of_week[dayId] = false;
        if(!alarm.days_of_week.includes(true)){
            alarm.date = getDateByTime();
        }
    }
    else{
        alarm.days_of_week[dayId] = true;
    }

    updateWeekdaysView();
    insertAlarmData();
}

function addAlarm(){
    alarm = createAlarmCopy(defaultAlarm);
    alarmIndex = null;
    dateSelected = false;
    insertAlarmData();
    hourChanged();
    minutesChanged();
    // insertAlarmData(defaultAlarm);
    // view1.classList.remove("show-view");
    // view2.classList.add("show-view");
    swapViews();
}

function addListeners(){
    const htmlAlarms = document.querySelectorAll(".alarm-container .alarm");

    htmlAlarms.forEach((item) => {
        item.addEventListener('click',loadAlarm);
    })
}


function saveAlarm(){

    //remove the alarms[index] from the array
    removeCurrentAlarm();

    calculateNextTriggerTime(alarm);
    console.log(alarm.nextTriggerTime)
    alarms.push(alarm);
    alarms.sort(sortAlarms);
    getUpcomingAlarms(alarms);
    displayRemainingTime(upcomingAlarms);
    console.log("Alarms:")
    console.log(upcomingAlarms);


    renderAlarms();
    addListeners();
    swapViews();
}

function cancel(){
    reset();
    swapViews();
}



function loadAlarm(e){
    dateSelected = false;
    alarmIndex = parseInt(e.currentTarget.dataset.id,10);
    
    // alarm = JSON.parse(JSON.stringify(alarms[alarmIndex]));
    // alarm.date = new Date(Date.parse(alarm.date));

    alarm = createAlarmCopy(alarms[alarmIndex]);
    console.log(alarm);
    insertAlarmData();
    hourChanged();
    minutesChanged();
    swapViews();
}

function timesMatch(upcomingAlarm){
    
    const now = new Date();

    if(now.getFullYear() === upcomingAlarm.nextTriggerTime.getFullYear() && now.getMonth() === upcomingAlarm.nextTriggerTime.getMonth() && 
    now.getDate() === upcomingAlarm.nextTriggerTime.getDate() && now.getHours() === upcomingAlarm.nextTriggerTime.getHours() && 
    now.getMinutes() === upcomingAlarm.nextTriggerTime.getMinutes()){
        return true;
    }


    return false;
}

function checkTime(){
    if(upcomingAlarms.length === 0)
    {
        console.log("no elements");
        return;
    }

    if(timesMatch(upcomingAlarms[0])){

            clearInterval(intervalId);
        console.log("It's tiiiiiiiiiiiiiiiime!");
        //update alarms
        updateUpcomingAlarms(upcomingAlarms);


        //rerender alarms
        renderAlarms();
    }
}




let intervalId = setInterval(checkTime,1000);









