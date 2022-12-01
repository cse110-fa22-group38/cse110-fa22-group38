// fetch() is not preinstalled in node.js environment (but yes most in browsers) 
// so I have to import it from an external module called "node-fetch"
// This way, I can directly fetch the calendar events from Canvas in node.js environment

/**
 * import fetch from nodefetch
 */
const fetch = require('node-fetch');
/**
 * import ical to process ics files
 */
const ical = require('ical.js');
/**
 * importing database
 */
const db = require("./database.js");

/* CANVAS API SECTION */
/**
 * user's apiToken to fetch ics file(s) from Canvas 
 * and corresponding information
 */
let apiToken;

// Available type of events
/**
 * Event
 */
const REGULAR_EVENT = {
    name: "event-calendar-event-",
    color: "#0000FF", // Blue
};

/**
 * Assignments/tasks
 */
const TASK = {
    name: "event-assignment-",
    color: "#FFA500", // Orange
}

/**
 * Exams
 */
const SPECIAL_EVENT = {
    name: ["midterm", "exam", "final", "quiz"],
    color: "#FF0000", // Red
}

/**
 * Some preset colors for class
 */
const colors = [
    "#da2d39", //red
    "#47b830", //green
    "#40a9e2", //blue
    "#942ed9", //purple
    "#3ed9c5", //teal
    "#e89331", //orange
]

/**
 * URL to grab only currently active courses for the user
 */
const activeCourses = "https://canvas.ucsd.edu/api/v1/courses?enrollment_state=active";

/**
 * Syntax string to insert a new event into our database
 */
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

/**  
 * Main function:
 * Welcome to the Canvas API. This function can be exported and used by other
 * files in the same directory. It queries Canvas API's for the user's calendar events
 * for their "currently active" courses, based on their provided Canvas API token. 
 * For each event in the ics file, it will use ICAL.JS to parse the data and insert them
 * into table "events" in our database file. 
 * 
 * PRECONDITION: queryUsername nor queryAPIToken
 *               (recommended) queryAPIToken is a valid API token.
 *  
 * @param {string} queryUsername username whose we are grabbing calendar events for
 * @param {string} queryAPIToken The Canvas API Token of the user
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
module.exports = async function(queryUsername, queryAPIToken) {
    /**
     * Assign the api token
     */
    apiToken = await queryAPIToken;

    /**
     * Grab active courses of users
     */
    let myCourses = await getCurrentCourses();

    /**
     * Grab raw calendar events info from these active courses from CANVAS
     */
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
            let color = colors[COURSE_NUM]; // Incrementally picking a color from our list

            if (event.hasProperty('summary')) {
                name = event.getFirstPropertyValue('summary').replace(/ *\[[^)]*\] */g, "");
            }

            if (event.hasProperty('location')) {
                location = event.getFirstPropertyValue('location');
            }

            if (event.hasProperty('uid')) {
                let UID = event.getFirstPropertyValue('uid');

                // Finding the DEID of this event
                DEID = UID.match(/\d+/)[0];

                // Finding the type of event
                if (UID.includes(REGULAR_EVENT.name)) {
                    type = "event";
                } else if (UID.includes(TASK.name)) {
                    type = "task";
                    details = "https://canvas.ucsd.edu/courses/" + myCourses[COURSE_NUM]['id'] +
                        "/assignments/" + DEID;
                }
            }

            // Handling special events
            let isSpecial = isSpecialEvent(name);

            if (isSpecial) {
                type = "exam";
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

/**
 * This function checks if an even is a special event based on the
 * event's name (or ics's "summary"). Canvas's ics file is unfortunately 
 * not very specific about the event type, so we want to do a more throughout
 * check. The special events are:
 *  Final, Quiz, Exam, Midterm
 * 
 * If the event's name contains any of these strings, it will return true. 
 * Otherwise, returns false.
 * 
 * PRECONDITION: input is not null and correctly parsed from ics file.
 * 
 * @param {string} input The name of the event we want to base the event type on
 *
 * @returns {Boolean} true if a special event, false otherwise.
 */
function isSpecialEvent(input) {
    return SPECIAL_EVENT.name.some(event =>
        input.toLowerCase().includes(event.toLowerCase()));
}

/** 
 * Given a valid API Token, we fetch all the related info of still active
 * courses for the user. Among these info is a link to the ics file which is what
 * we are interested about. 
 * 
 * PRECONDITION: apiToken is not null and valid.
 *  
 * @return {Array} An array of "active" course OBJECTS.
 * @return {Array} An empty array if no currently "active" courses.
 * @return {string} An error message from Canvas otherwise.
 */
async function getCurrentCourses() {
    try {
        let options = {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + apiToken
            },
        }

        // courseData is an Array of Objects
        // Parse into a JSON format for human readability
        let courses = await fetch(activeCourses, options);
        let currentCourses = await courses.json();

        return currentCourses;
    } catch (err) {
        console.log(err.message);
    }
}

/**  
 * Given that we have fetched the "active" courses from Canvas,
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
 * @param {Array} dataArray An array of all "still active" course objects, if any.
 * @return {Array} An array of raw ics texts.
 * @return {Array} An empty array dataArray was empty.
 * @return {string} An error message from Canvas otherwise.
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
    } catch (err) {
        console.log(err.message);
    }
}