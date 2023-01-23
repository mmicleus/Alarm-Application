//selecting the html elements the javascript file will be working with
const buttonContainer = document.querySelector(".button-container");
const outerContainer = document.querySelector(".container");
const alarmContainer = document.querySelector(".alarm-container");
const plusButton = document.querySelector(".plus-button");
const closeButton = document.querySelector(".close-button img");
const view1 = document.getElementById("view-1");
const view2 = document.getElementById("view-2");
const view3 = document.getElementById("view-3");
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
const alertBar = document.querySelector(".view-2 .alert-bar");
const alertBarV1 = document.querySelector(".view-1 .alert-bar");



//adding event listeners
plusButton.addEventListener('click',addAlarm);
hourSelect.addEventListener('change',hourChanged);
minuteSelect.addEventListener('change',minutesChanged);
dateSelect.addEventListener('change',dateChanged);
nameSelect.addEventListener('change',setAlarmName);

// plusButton.addEventListener('click',addAlarm);
saveButton.addEventListener('click',saveAlarm);
cancelButton.addEventListener('click',cancel);
closeButton.addEventListener('click',()=>{changeViews(view3,view1)
                                           alarmSound.load();
})
weekdays.forEach((day) => {
    day.addEventListener('click',toggleWeekday);
})

//Other variables

//alarmIndex - the index of the alarm that has been clicked an is currently being edited
let alarmIndex = null;
let dateSelected = false;
const alarmSound = new Audio("Soundtracks/alarm.mp3");
alarmSound.autoplay = false;
alarmSound.loop = true;




//Model
//date will store a 'Date' object whenever a specific date is selected
//nextTriggerTime will be assigned a 'date' object when the 'save' button is clicked
//it stores the exact time the alarm is set to
const defaultAlarm = {
    hour: 13,
    minute:0,
     date:null,
    // date:new Date(2023, 11, 31),
    days_of_week:[false,false,false,false,false,false,false],
    name:null,
    enabled:true,
    nextTriggerTime:null
}

let alarm = createAlarmCopy(defaultAlarm);

//an array of 'alarm' objects 
//this array will be mapped to html elements
let alarms = [];
//a subarray of the 'alarms' array
//contains the alarm or alarms that are next in line to go off
//will contains more than 1 alarm if there are more alarms that are set for the same time
let upcomingAlarms = [];

//this function will be called when pressing the 'save' button after having edited an existing alarm
//a copy of the existing alarm and if '.cancel' is pressed no alarm will be erased from the alarms array
function removeCurrentAlarm(){
    if(alarmIndex || alarmIndex === 0){
        console.log("Removing alarm")
        alarms.splice(alarmIndex,1);
        console.log("current array");
        console.log(alarms.length)
    }
}

//after the alarms in the 'upcomingAlarms' array have gone off, the nextTriggerTime is updated

