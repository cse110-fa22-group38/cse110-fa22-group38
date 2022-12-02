let PORT = 6900;
let baseURL = "http://localhost:" + PORT;

/**
 * User's related info API Endpoints
 */
let allUSERS = "/api/users";
let loggedUSERNAME = "/api/username";
let loggedEVENTS = "/api/events";
let allEVENTS = "/api/events/all";

/**
 * Event's properties info API Endpoints
 */
let eventsDEID = "/api/events/event_id/";
let eventsTYPE = "/api/events/event_type/";
let eventsNAME = "/api/events/event_name/";
let eventsLOCATION = "/api/events/event_location/";
let eventsRELATION = "/api/events/event_relation/";
let eventsDETAILS = "/api/events/event_details/";
let eventsSTART = "/api/events/event_start/";
let eventsEND = "/api/events/event_end/";
let eventsCOMPLETED = "/api/events/event_completed/";
let eventsCOLOR = "/api/events/event_color/";

/**
 * Modify API Endpoints
 */
let deleteByUSERNAME = "/api/users/delete/";

/**
 * API Endpoints for query events
 */
let eventsTODAY = "/api/events/today";
let eventsTHISWEEK = "/api/events/this_week";
let eventsTHISMONTH = "/api/events/this_month";
let eventsTHISQUARTER = "/api/events/";

/**
 * GET header for fetch()
 */
const getHeader =  {
    method: 'GET',
}

/**
 * GET header for fetch()
 */
const deleteHeader = {
    method: 'DELETE',
}

