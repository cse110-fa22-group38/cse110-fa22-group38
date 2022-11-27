let PORT = 6900;
let baseURL = "http://localhost:" + PORT + "/";

// All URLS for the end points
let usersUSERNAME = "api/users/username/";
let eventsDEID = "api/events/event_id/";
let eventsTYPE = "api/events/event_type/";
let eventsNAME = "api/events/event_name/";
let eventsLOCATION = "api/events/event_location/";
let eventsRELATION = "api/events/event_relation/";
let eventsDETAILS = "api/events/event_details/";
let eventsSTART = "api/events/event_start/";
let eventsEND = "api/events/event_end/";
let eventsCOMPLETED = "api/events/event_completed/";
let eventsCOLOR = "api/events/event_color/";
let deleteByUSERNAME = "api/users/delete/";
let eventsTODAY = "api/events/today";
let eventsTHISWEEK = "api/events/this_week";
let eventsTHISMONTH = "api/events/this_month";
let eventsTHISQUARTER = "api/events/";

const getHeader =  {
    method: 'GET',
}

const deleteHeader = {
    method: 'DELETE',
}

/* PRIVATE INTERNAL ENDPOINTS */
// From table users
export async function queryUsernameFromUsers(username) {
    let URL = baseURL + usersUSERNAME + username;
    return await fetchForMe(URL, getHeader);
}

export async function queryUUIDFromUsers(uuid) {
    let URL = baseURL + usersUUID + uuid;
    return await fetchForMe(URL, getHeader);
}

// From table events
export async function queryDEIDFromEvents(deid) {
    let URL = baseURL + eventsDEID + deid;
    return await fetchForMe(URL, getHeader);
}

export async function queryTypeFromEvents(type) {
    let URL = baseURL + eventsTYPE + type;
    return await fetchForMe(URL, getHeader);
}

export async function queryNameFromEvents(name) {
    let URL = baseURL + eventsNAME + name;
    return await fetchForMe(URL, getHeader);
}

export async function queryLocationFromEvents(location) {
    let URL = baseURL + eventsLOCATION + location;
    return await fetchForMe(URL, getHeader);
}

export async function queryRelationFromEvents(relation) {
    let URL = baseURL + eventsRELATION + relation;
    return await fetchForMe(URL, getHeader);
}

export async function queryDetailsFromEvents(details) {
    let URL = baseURL + eventsDETAILS + details;
    return await fetchForMe(URL, getHeader);
}

export async function queryStartFromEvents(start) {
    let URL = baseURL + eventsSTART + start;
    return await fetchForMe(URL, getHeader);
}

export async function queryEndFromEvents(end) {
    let URL = baseURL + eventsEND + end;
    return await fetchForMe(URL, getHeader);
}

export async function queryDoneFromEvents(done) {
    let URL = baseURL + eventsCOMPLETED + done;
    return await fetchForMe(URL, getHeader);
}

export async function queryColorFromEvents(color) {
    let URL = baseURL + eventsCOLOR + color;
    return await fetchForMe(URL, getHeader);
}

/* QUERYING EVENTS FROM TABLE */
/* This function contacts the database to grab today's events 
 * for the logged in user (full 24 hours) in their LOCAL TIME.
 * 
 * @params NO param needed
 * @return An ARRAY of dataentry objects if any events
 *         An empty ARRAY otherwise
 */
export async function queryTodayEvents() {
    let URL = baseURL + eventsTODAY;
    return await fetchForMe(URL, getHeader);
}

/* This function contacts the database to grab this week's events 
 * for the logged in user (full 24 hours) in their LOCAL TIME.
 * 
 * @params NO param needed
 * @return An ARRAY of dataentry objects if any events
 *         An empty ARRAY otherwise
 */
export async function queryThisWeekEvents() {
    let URL = baseURL + eventsTHISWEEK;
    return await fetchForMe(URL, getHeader);
}

/* This function contacts the database to grab this month's events 
 * for the logged in user (full 24 hours) in their LOCAL TIME.
 * 
 * @params NO param needed
 * @return An ARRAY of dataentry objects if any events
 *         An empty ARRAY otherwise
 */
export async function queryThisMonthEvents() {
    let URL = baseURL + eventsTHISMONTH;
    return await fetchForMe(URL, getHeader);
}

/* This function contacts the database to grab this quarter's events 
 * within a specified date range 
 * for the logged in user (full 24 hours) in their LOCAL TIME.
 * 
 * @param start_date The start date of the quarter in universal time (UTC)
 * @param end_date The end date of the quarter in universal time (UTC)
 * 
 * @return An ARRAY of dataentry objects if any events
 *         An empty ARRAY otherwise
 */
export async function queryThisQuarterEvents(start_date, end_date) {
    let URL = baseURL + eventsTHISQUARTER + start_date + "/" + end_date;
    return await fetchForMe(URL, getHeader);
}

// Example of a dataentry object
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
/* Deleting everything related to the provided username.
 * THIS FUNCTION ALWAYS RETURNS AN EMPTY ARRAY.
 * DOES NOTHING IF LOGGED IN USER"S INFO IS NOT IN THE DATABASE.
 * 
 * @params username The username of the user you want to delete
 * @return A;ways an empty array
 */
export async function deleteUserByUsername(username) {
    let URL = baseURL + deleteByUSERNAME + username;
    await fetchForMe(URL, deleteHeader);
}

// Helper function to fetch data from our local server/database
// via the API Endpoints
// (The server does not have direct access to our database,
// which is why we need to create this "middle man")
async function fetchForMe(URL, header) {
    let retData = [];

    try {
        let response = await fetch(URL, header);
        let rows = await response.json();

        if (rows) {
            for (let i = 0; i < rows.row.length; i++) {
                retData.push(rows.row[i]);
            }
        }
    }
    catch (err) {
        console.log(err);
    }

    return retData;
}
