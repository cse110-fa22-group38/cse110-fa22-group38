// fetch() is not preinstalled in node environment (but might be in browsers) 
// so I have to import it from an external module called "node-fetch"
// This way, I can directly run the file using "node"
// But when we connect these codes to the mains script and have them directly running
// on a browser, we might don't need this line.
const fetch = require('node-fetch');
const ical = require('ical.js');
const db = require("./database.js");

/* CANVAS API SECTION */
let data; // To store parsed data of all courses

// TODO: FILL YOYR CANVAS API KEY HERE IF YOU WANT TO TRY THIS OUT
// THERE ARE TUTORIALS ON HOW TO GET THE CANVAS API KEY, LOOK IT UP!
let apiToken;

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
 
let INSERT = 
`
INSERT INTO events (
    event_id,
    uuid,
    event_type,
    event_name,
    event_relation,
    event_location,
    event_details,
    event_start,
    event_end,
    event_completed,
    event_color) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
`;

async function getAllCourses() {
    try {
        let courses = await fetch(coursesURL, options);
    
        // courseData is an Array of Objects
        let courseData = await courses.json(); // Parse into a JSON format for human readability
        return courseData;
    }
    catch (err) {
        console.log(err.message);
    }
} 

async function getCurrentCourses() {
    try {
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
    catch (err) {
        console.log(err.message);
    }
}

async function getICStexts(dataArray) {
    try {
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
    catch (err) {
        console.log(error.message);
    }
}

// Main function
module.exports = async function(queryUUID, queryAPIToken) {
    // Assign the api toke
    apiToken = queryAPIToken;

    console.log(apiToken);

     // Grab active courses of users
    let myCourses = await getCurrentCourses();

    // Grab calendar events info from these active courses from CANVAS
    let icsStringsArray = await getICStexts(myCourses); 

    // Grab the UUID first, store somewhere
    // Then moveon to this portion

    /* ICAL SESSION */
    for (let COURSE_NUM = 0; COURSE_NUM < myCourses.length; COURSE_NUM++) {
        const calendarData = ical.parse(icsStringsArray[COURSE_NUM]);
        let comp = new ical.Component(calendarData);
        let allEvents = comp.getAllSubcomponents('vevent');
        
        // Treating this as a for loop
        allEvents.map((event) => {
            let DEID = "N/A";
            let type = "N/A";
            let name = "N/A";
            let relation = myCourses[COURSE_NUM]['course_code'];
            let location = "N/A";
            let details = "N/A";
            let start = "N/A";
            let end = "N/A";
            let done = Boolean(false);
            let color = "#ffffff";

            if (event.hasProperty('summary')) {
                name = event.getFirstPropertyValue('summary').replace(/ *\[[^)]*\] */g, "");
            }
        
            if (event.hasProperty('location')) {
                location = event.getFirstPropertyValue('location');
            }
        
            if (event.hasProperty('uid')) {
                let UID = event.getFirstPropertyValue('uid');
        
                // Finding the DEID of this event (NEED MORE THOUGHTS)
                DEID = UID.match(/\d+/)[0];
        
                // Finding the type of event
                if (UID.includes(EVENT)) {
                    type = "event";
                }
                else if (UID.includes(ASSIGNMENT)) {
                    type = "assignment";
                    details = "https://canvas.ucsd.edu/courses/" + myCourses[COURSE_NUM]['id']
                    + "/assignments/" + DEID;
                }
            }
        
            if (event.hasProperty('dtstart')) {
                start = event.getFirstPropertyValue('dtstart').toJSDate();
            }
        
            if (event.hasProperty('dtend')) {
                end = event.getFirstPropertyValue('dtend').toJSDate();
            }
            else if (event.hasProperty('dtstart')) {
                end = event.getFirstPropertyValue('dtstart').toJSDate();
            }
            
            // Debugging
            /*
            console.log("Name: " + dataentry.name);
            console.log("Type of event: " + dataentry.type);
            console.log("DEID: " + dataentry.DEID);
            console.log("Relation: " + dataentry.relation);
            console.log("Location: " + dataentry.location);
            console.log("Details: " + dataentry.details);
            console.log("Start time: " + dataentry.start);
            console.log("End date: " + dataentry.end);
            console.log("Done?: " + dataentry.done);
            console.log("Color?: " + dataentry.color);
            console.log("");
            */
    
            // dataentry read to be inserted into database
            db.run(INSERT, [DEID, queryUUID, type, name, relation, location, details, start, end, done, color], (err) => {
                // Do nothing
            });
        })
    }
    
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

    console.log("finished");
};