/* PRIVATE INTERNAL ENDPOINTS */
/**
 * Query all users info (Security risk)
 * 
 * @returns {Array} An array of all user's info objects
 */
 export async function queryAllUsers() {
    let URL = baseURL + allUSERS;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query all events info of all users (Security risk)
 * 
 * @returns {Array} An array of all evnet's info objects
 */
 export async function queryAllEvents() {
    let URL = baseURL + allEVENTS;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query the username of the currently logged in 
 * username
 * 
 * @returns {String} The username of the logged in user
 */
export async function queryLoggedUsername() {
    let URL = baseURL + loggedUSERNAME;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query all events for the logged in user
 * 
 * @returns {Array} An array of all events 
 *                  belonging to the logged in user
 */
 export async function queryLoggedEvents() {
    let URL = baseURL + loggedEVENTS;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the event's id
 * 
 * @param {String} deid The id of the event
 * @returns {Array} An array of all event objects that matched
 *                  event's id
 */
export async function queryDEIDFromEvents(deid) {
    let URL = baseURL + eventsDEID + deid;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the event's type
 * 
 * @param {String} type The type of the event
 * @returns {Array} An array of all event objects that matched
 *                  event's type
 */
export async function queryTypeFromEvents(type) {
    let URL = baseURL + eventsTYPE + type;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the event's name
 * 
 * @param {String} type The name of the event
 * @returns {Array} An array of all event objects that matched
 *                  event's name
 */
export async function queryNameFromEvents(name) {
    let URL = baseURL + eventsNAME + name;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the event's location
 * 
 * @param {String} location The location of the event
 * @returns {Array} An array of all event objects that matched
 *                  event's location
 */
export async function queryLocationFromEvents(location) {
    let URL = baseURL + eventsLOCATION + location;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the event's relation
 * 
 * @param {String} relation The relation of the event
 * @returns {Array} An array of all event objects that matched
 *                  event's relation
 */
export async function queryRelationFromEvents(relation) {
    let URL = baseURL + eventsRELATION + relation;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the event's details
 * 
 * @param {String} details The details of the event
 * @returns {Array} An array of all event objects that matched
 *                  event's details
 */
export async function queryDetailsFromEvents(details) {
    let URL = baseURL + eventsDETAILS + details;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the 
 * event's start time in UTC time
 * 
 * @param {String} start An ISO 8601 datetime string
 *                       in format "yyyy-mm-ddThh:mm:00Z"
 * @returns {Array} An array of all event objects that 
 *                  EXACTLY matched event's start time                   
 */
export async function queryStartFromEvents(start) {
    let URL = baseURL + eventsSTART + start;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the 
 * event's end time in UTC time
 * 
 * @param {String} end An ISO 8601 datetime string
 *                     in format "yyyy-mm-ddThh:mm:00Z"
 * @returns {Array} An array of all event objects that 
 *                  EXACTLY matched event's end time                   
 */
export async function queryEndFromEvents(end) {
    let URL = baseURL + eventsEND + end;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the event's 
 * completeness
 * 
 * @param {Boolean} done true or false
 * @returns {Array} An array of all event objects that matched
 *                  either true or false
 */
export async function queryDoneFromEvents(done) {
    let URL = baseURL + eventsCOMPLETED + done;
    return await fetchForMe(URL, getHeader);
}

/**
 * Query row(s) from table events based on the event's color
 * 
 * @param {String} color A 6-digits hex code in "#ffffff" format
 * @returns {Array} An array of all event objects that matched
 *                  the color
 */
export async function queryColorFromEvents(color) {
    let URL = baseURL + eventsCOLOR + color;
    return await fetchForMe(URL, getHeader);
}

/* QUERYING EVENTS FROM TABLE */
/**
 * This function contacts the database to grab today's events 
 * for the logged in user (full 24 hours) based on their LOCAL TIME.
 * 
 * @returns {Array} An ARRAY of dataentry objects if any events
 * @returns {Array} An empty ARRAY otherwise
 */
export async function queryTodayEvents() {
    let URL = baseURL + eventsTODAY;
    return await fetchForMe(URL, getHeader);
}

/**
 * This function contacts the database to grab this week's events 
 * for the logged in user (full 24 hours) based on their LOCAL TIME.
 * 
 * @returns {Array} An ARRAY of dataentry objects if any events
 * @returns {Array} An empty ARRAY otherwise
 */
export async function queryThisWeekEvents() {
    let URL = baseURL + eventsTHISWEEK;
    return await fetchForMe(URL, getHeader);
}

/**
 * This function contacts the database to grab this month's events 
 * for the logged in user (full 24 hours) based on their LOCAL TIME.
 * 
 * @returns {Array} An ARRAY of dataentry objects if any events
 * @returns {Array} An empty ARRAY otherwise
 */
export async function queryThisMonthEvents() {
    let URL = baseURL + eventsTHISMONTH;
    return await fetchForMe(URL, getHeader);
}

/**
 * This function contacts the database to grab this quarter's events 
 * within a specified date range 
 * for the logged in user (full 24 hours) based on their LOCAL TIME.
 * 
 * @param {String} start_date The start date of the quarter in UTC
 *                            in ISO 8601 format "yyyy-mm-ddThh:mm:00Z"
 * @param {String} end_date The end date of the quarter in UTC
 *                          in ISO 8601 format "yyyy-mm-ddThh:mm:00Z"
 * 
 * @returns {Array} An ARRAY of dataentry objects if any events
 * @returns {Array} An empty ARRAY otherwise
 */
export async function queryThisQuarterEvents(start_date, end_date) {
    let URL = baseURL + eventsTHISQUARTER + start_date + "/" + end_date;
    return await fetchForMe(URL, getHeader);
}

/**
 * Example of a dataentry object
 */
var dataentry = {
    "username": "Tung",
    "event_id": "dataentryID",
    "event_type": "event",
    "event_name": "class 100a",
    "event_relation": "class 100a",
    "event_location": "9500 Gilman Drive",
    "event_details": "description",
    "event_start": "yyyy-mm-ddThh:mm:00Z",
    "event_end": "yyyy-mm-ddThh:mm:00Z",
    "event_completed": Boolean(false),
    "event_color": "#ffffff"
}

/* MODIFYING EVENTS FROM TABLE */
/** 
 * Deleting everything related to the provided username.
 * THIS FUNCTION ALWAYS RETURNS AN EMPTY ARRAY.
 * DOES NOTHING IF LOGGED IN USER"S INFO IS NOT IN THE DATABASE.
 * 
 * @param {String} username The username of the user you want to delete
 * @return {Array} Always an empty array
 */
export async function deleteUserByUsername(username) {
    let URL = baseURL + deleteByUSERNAME + username;
    await fetchForMe(URL, deleteHeader);
}

/* HELPER FUNCTION(S) */
/**
 * Helper function to fetch data from our local server/database
 * via the API Endpoints using the browser's fetch().
 * (The server does not have direct access to our database,
 * which is why we need to create this "middle man")
 * 
 * @param {string} URL The URL of the Endpoint
 * @param {Object} header An object that contains "method" property with
 *                        the following values: GET, POST, DELETE, UP
 * @returns {*} Whatever was returned by the Endpoint after parsed with json()
 */
async function fetchForMe(URL, header) {
    let retData = [];

    try {
        let response = await fetch(URL, header);
        let rows = await response.json();

        if (rows) {
            for (let i = 0; i < rows.length; i++) {
                retData.push(rows[i]);
            }
        }
    }
    catch (err) {
        console.log(err);
    }

    return retData;
}
