import * as dbAPI from "/js/databaseAPI.js";

// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

async function init() {
    // Retrieve calendar events for this week
    let deArray = await retrieveFromDatabase();

    // Logging whatever was returned from the database
    console.log(deArray);

    // Populate the timeline lists from Monday to Sunday
    populateLists(deArray);

    titleDays();
}

// Retrieve this week event from the database
async function retrieveFromDatabase() {
  return await dbAPI.queryThisWeekEvents();
}

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

  // if sunday, do stuff differently
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