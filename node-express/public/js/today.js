import * as dbAPI from "./databaseAPI.js";

// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

async function init() {
    let timeline = document.getElementById('timelinecontainer');

    //puts all the hours into the timeline.
    setInterval(setNow(), 60000);
    buildTimeline(timeline);

    // Retrieving data entry array from database
    let deArray = await getTodayEvents();

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
// TODO ON THIS
async function getTodayEvents() {
    console.log(await dbAPI.queryTodayEvents());
    return await dbAPI.queryTodayEvents();
}

function populateTimeContainer(element, deArray) {
    if (!element) return;
    if (!deArray) return;

    for (let i = 0; i < deArray.length; i++) {
        let newEvent = document.createElement('div');
        
        if (deArray[i]["event_type"] == "event") {
            tevent(newEvent, deArray[i]);
        }
        else if (deArray[i]["event_type"] == "assignment") {
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
        
        if (deArray[i]["event_type"] == "event") {
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
        
        if (deArray[i]["event_type"] == "assignment") {
            ltask(newEvent, deArray[i]);
        }
        
        element.appendChild(newEvent);
    }
}

function tevent(element, de) {
    if (!element) return;
    if (!de) return;

    //setup absolute positioning for timing events

    let start = new Date(de["event_start"]);
    let end = new Date(de["event_end"]);

    let top = ((start.getHours() - 6) + (start.getMinutes() / 60)) / .18;
    let bottom = 100 - ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    // if time is shorter than 1 hour, use a different display type with less information
    if ((end - start) < 3600000) {
        let elapsedTime = ((end.getTime() - start.getTime()) / 60000) % 61; //in minutes

        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de["event_name"]}</p>
            <p class="location">${elapsedTime} min | ${de["event_location"]}</p>
        </div>
        `;
    } else {
        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de["event_name"]}</p>
            <p class="location">${de["event_location"]}</p>
            <p class="time">${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        </div>
        `;
    }
    element.classList.add("ID" + de["event_id"]);
    element.classList.add("tevent");

    // Setting styles
    element.style=`background-color: ${de["event_color"]}; top: ${top}%; bottom: ${bottom}%; overflow: hidden;`;
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
    let end = new Date(de["event_end"]);

    let top = ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    element.innerHTML = `
        <div style="opacity: 0.75;position: relative; top: -2px; border-radius: 2px; width: 100%; height: 4px; background-color: ${de["event_color"]};"></div>
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
    let start = new Date(de["event_start"]);
    let end = new Date(de["event_end"]);

    //define contents and fill in using information from de object
    element.innerHTML = `
    <div class="levent-box">
        <p class="name">${de["event_name"]}</p>
        <p class="location">${de["event_location"]}</p>
        <p class="time">${start.toDateString()} | ${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        <p class="details">${de["event_details"]} </p>
    </div>
    `;
    element.classList.add("ID" + de["event_id"]);
    element.classList.add("levent");

    // Setting styles
    element.style=`background-color: ${de["event_color"]}; height: match-content;`;
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
    let start = new Date(de["event_start"]);
    let end = new Date(de["event_end"]);

    //set checked or not checked

    let checked = '';

    if (de["event_completed"]) {
        checked = "checked";
    }

    //define contents and fill in using information from de object
    element.innerHTML = `
    <div class="ltask-box">
        <span style="display: flex; gap: 10px; height: match-content; align-items: center;">
            <input id="done${de["event_id"]}" style="height: 12pt; width: 12pt; margin: 0px;" type="checkbox" ${checked}></input>
            <div style="margin: 0px;" class="name">${de["event_name"]} | ${de["event_relation"]}</div>
        </span>
        <p class="location">${de["event_location"]}</p>
        <p class="time">Due ${end.toDateString()} @ ${end.toLocaleTimeString()}</p>
        <p class="details">${de["event_details"]}</p>
    </div>
    `;
    element.classList.add("ID" + de["event_id"]);
    element.classList.add("ltask");

    // Setting styles
    element.style=`background-color: ${de["event_color"]}; height: match-content;`;
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