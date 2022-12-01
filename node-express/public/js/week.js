import * as dbAPI from "/js/databaseAPI.js";

// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

/**
 * Main function to populate this week's timeline containers:
 * Last Monday to Next Sunday,
 * based on the provided event objects.
 */
async function init() {
    // Retrieve calendar events for this week
    let deArray = await retrieveFromDatabase();

    // Populate the timeline lists from Last Monday to Next Sunday
    populateLists(deArray);

    // Title each containers with the appropriate weekday
    titleDays();
}

/**
 * Helper function to grab all event objects for user's this week
 * in their local time
 * 
 * @returns {Array} Array of event objects from the database
 *                  Each event object is already initialized 
 */
async function retrieveFromDatabase() {
  return await dbAPI.queryThisWeekEvents();
}

/**
 * Helper function to populate the timeline containers with our event
 * objects. "event" and "exam" are considered events; tasks otherwise.
 * Event that has weekday 0 (i.e) goes into Sunday. 1 into Monday...
 * 6 into Saturday.
 * 
 * @param {Array} deArray An array of event objects for this week
 */
function populateLists(deArray) {
  if (!deArray) return;

  // Iterating over the events and sort them 
  // based on their weekday
  for (let i = 0; i < deArray.length; i++) {
    // Sunday-Saturday is 0-6
    let endDate = deArray[i]["event_end"];
    let weekDay = new Date(endDate).getDay();

    // For each event, select the appropriate timeline list and append
    // the event to that timeline list.
    // Sunday-Saturday is W0-W6
    let timeContainer = document.querySelector("#W" + weekDay);
    let eventType = deArray[i]["event_type"];
    let newEvent = document.createElement('div');

    // Displaying the event based on its type
    // Event/Exam or Task
    if (eventType == "event" || 
        eventType == "exam") {
      tevent(newEvent, deArray[i]);
    }
    else if (eventType == "task") {
      ttask(newEvent, deArray[i]);
    }

    // Append new event to the timeline list
    timeContainer.appendChild(newEvent);
  }
}

/**
 * Adds the "mm/dd" to the title of each timeline so that you tell when things are happening.
 */
function titleDays() {
  const curDate = new Date(Date.now());

  // If sunday, do stuff differently
  if (curDate.getDay() == 0) {
    curDate.setDate(curDate.getDate() - 6);
  } else {
    curDate.setDate(curDate.getDate() - curDate.getDay() + 1);
  }

  let i = 0;
  
  const DAYSOFTHEWEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  let weekdays = document.querySelectorAll('.weekday');
  while (i < 7) {
    weekdays[i].innerHTML = `${DAYSOFTHEWEEK[i]} ${curDate.getMonth() + 1}/${curDate.getDate()}`;
    curDate.setDate(curDate.getDate() + 1);
    i++;
  }

  for (let i = 0; i < darray.length; i++) {
      let newEvent = document.createElement('div');
      if ((darray[i].type == "event") || (darray[i].type == "exam")) {
        tevent(newEvent, darray[i]);
      } else {
        ttask(newEvent, darray[i]);
      }
      eventcontainer.appendChild(newEvent);
      console.log(newEvent);
  }
}