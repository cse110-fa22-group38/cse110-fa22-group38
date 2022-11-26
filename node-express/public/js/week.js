import * as dbAPI from "./databaseAPI.js";

// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

async function init() {
    let timeline = document.getElementsByClassName('timelinecontainer');

    //puts all the hours into the timeline.
    //setInterval(setNow(), 60000);

    // Retrieve calendar events for this week
    let deArray = await retrieveFromDatabase();

    console.log(deArray);

    // Populate the timeline lists from Monday to Sunday
    populateLists(deArray);
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

async function retrieveFromDatabase() {
  return await dbAPI.queryThisWeekEvents();
}

function populateLists(deArray) {
  if (!deArray) return;

  // Iterating over the events and sort them 
  // based on their weekday
  for (let i = 0; i < deArray.length; i++) {
    // Sunday-Saturday is 0-6
    let endDate = deArray[i]["event_end"]
    let weekDay = new Date(endDate).getDay();

    // For each event, select the appropriate timeline list and append
    // the event to that timeline list.
    // Sunday-Saturday is D0-D6
    let timeContainer = document.querySelector("#D" + weekDay);
    let eventType = deArray[i]["event_type"];
    let newEvent = document.createElement('div');

    // Displaying the event based on its type
    // Event/Exam or Task
    if (eventType == "event" || eventType == "exam") {
      tevent(newEvent, deArray[i]);
    }
    else {
      ttask(newEvent, deArray[i]);
    }

    // Append new event to the timeline list
    timeContainer.appendChild(newEvent);
  }
}

function tevent(element, de) {
  if (!element) return;
  if (!de) return;

  // setup absolute positioning for timing events
  let start = new Date(de["event_start"]);
  let end = new Date(de["event_end"]);

  let top = ((start.getHours() - 6) + (start.getMinutes() / 60)) / .18;
  let bottom = 100 - ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

  let timeDiff = end - start;
  let oneHour = 3600000

  // if time is shorter than 1 hour, use a different display type with less information
  if (timeDiff < oneHour) {
      let elapsedTime = ((end.getTime() - start.getTime()) / 60000) % 61; //in minutes

      element.innerHTML = `
      <div class="tevent-box">
          <p class="name">${de['event_name']}</p>
          <p class="location">${elapsedTime} min | ${de["event_location"]}</p>
      </div>
      `;
  // If time is longer than 3 hour, limit the bottom, but still use a 
  // a different display type with more info
  } else if (timeDiff >= (oneHour * 3)) {
    bottom = 100 - ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    element.innerHTML = `
      <div class="tevent-box">
          <p class="name">${de["event_name"]}</p>
          <p class="location">${de["event_location"]}</p>
          <p class="time">${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
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
  element.style=
  `
    background-color: ${de["event_color"]}; 
    top: ${top}%; 
    bottom: ${bottom}%; 
    overflow: hidden;
    opacity: 0.2;
  `;
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