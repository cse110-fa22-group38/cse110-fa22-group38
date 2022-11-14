// fetch() is not preinstalled in node environment (but might be in browsers) 
// so I have to import it from an external module called "node-fetch"
// This way, I can directly run the file using "node"
// But when we connect these codes to the mains script and have them directly running
// on a browser, we might don't need this line.
import fetch from "node-fetch";
import ical from "ical.js";

/* CANVAS API SECTION */
let data; // To store parsed data of all courses

// TODO: FILL YOYR CANVAS API KEY HERE IF YOU WANT TO TRY THIS OUT
// THERE ARE TUTORIALS ON HOW TO GET THE CANVAS API KEY, LOOK IT UP!
let apiToken = "";

const milliInDay = 1000 * 60 * 60 * 24;
const daysInQuarter = 100;
const todayDate = new Date();
const EVENT = "event-calendar-event-";
const ASSIGNMENT = "event-assignment-"; 
const coursesURL = "https://canvas.ucsd.edu/api/v1/courses?per_page=100";
const options = {
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + apiToken
    },
}


async function getAllCourses() {
    let courses = await fetch(coursesURL, options);
    
    // courseData is an Array of Objects
    let courseData = await courses.json(); // Parse into a JSON format for human readability
    return courseData;
} 

async function getCurrentCourses() {
    data = await getAllCourses(); // Grab parsed data of ALL courses
    let currentCourses = []; // Array to store current sources
    let coursesDate = []; // Array to store created_at dates of ALL courses

    // Isolating the 'created_at' property, make Date() OBJECTS out of them 
    // and push them to a coursesDate array
    // The property is in ISO8601 date format (look it up)
    for (let i = 0; i < data.length; i++) {
        coursesDate.push(new Date(data[i]['created_at']));
    }

    for (let i = 0; i < data.length; i++) {
        // Get difference between today's Date and course's created at Date
        // (in millisecond)
        let diffTime = Math.abs(todayDate - coursesDate[i]); 

        // Get said difference but in days
        let diffDay = Math.ceil(diffTime / milliInDay); 

        // A quarter at UCSD has on average 100 days, we only want
        // courses that are still active within the last 100 days     
        if (diffDay < daysInQuarter) {
            currentCourses.push(data[i]);
        }
    }

    return currentCourses;
}

async function getICStexts(dataArray) {
    // Array to store raw texts of all the courses in dataArray
    let allICStexts = [];

    for (let i = 0; i < dataArray.length; i++) {
        // 1) Grab the URL of the ics file from each course
        let icsURL = dataArray[i]['calendar']['ics'];

        // 2) Fetch the raw response from the given URL
        let icsStringRAW = await fetch(icsURL);

        // 3) Parse the response as texts
        let icsString = await icsStringRAW.text();

        //
        allICStexts.push(icsString);
    }

    return allICStexts;
}

// Grabbing data of all current courses
let myCourses = await getCurrentCourses();

// Grabbing raw texts from the ICS file of all my current courses
let icsStringsArray = await getICStexts(myCourses);

// Other Debugging
/*
for (let i = 0; i < myCourses.length; i++) {
    console.log("Course " + i + ": " + myCourses[i]['name'])
    console.log("ID " + i + ": " + myCourses[i]['id'])
    console.log("Link to ICS: " + myCourses[i]['calendar']['ics'])
}
*/

/*
for (let i = 0; i < test.length; i++) {
    console.log(icsStringArray[i]);
}
*/

/* ICAL SESSION */
const calendarData = ical.parse(icsStringsArray[0]);
let comp = new ical.Component(calendarData);
let allEvents = comp.getAllSubcomponents('vevent');

allEvents.map((event) => {
    let name = "N/A";
    let UID = "N/A";
    let DEID = "N/A";
    let type = "N/A";
    let URL = "N/A"; // Do we need this?
    // let relation = "N/A";  ???
    let location = "N/A";
    let details = "N/A";
    let start = "N/A";
    let end = "N/A";

    if (event.hasProperty('summary')) {
        name = event.getFirstPropertyValue('summary');
    }

    if (event.hasProperty('uid')) {
        UID = event.getFirstPropertyValue('uid');

        // Finding the type of event
        if (UID.includes(EVENT)) {
            type = "EVENT";
        }
        else if (UID.includes(ASSIGNMENT)) {
            type = "ASSIGNMENT"
        }

        // Finding the DEID of this event
        DEID = UID.match(/\d+/)[0];
    }

    if (event.hasProperty('location')) {
        location = event.getFirstPropertyValue('location');
    }

    if (event.hasProperty('url')) {
        URL = event.getFirstPropertyValue('url');
    }

    if (event.hasProperty('description')) {
        details = event.getFirstPropertyValue('description');
    }

    if (event.hasProperty('dtstart')) {
        start = event.getFirstPropertyValue('dtstart').toJSDate();
    }

    if (event.hasProperty('dtend')) {
        end = event.getFirstPropertyValue('dtend').toJSDate();
    }
    
    console.log("Name: " + name);
    console.log("Type of event: " + type);
    console.log("DEID: " + DEID);
    console.log("Location: " + location);
    console.log("Details: " + details);
    console.log("URL: " + URL);
    console.log("Start time: " + start);
    console.log("End date: " + end);
    console.log("");
})

// console.log(icsStringsArray[0]);
// console.log(summary);