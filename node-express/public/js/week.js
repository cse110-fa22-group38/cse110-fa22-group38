// Once the skeleton loaded, run the script to populate the page
window.addEventListener('DOMContentLoaded', init);

function init() {
    let timeline = document.getElementsByClassName('timelinecontainer');

    //puts all the hours into the timeline.
    //setInterval(setNow(), 60000);
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