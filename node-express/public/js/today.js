import * as dbAPI from "/js/databaseAPI.js";

// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

async function init() {
    let timeline = document.getElementById('timelinecontainer');

    //puts all the hours into the timeline.
    setInterval(setNow(), 60000);

    // Retrieving data entry array from database
    let deArray = await retrieveFromDatabase();
    console.log(deArray);

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
 * Currently unsued, and timeline is now hard-coded from 6AM to 12AM
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
    //convert minutes to fractions of an hour
    minute = minute/60; 
    
     // divide by 18 and multiply by 100 to get percentage of container
    let percentage = (hour + minute)/.18;
    
    let now = document.getElementById('now-line');
    now.style=`top: ${percentage}%;` // set now's location to percentage of page
  }
}

/* DATABSE RELATED FUNCTION */
async function retrieveFromDatabase() {
    //array of events in JSON format(key value)
    let deArray = [];
    
    // Return an array of dataentry objects from the database
    // Each de is already initialized
    deArray = await dbAPI.queryTodayEvents();
    
    return deArray;
}

function populateTimeContainer(element, deArray) {
    if (!element) return;
    if (!deArray) return;

    for (let i = 0; i < deArray.length; i++) {
        let newEvent = document.createElement('div');
        
        if (deArray[i]["event_type"] == "event" || 
            deArray[i]["event_type"] == "exam") {
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
        
        if (deArray[i]["event_type"] == "event" || 
            deArray[i]["event_type"] == "exam") {
            levent(newEvent, deArray[i]);
            element.appendChild(newEvent);
        }
    }
}

function populateTaskContainer(element, deArray) {
    if (!element) return;
    if (!deArray) return;

    for (let i = 0; i < deArray.length; i++) {
        let newEvent = document.createElement('div');
        
        if (deArray[i].type == "task") {
            ltask(newEvent, deArray[i]);
            element.appendChild(newEvent);
        }
    }
}