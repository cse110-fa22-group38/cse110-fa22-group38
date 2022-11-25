// fetch() is not preinstalled in node environment (but might be in browsers) 
// so I have to import it from an external module called "node-fetch"
// This way, I can directly run the file using "node"
// But when we connect these codes to the mains script and have them directly running
// on a browser, we might don't need this line.
const fetch = require('node-fetch');
const ical = require('ical.js');
const db = require("./database.js");

/* CANVAS API SECTION */
// To store parsed data of all courses
let data;

// Storing the user's api token to fetch calendar events from Canvas
let apiToken;

// Some date constants
const milliInDay = 1000 * 60 * 60 * 24;
const daysInQuarter = 150;
const todayDate = new Date();

// Available type of events
const REGULAR_EVENT = {
    name: "event-calendar-event-",
    color: "#0000FF", // Blue
};

const TASK = {
    name: "event-assignment-",
    color: "#FFA500", // Orange
}

const SPECIAL_EVENT = {
    name: ["midterm", "exam", "final", "quiz"],
    color: "#FF0000", // Red
}

// UCSD's Canvas infrastructure
const coursesURL = "https://canvas.ucsd.edu/api/v1/courses?per_page=100";

// Syntax string to insert a new event into our database
let INSERT = 
`
INSERT INTO events (
    username,
    event_id,
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

// Main function
/* Welcome to the Canvas API. This function can be exported and used by other
 * files in the same directory. It queries Canvas API's for the user's calendar events
 * for their "currently active" courses, based on their provided Canvas API token. 
 * For each event in the ics file, it will use ICAL.JS to parse the data and insert them
 * into table "events" in our database file. 
 * 
 * PRECONDITION: queryUsername nor queryAPIToken
 *               (recommended) queryAPIToken is a valid API token.
 *  
 * @param queryUsername The username whose we are grabbing calendar events for
 * @param queryAPIToken The Canvas API Token of the user
 * 
 * @return None
 * 
 * POSTCONDITION: 
 * If the queryAPIToken was not null and valid, 
 * then we should be able to fetch data from Canvas, 
 * unless other errors show up. Case that we succesfully fetched
 * and parsed the data from Canvas, table "events" should be populated 
 * with new calendar events for the queryUsername.
 * 
 * BUGS: Currently not known.
 */
module.exports = async function (queryUsername, queryAPIToken) {
    // Assign the api token
    apiToken = await queryAPIToken;

     // Grab active courses of users
    let myCourses = await getCurrentCourses();

    // Grab raw calendar events info from these active courses from CANVAS
    let icsStringsArray = await getICStexts(myCourses);

    /* ICAL SESSION */
    for (let COURSE_NUM = 0; COURSE_NUM < myCourses.length; COURSE_NUM++) {
        const calendarData = ical.parse(icsStringsArray[COURSE_NUM]);
        let comp = new ical.Component(calendarData);
        let allEvents = comp.getAllSubcomponents('vevent');
        
        // Treating this as a for loop
        // i.e For each event 
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
            let color = "#000000"; // White by default

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
                if (UID.includes(REGULAR_EVENT.name)) {
                    type = "event";
                    color = REGULAR_EVENT.color;
                }
                else if (UID.includes(TASK.name)) {
                    type = "task";
                    details = "https://canvas.ucsd.edu/courses/" + myCourses[COURSE_NUM]['id']
                    + "/assignments/" + DEID;
                    color = TASK.color;
                }
            }

            // Handling special events
            let isSpecial = isSpecialEvent(name);

            console.log(isSpecial);
            if (isSpecial) {
                console.log("SPECIAL EVENT DETECTED!");
                type = "exam";
                color = SPECIAL_EVENT.color;
            }

            // Handling the formatting of the start and end date
            if (event.hasProperty('dtstart')) {
                icalStart = event.getFirstPropertyValue('dtstart');

                // Handling ALL DAY events
                // isDate means true if "YYYY-MM-DD" but no hours, minutes nor settings
                //              false otherwise
                if (icalStart.isDate) {
                    // myTimeZoneOffset is in millisecond
                    // i.e In california, it's 8 hours (but in milliseconds)
                    const myTimeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000; 
                    const millisecondInDay = 86400000 - 60000;

                    // Date.parse converts date string into equivalent milliseconds
                    // since when?
                    start = new Date(Date.parse(icalStart) + myTimeZoneOffset).toISOString();
                    end = new Date(Date.parse(icalStart) + myTimeZoneOffset + millisecondInDay).toISOString();
                }
                // Handling NONE ALL DAY events
                // isDate is false if both DTSTART AND DTEND EXIST
                else {
                    start = new Date(icalStart).toISOString();

                    if (event.hasProperty('dtend')) {
                        end = new Date(event.getFirstPropertyValue('dtend')).toISOString();
                    }
                }
            }

            let newEvent = [queryUsername, DEID, type, name, relation, location, details, start, end, done, color];

            // dataentry read to be inserted into database
            db.run(INSERT, newEvent, (err) => {
                // Do nothing
            });
        })
    }

    console.log("Successfully grabbed calendar events from Canvas's API");
};

/* This function checks if an even is a special event based on the
 * event's name (or ics's "summary"). Canvas's ics file is unfortunately 
 * not very specific about the event type, so we want to do a more throughout
 * check. The special events are:
 * 
 * Final, Quiz, Exam, Midterm
 * 
 * PRECONDITION: input is not null and correctly parsed from ics file.
 * 
 * If the event's name contains any of these strings, it will return true.
 * Otherwise, returns false
 *  
 * @param input The name of the event we want to determine the event type on
 * @return true if a special event
 *         false otherwise
 * 
 */
function isSpecialEvent(input) {
    return SPECIAL_EVENT.name.some(event => 
        input.toLowerCase().includes(event.toLowerCase()));
}

/* Given the user's Canvas API token, we want to fetch all of their still
 * active courses from UCSD's Canvas API. Usually the json data returned from
 * the Canvas API includes a link to an ics file, which contains all the calendar info
 * for that particular courses. 
 * 
 * PRECONDITION: apiToken is set and checked if invalid or not.
 *  
 * @param No param needed
 * @return An array of course OBJECTS if the user is valid and authorized.
 *         An empty array if no courses for the user is found.
 *         An error message from Canvas otherwise.
 */
async function getAllCourses() {
    let options = {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + apiToken
        },
    }

    try {
        let courses = await fetch(coursesURL, options);
    
        // courseData is an Array of Objects
        // Parse into a JSON format for human readability
        let courseData = await courses.json(); 
        return courseData;
    }
    catch (err) {
        console.log(err.message);
    }
} 

/* Given that we have fetched all "active" courses from Canvas,
 * which are courses that did not end and still accessible 
 * even though the class was already finished. We want to sort them
 * and grab only the ones that are still "truly active" from all 
 * the courses.
 * 
 * PRECONDITION: getAllCourses() was called to populate var data.
 *               var data is not null or undefined.
 *               (recommended) var data is not empty.
 *  
 * @param No param needed
 * @return An array of "truly active" course OBJECTS if sorted successfully.
 *         An empty array if no 'truly active" courses.
 *         An error message from Canvas otherwise.
 */
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

            // A quarter at UCSD has on average 150 days, we only want
            // courses that are still active within the last 150 days     
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

/* Given that we have fetched the "truly active" courses from Canvas,
 * we want to parse the ics file included in each course object to extract
 * the calendar info from them. Currently, it is unknown which standard
 * Canvas used for their ics file. But we will just hand it to node-module
 * ICAL.JS to do all the hard works. This function only downloads and
 * extracts all the raw ics texts. The actual parsing will be done in 
 * grabFromCanvas().
 * 
 * PRECONDITION: getCurrentCourses() was called to make dataArray.
 *               dataArray is not null or undefined.
 *               (recommended) dataArray is not empty.
 *  
 * @param dataArray An array of all "truly active" course objects, if any.
 * @return An array of raw ics texts.
 *         An empty array dataArray was empty.
 *         An error message from Canvas otherwise.
 */
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

            // 4) Push the grabbed ics raw text into our array
            allICStexts.push(icsString);
        }

        return allICStexts;
    }
    catch (err) {
        console.log(err.message);
    }
}
