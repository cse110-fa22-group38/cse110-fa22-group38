// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

function init() {
    let timeline = document.getElementById('timelinecontainer');

    //puts all the hours into the timeline.
    setInterval(setNow(), 60000);
    buildTimeline(timeline);

    // Retrieving data entry array from database
    let deArray = retrieveFromDatabase(0, 0);

    // Populate timeline container
    let timeContainer = document.querySelector(".event-container");
    populateTimeContainer(timeContainer, deArray);

    // Populate event list container
    let eventContainer = document.querySelector("#eventslistcontainer");
    populateEventContainer(eventContainer, deArray);

    // Populate task list container
    let taskContainer = document.querySelector("#tasklistcontainer");
    populateTaskContainer(taskContainer, deArray);
}

/**
* creates a time-markers from 6AM to 12PM inside a timeline holder
* parameter: timelinecontainer.
*/
function buildTimeline(timeline) {
  for (var i = 0; i < 19; i++) {
    let time = i + 5;
    time = (time % 12) + 1;
    //flexbox span object holds "hour" and horizontal line.
    let span = document.createElement("span");
    let line = document.createElement("div");
    let hour = document.createElement("div")
    if (time > 9) {
      hour.innerHTML = `${time}`;
    } else {
      hour.innerHTML = ""+`${time}`;
      hour.style = "margin-left: 1.1ex;"; //right allign hour times
    }
    hour.classList.add("hour");
    line.classList.add("line");
    hour.classList.add("time-element");
    line.classList.add("time-element");
    span.classList.add("time-container");
    let percentage = i / 18 * 100;
    span.appendChild(hour);
    span.appendChild(line);
    timeline.appendChild(span);
  }
}

function setNow() {
  //get time values using Date() Object
  let time = new Date();
  let hour = time.getHours();
  let minute = time.getMinutes();
  
  // calendar starts at 6AM not 12AM
  hour = hour - 6;
  
  // only set now-bar if time is after 6AM
  if (hour >= 6) {
    
    minute = minute/60; //convert minutes to fractions of an hour
    
    let percentage = (hour + minute)/.18; // divide by 18 and multiply by 100 to get percentage of container
    
    let now = document.getElementById('now-line');
    now.style=`top: ${percentage}%;` // set now's location to percentage of page
    
    console.log(`now line set position ${hour + minute}`);
  } else {
    console.log("now line not set")
  }
}

/* DATABSE RELATED FUNCTION */
function retrieveFromDatabase(start, end) {
    let deArray = [];

    let d1 = {
        UUID: "John",
        DEID: 1,
        type: "event",
        name: "cse110 lecture",
        relation: "cse110",
        location: "center hall 113",
        details: "this class is difficult",
        start: "2022-11-21T14:00:00.000",
        end: "2022-11-21T15:50:00.000",
        done: false,
        color: "#FF0000"
    };
    
    let t1 = {
        UUID: "John",
        DEID: 2,
        type: "task",
        name: "lab 1",
        relation: "cse110",
        location: "center hall 113",
        details: "probably some rediculous javascript assignment",
        start: "2022-11-21T17:00:00.000",
        end: "2022-11-21T17:00:00.000",
        done: false,
        color: "#FF0000"
    }
    
    let e1 = {
        UUID: "John",
        DEID: 3,
        type: "exam",
        name: "midterm 1",
        relation: "math100a",
        location: "Price Center",
        details: "chapters 2,3,6\ncan use 1 page of notes",
        start: "2022-11-21T12:00:00.000",
        end: "2022-11-21T12:50:00.000",
        done: false,
        color: "#0033AA"
    }

    deArray = [d1, t1, e1];
    
    return deArray;
}

function populateTimeContainer(element, deArray) {
    if (!element) return;
    if (!deArray) return;

    for (let i = 0; i < deArray.length; i++) {
        let newEvent = document.createElement('div');
        
        if (deArray[i].type == "exam") {
            tevent(newEvent, deArray[i]);
        }
        else {
            ttask(newEvent, deArray[i]);
        }

        element.appendChild(newEvent);
    }
}

function populateEventContainer(element, deArray) {
    if (!element) return;
    if (!deArray) return;

    for (let i = 0; i < deArray.length; i++) {
        let newEvent = document.createElement('div');
        
        if (deArray[i].type != "task") {
            levent(newEvent, deArray[i]);
        }
        
        element.appendChild(newEvent);
    }
}

function populateTaskContainer(element, deArray) {
    if (!element) return;
    if (!deArray) return;

    for (let i = 0; i < deArray.length; i++) {
        let newEvent = document.createElement('div');
        
        if (deArray[i].type == "task") {
            ltask(newEvent, deArray[i]);
        }
        
        element.appendChild(newEvent);
    }
}

