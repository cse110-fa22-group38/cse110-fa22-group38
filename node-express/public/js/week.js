import * as dbAPI from "./databaseAPI.js";

// IDS of the timeline containers
const weekdays = {
  monday: "#D1",
  tuesday: "#D2",
  wednesday: "#D3",
  thursday: "#D4",
  friday: "#D5",
  saturday: "#D6",
  sunday: "#D0"
}

// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

function init() {
    let timeline = document.getElementsByClassName('timelinecontainer');

    // Puts all the hours into the timeline.
    // setInterval(setNow(), 60000);
    for (let i = 0; i < 7; i++) {
        buildTimeline(timeline[i]);
    }

    // 
}

/**
* creates a time-markers from 6AM to 12PM inside a timeline holder
* parameter: timelinecontainer.
*/
function buildTimeline(timeline) {
  for (var i = 0; i < 19; i++) {
    let time = i + 5;
    time = (time % 12) + 1;
    // flexbox span object holds "hour" and horizontal line.
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
    var percentage = i / 18 * 100;
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