import * as dbAPI from "/js/databaseAPI.js";

// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

/**
 * Main function to populate today day's 3 containers:
 * Timeline, event and tasks
 * based on the provided event objects.
 */
async function init() {
    let timeline = document.getElementById('timelinecontainer');

    // Puts all the hours into the timeline.
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
 * 
 * @param {HTMLElement} timeline A container used to store all the time lines
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

/**
 * This function set the numbers on the left of the timeline container
 * (Kinda hardcoding)
 */
function setNow() {
  // Get time values using Date() Object
  let time = new Date();
  let hour = time.getHours();
  let minute = time.getMinutes();
  
  // Calendar starts at 6AM not 12AM
  hour = hour - 6;
  
  // Only set now-bar if time is after 6AM
  if (hour >= 6) {
    // Convert minutes to fractions of an hour
    minute = minute/60; 
    
     // Divide by 18 and multiply by 100 to get percentage of container
    let percentage = (hour + minute)/.18;
    
    let now = document.getElementById('now-line');
    now.style=`top: ${percentage}%;` // set now's location to percentage of page
  }
}

/* DATABSE RELATED FUNCTION */
/**
 * Helper function to grab all event objects for user's today
 * in their local time
 * 
 * @returns {Array} Array of event objects from the database
 *                  Each event object is already initialized 
 */
async function retrieveFromDatabase() {
    // Array of event objects
    let deArray = [];
    
    // Return an array of event objects from the database
    // Each event object is already initialized
    deArray = await dbAPI.queryTodayEvents();
    
    return deArray;
}

/**
 * Helper function to populate the timeline container with our event
 * objects. "event" and "exam" are considered events; tasks otherwise.
 * 
 * @param {HTMLElement} element The appropriate container to populate 
 * @param {Array} deArray An array of event objects
 */
function populateTimeContainer(element, deArray) {
    if (!element) return;
    if (!deArray) return;

    for (let i = 0; i < deArray.length; i++) {
        let newEvent = document.createElement('div');
        let eventType = deArray[i]["event_type"];

        if (eventType == "event" || 
            eventType == "exam") {
            tevent(newEvent, deArray[i]);
        }
        else if (eventType == "task") {
            ttask(newEvent, deArray[i]);
        }

        element.appendChild(newEvent);
    }
}

/**
 * Helper function to populate the event container with our event
 * objects. "event" and "exam" are considered events; tasks otherwise.
 * 
 * @param {HTMLElement} element The appropriate container to populate 
 * @param {Array} deArray An array of event objects
 */
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

/**
 * Helper function to populate the assignment/tasks container with our event
 * objects. "event" and "exam" are considered events; tasks otherwise.
 * 
 * @param {HTMLElement} element The appropriate container to populate 
 * @param {Array} deArray An array of event objects
 */
function populateTaskContainer(element, deArray) {
    if (!element) return;
    if (!deArray) return;

    for (let i = 0; i < deArray.length; i++) {
        let newEvent = document.createElement('div');
        
        if (deArray[i]['event_type'] == "task") {
            ltask(newEvent, deArray[i]);
            element.appendChild(newEvent);
        }
    }
}