function tevent(element, de) {
    if (!element) return;
    if (!de) return;

    //setup absolute positioning for timing events

    let start = new Date(de.start);
    let end = new Date(de.end);

    let top = ((start.getHours() - 6) + (start.getMinutes() / 60)) / .18;
    let bottom = 100 - ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    // if time is shorter than 1 hour, use a different display type with less information
    if ((end - start) < 3600000) {
        let elapsedTime = ((end.getTime() - start.getTime()) / 60000) % 61; //in minutes

        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de.name}</p>
            <p class="location">${elapsedTime} min | ${de.location}</p>
        </div>
        `;
    } else {
        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de.name}</p>
            <p class="location">${de.location}</p>
            <p class="time">${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        </div>
        `;
    }
    element.classList.add("ID" + de.DEID);
    element.classList.add("tevent");

    // Setting styles
    element.style=`background-color: ${de.color}; top: ${top}%; bottom: ${bottom}%; overflow: hidden;`;
    let style = document.createElement('style');
    style.textContent = 
    `
    .tevent-box {
        display: flex;
        flex-direction: column;
        margin: 5px;
        gap: 5px;
        align-content: flex-start;
        justify-content: flex-start;
        width: 100%;
        height: 100%;
        flex-wrap: wrap;
    }
    
    /*styles the contents inside of */
    .tevent-box > * {
        color: white;
        font-size: 10pt;
        padding: 0px;
        margin: 0;
        width: fit-content;
        font-weight: 500;
    }
    
    .tevent {
        position: absolute;
        border-radius: 10px;
        width: 100%;
    }
    `;

    element.appendChild(style);
}

function ttask(element, de) {
    if (!element) return;
    if (!de) return;
    let end = new Date(de.end);

    let top = ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    element.innerHTML = `
        <div style="opacity: 0.75;position: relative; top: -2px; border-radius: 2px; width: 100%; height: 4px; background-color: ${de.color};"></div>
        `;
    element.style = `top: ${top}%`;
    element.classList.add("ttask");
    ;

    // Setting styles
    let style = document.createElement("style");
    style.textContent = 
    `
    .ttask {
        position: absolute;
        height: 4px;
        width: 100%;
    }
    `;

    element.appendChild(style);
}

/**
 * Templates for lists of objects on the Today iewid
 */

function levent(element, de) {
    if (!element) return;
    if (!de) return;

    //create start and end Date objects for time manipulation
    let start = new Date(de.start);
    let end = new Date(de.end);

    //define contents and fill in using information from de object
    element.innerHTML = `
    <div class="levent-box">
        <p class="name">${de.name}</p>
        <p class="location">${de.location}</p>
        <p class="time">${start.toDateString()} | ${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        <p class="details">${de.details} </p>
    </div>
    `;
    element.classList.add("ID" + de.DEID);
    element.classList.add("levent");

    // Setting styles
    element.style=`background-color: ${de.color}; height: match-content;`;
    let style = document.createElement('style');
    style.textContent = 
    `
    .levent-box {
        color: white;
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 5px;
    }

    .levent {
        width: 100%;
        border-radius: 10px;
    }

    .levent-box > * {
        font-size: 14pt;
        font-weight: 200;
        margin: 5px;
    }
    `;

    element.appendChild(style);
}

/*Please take note that the checkbox can be accessed using id=done${DEID} for adding parameters and modifying database*/
function ltask(element, de) {
    if (!element) return;
    if (!de) return;

    //create start and end Date objects for time manipulation
    let start = new Date(de.start);
    let end = new Date(de.end);

    //set checked or not checked

    let checked = '';

    if (de.done) {
        checked = "checked";
    }

    //define contents and fill in using information from de object
    element.innerHTML = `
    <div class="ltask-box">
        <span style="display: flex; gap: 10px; height: match-content; align-items: center;">
            <input id="done${de.DEID}" style="height: 12pt; width: 12pt; margin: 0px;" type="checkbox" ${checked}></input>
            <div style="margin: 0px;" class="name">${de.name} | ${de.relation}</div>
        </span>
        <p class="location">${de.location}</p>
        <p class="time">Due ${start.toDateString()} @ ${end.toLocaleTimeString()}</p>
        <p class="details">${de.details}</p>
    </div>
    `;
    element.classList.add("ID" + de.DEID);
    element.classList.add("ltask");

    // Setting styles
    element.style=`background-color: ${de.color}; height: match-content;`;
    let style = document.createElement('style');
    style.textContent = 
    `
    .ltask-box {
        color: white;
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 5px;
        height: auto;
    }
    
    .ltask {
        width: 100%;
        border-radius: 10px;
        height: auto;
    }
    
    .ltask-box > * {
        font-size: 14pt;
        font-weight: 200;
        margin: 5px;
    }
    `;

    element.appendChild(style);
}