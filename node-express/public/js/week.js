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
    // Sunday-Saturday is D0-D6
    let timeContainer = document.querySelector("#W" + weekDay);
    let eventType = deArray[i]["event_type"];
    let newEvent = document.createElement('div');

    // Displaying the event based on its type
    // Event/Exam or Task
    if (eventType == "event" || 
        eventType == "exam") {
      tevent(newEvent, deArray[i]);
    }
    else {
      ttask(newEvent, deArray[i]);
    }

    // Append new event to the timeline list
    timeContainer.appendChild(newEvent);
  }
}