function updateUpcomingAlarms(upcomingAlarms){
    upcomingAlarms.forEach((item) => {
        if(item.date){
            item.date = getTomorrow(item.date);
            item.enabled = false;
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

//this function checks the 'hours' and 'minutes' properties of the alarm and determines whether the alarm can still go off today according to the 
//hour and minute of the alarm
//if it can, te function returns true
//else, it returns false

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

//determines if the 'date' parameter is today
function isSameDay(date){
    const today = new Date();

    if((today.getFullYear() === date.getFullYear()) && (today.getMonth() === date.getMonth()) && (today.getDate() === date.getDate())){
        return true;
    }

    return false;

}

//determines if the 'date' parameter is tomorrow
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

  function getThisTimeTomorrow(hours,minutes){
        const tomorrow = new Date();
  
        tomorrow.setDate(tomorrow.getDate() + 1);

        tomorrow.setHours(hours,minutes,0,0);

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

  //if we assign an object to a variable, the variable will store the reference to the object, rather than a copy
  //this function returns a copy of 'alrm'
  function createAlarmCopy(alrm){
    const aux = JSON.parse(JSON.stringify(alrm));

    if(aux.date){
        aux.date = new Date(Date.parse(aux.date));
    }
    aux.nextTriggerTime = new Date(Date.parse(aux.nextTriggerTime));

    return aux;
  }


  function reset(){
    alarmIndex = null;
    dateSelected = false;
  }

  //the 'Date' data type counts Sun as the first day of the week and indexes it as 0
  //this function returns the index of today's weekday starting from Monday as index 0 and ending with Sunday as index 6
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

//inserts in the 'tab' array the number of days left from today till the other days of the week
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

//return the number of days left till the next trigger time
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

  //initializes the 'nextTriggerTime' property of the alarm
  //calculateNextTriggerTime will calculate the 'nextTriggerTime ' of alarms that are set to particular dates
  //calculateNextTriggerTime2 will calculate the 'nextTriggerTime' of alarms that are set to particular days of the week
  function calculateNextTriggerTime(alarm){
    if(alarm.date){
        alarm.nextTriggerTime = new Date(alarm.date.getFullYear(),alarm.date.getMonth(),alarm.date.getDate(),alarm.hour,alarm.minute,0,0);
    }
    else{
        calculateNextTriggerTime2(alarm);
    }
  }

  //decides which alarm should be place first in the 'alarms' array
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

//returns a sub-array of the alarms array
//that contains enabled alarms (alarms that have the 'enabled property set to true')
function getActiveAlarms(alarms){
    let activeAlarms = [];

    alarms.forEach((item) => {
        if(item.enabled){
            activeAlarms.push(item)
        }
    })

    return activeAlarms;
}


//gets the alarm or alarms that are in line to get triggered
//the algorithm first find the lowest trigger time
//the activeAlarms is then looped over and alarms whose nextTriggertime is equal to the lowest trigger time are added to the 'upcomingAlarms' array
function getUpcomingAlarms(alarms){
    upcomingAlarms = [];

    const activeAlarms = getActiveAlarms(alarms);

    if(activeAlarms.length === 0)
        return;

    let minimumTriggerTime = activeAlarms[0].nextTriggerTime.getTime();

    activeAlarms.forEach((item) => {
        if(item.nextTriggerTime.getTime() < minimumTriggerTime){
            minimumTriggerTime = item.nextTriggerTime.getTime();
        }
    })

    activeAlarms.forEach((item) => {
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

//returns the number of days remaining till the next alarm trigger
function getDays(remainingTime){
    let millisecondsInDay = 86400000;

    return Math.floor(remainingTime / millisecondsInDay);
}

//returns the number of hours remaining till the next alarm trigger
function getHours(remainingTime){
    let millisecondsInDay = 86400000;
    let millisecondsInHour = 3600000;
    let remainingMillisecs = remainingTime % millisecondsInDay;

    return Math.floor(remainingMillisecs / millisecondsInHour);
}
//returns the number of minutes remaining till the next alarm trigger
function getMinutes(remainingTime){
    let millisecondsInHour = 3600000;
    let millisecondsInMinutes = 60000;
    let remainingMillisecs = remainingTime % millisecondsInHour;

    return Math.ceil(remainingMillisecs / millisecondsInMinutes);
}

//called when the 'save' button is clicked
function resetApp(){
    updateUpcomingAlarms(upcomingAlarms);
    alarms.sort(sortAlarms);
    getUpcomingAlarms(alarms);
    displayRemainingTime(upcomingAlarms);
    renderAlarms();
    addListeners();
}

//called when an alarm is enabled or disabled
function resetAppAfterToggle(){
    // updateUpcomingAlarms(upcomingAlarms);
    // alarms.sort(sortAlarms);
    getUpcomingAlarms(alarms);
    displayRemainingTime(upcomingAlarms);
    renderAlarms();
    addListeners();
}

//if the current time is past the alarm's nextTriggerTime, it returns true
//else, it returns false
function pastAlarmTriggerTime(alarm){
    if((new Date().getTime() - alarm.nextTriggerTime.getTime()) > 0){
        return true;
    }
    else{
        return false;
    }
}

function pastDate(date){
    if((new Date().getTime() - date.getTime()) >= 0){
        return true;
    }
    else{
        return false;
    }
}

//called when an alarm is enabled
//it checks if the alarm's nextTriggerTime needs to be updated
//if it's outdated, it updates it

function reintroduceAlarm(alarm){
    if(pastAlarmTriggerTime(alarm))
    {
        if(alarm.date){
            if(isItToday(alarm)){
                alarm.date = new Date();
                calculateNextTriggerTime(alarm);
            }
            else{
                alarm.date = getTomorrow(new Date());
                calculateNextTriggerTime(alarm);
            }
        }
        else{
            calculateNextTriggerTime(alarm)
        }
    }
    displayAlertView1(alarm)
}

//returns the message of the notification that is rendered for 3 seconds after an alarm has been saved
function getRemainingTimeMessage(alarm){
    let message = "Alarm set for ";


        let remainingTime = alarm.nextTriggerTime.getTime() - new Date().getTime();
        let remainingDays = getDays(remainingTime);
        let remainingHours = getHours(remainingTime);
        let remainingMinutes = getMinutes(remainingTime);

        

        
        if(remainingDays > 0){
            
            message += `${remainingDays} days `;
        }
        else{
            if(remainingHours > 0){
                
                message += `${remainingHours} hours `
            }

            if(remainingMinutes > 0){
                message += `${remainingMinutes} minutes `
            }
        }

        message += "from now"

        return message;
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

function turnAlertOff(){
    alertBar.classList.remove('reveal');
}
//renders the 'alarm enabled' notification for 3 seconds
function displayAlertView1(alarm){
    alertBarV1.innerHTML = getRemainingTimeMessage(alarm)
    alertBarV1.classList.add("reveal")
    setTimeout(()=>{ alertBarV1.classList.remove('reveal') },3000);
}


function wipeView2(){
    nameSelect.value=""
}

//inserts the data of the triggered alarm into view 3
//view 3 is rendered when one or more alarms are triggered
function insertDataIntoView3(triggeredAlarm){
    const hours = document.querySelector('.view-3 .hh');
    const minutes = document.querySelector('.view-3 .mm');
    const date = document.querySelector('.view-3 .triggeredAlarmDate');
    const name = document.querySelector('.view-3 .triggeredAlarmName');

    hours.innerText = addZero(triggeredAlarm.hour);
    minutes.innerText = addZero(triggeredAlarm.minute);
    date.innerText = formatDate(triggeredAlarm.nextTriggerTime);
    name.innerText = triggeredAlarm.name;
}


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

function turnOn(){
    
    console.log("clicked");
}

//iterates through the alarms array an maps each 'alarm' object into an html element

function renderAlarms(){
    let content;
    let dayAbbrev = ["M","T","W","T","F","S","S"];
    let elements=[];

    const htmlAlarms = alarms.map((item,index) => {

        //if a specific date was selected
        if(item.date){
            content = formatDate(item.date);
        }
        //if one or more days of the week were selected
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

        //determine if the toggle is on or off
        let checkbox = "";
        if(item.enabled){
            checkbox = '<input type="checkbox" class="checked">';
        }
        else{
            checkbox = '<input type="checkbox">';
        }


        return `<div class="alarm" data-id=${index}>
        <span class="time-container"> <span class="hours">${addZero(item.hour)}</span>:<span class="minutes">${addZero(item.minute)}</span> </span>
        <span class="right-container"><span class="date">${content}</span>
        <label class="switch">
        ${checkbox}
            <span class="alarmSlider slider round"></span>
          </label>
        </span>
    </div>`;
    });
    alarmContainer.innerHTML = htmlAlarms.join("");
}

//called when an alarm was clicked and is being edited
//it inserts the selected alarm's data into view 2
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

    if(alarm.name){
        nameSelect.value = alarm.name;
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


function swapViews(view1,view2){
    dateSelected = false;

    if(view1.classList.contains("show-view")){
        changeViews(view1,view2)
    }
    else{
        changeViews(view2,view1)
    }
}

function changeViews(hide,show){
    hide.classList.remove("show-view");
    show.classList.add("show-view");
}




// Controller

//called when a new hour was selected in view 2
//if no weekday was selected, the function will decide whether the alarm should be set for today or tomorrow based on the current time and
//the time of the alarm
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

// called when a new minute was selected in view 2
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


//called when a new date was selected in view2
//if a date in the past was selected, the function will set the date to today's or tomorrow's date depending on the time
function dateChanged(){

    const selectedDate = new Date(Date.parse(dateSelect.value));
    selectedDate.setHours(alarm.hour,alarm.minute,0,0);
    let date;


    if(pastDate(selectedDate))
    {
        if(isItToday(alarm)){
            alertBar.innerText = "Can't set alarm for times in the past. Alarm set for today";
            date = new Date();
        }
        else{
            alertBar.innerText = "Can't set alarm for times in the past. Alarm set for tomorrow";
            date = getThisTimeTomorrow(alarm.hour,alarm.minute);
        }
        // const alertBar = document.querySelector(".alert-bar");
        alertBar.classList.add('reveal');
        setTimeout(turnAlertOff,3000);
        
    }
    else{
        date = new Date(Date.parse(dateSelect.value));
    }

    dateSelected = true;
    alarm.date = date;
    alarm.days_of_week = alarm.days_of_week.map((day) => {
        return false;
    })

    updateWeekdaysView();
    insertAlarmData();
}

function setAlarmName(){
    let name = nameSelect.value;

    if(name != null && name !=""){
        alarm.name = name;
    }
    else{
        alarm.name = null;
    }
}

//called when a weekday was selected or deselected in view2
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

//called when the plus button is clicked in view 1
//it creates a copy of the default alarm
//populates view 2 with alarm data
//renders view 2
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
    swapViews(view1,view2);
}


//adds event listeners to all alarms once they've been rendered
//also adds event listeners to the toggle on each alarm

function addListeners(){
    const htmlAlarms = document.querySelectorAll(".alarm-container .alarm");
    // const switches = document.querySelectorAll('.alarmSlider');

    htmlAlarms.forEach((item) => {
        item.addEventListener('click',loadAlarm);
    })

    // switches.forEach((sw)=>{
    //     sw.addEventListener('click',(e)=>{
    //         e.stopPropagation();
    //         console.log("clicked")
    //     })
    // })

    //add listeners to the slider on each alarm
    htmlAlarms.forEach((htmlAlarm)=>{
        const alrmIndex = parseInt(htmlAlarm.dataset.id,10);
        const alarm = alarms[alrmIndex];
        
         const slider = htmlAlarm.querySelector('.alarmSlider');
         
        slider.addEventListener('click',(e) => {
            if(alarm.enabled){
                // come back
            //     console.log("alarm disabled")
                 alarm.enabled = false;
                 
                resetAppAfterToggle();
            }
            else{
                // come back
                // console.log("alarm enabled")
                 alarm.enabled = true;
                 reintroduceAlarm(alarm);
                 resetAppAfterToggle();
            }
        })
    })
}


//called when the 'save' button is clicked in view 2
function saveAlarm(){

    //remove the alarms[index] from the array
    removeCurrentAlarm();
    wipeView2();

    alarm.enabled = true;
    calculateNextTriggerTime(alarm);
    console.log(alarm.nextTriggerTime)
    const message = `Alarm set for ${getDays}`
    displayAlertView1(alarm)
    alarms.push(alarm);
    alarms.sort(sortAlarms);
    getUpcomingAlarms(alarms);
    displayRemainingTime(upcomingAlarms);
    console.log("Alarms:")
    console.log(upcomingAlarms);


    renderAlarms();
    addListeners();
    swapViews(view1,view2);
}

//called when the 'cancel' button is clicked in view 2
//no new alarm will be created and the alarms array will not be changed
//view 1 is rendered
function cancel(){
    reset();
    swapViews(view1,view2);
}


//called when an alarm element is clicked in view 1
//it will create a copy of the alarm and store it in 'alarm'
//it will populate view 2 with alarm data
//it renders view 2
function loadAlarm(e){

    // console.log(e.target)
    if(!e.target.classList.contains("alarm")){
        return;
    }

    dateSelected = false;
    alarmIndex = parseInt(e.currentTarget.dataset.id,10);
    console.log("Alarm Index" + alarmIndex)
    
    // alarm = JSON.parse(JSON.stringify(alarms[alarmIndex]));
    // alarm.date = new Date(Date.parse(alarm.date));

    alarm = createAlarmCopy(alarms[alarmIndex]);
    console.log(alarm);
    insertAlarmData();
    hourChanged();
    minutesChanged();
    swapViews(view1,view2);
}

//returns true is the it's time to trigger the alarm or alarms in the 'upcomingAlarms' array
function timesMatch(upcomingAlarm){
    
    const now = new Date();

    if(now.getFullYear() === upcomingAlarm.nextTriggerTime.getFullYear() && now.getMonth() === upcomingAlarm.nextTriggerTime.getMonth() && 
    now.getDate() === upcomingAlarm.nextTriggerTime.getDate() && now.getHours() === upcomingAlarm.nextTriggerTime.getHours() && 
    now.getMinutes() === upcomingAlarm.nextTriggerTime.getMinutes()){
        return true;
    }


    return false;
}

//this function is called once a second to determine whether an alarm should be triggered
//it also updates the header of view 1 with data about the remaining time
function checkTime(){
    if(upcomingAlarms.length === 0)
    {
        console.log("no elements");
        return;
    }

    displayRemainingTime(upcomingAlarms);

    //if it's time to trigger one or more alamrs
    //the alarm sound is played
    //view 3 is rendered
    if(timesMatch(upcomingAlarms[0])){

        const alarmCopy = createAlarmCopy(upcomingAlarms[0]);
        alarmSound.play();
        insertDataIntoView3(alarmCopy)
        changeViews(view1,view3)
        //update alarms
        resetApp();
    }
}



let intervalId = setInterval(checkTime,1000);










