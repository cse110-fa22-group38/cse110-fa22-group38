let PORT = 6900;
let baseURL = "http://localhost:" + PORT + "/";

// All URLS for the end points
let usersUUID = "api/users/uuid/";
let usersUSERNAME = "api/users/username/";
let eventsUUID = "api/events/uuid/";
let eventsDEID = "api/events/event_id/";
let eventsTYPE = "api/events/event_type";
let eventsNAME = "api/events/event_name/";
let eventsLOCATION = "api/events/event_location/";
let eventsRELATION = "api/events/event_relation/";
let eventsDETAILS = "api/events/event_details/";
let eventsSTART = "api/events/event_start/";
let eventsEND = "api/events/event_end/";
let eventsCOMPLETED = "api/events/event_completed/";
let eventsCOLOR = "api/events/event_color/";
let deleteByUSERNAME = "api/users/delete/";

const options =  {
    method: 'GET',
}

const options2 = {
    method: 'DELETE',
}

// From table users
export async function queryUsernameFromUsers(username) {
    let URL = baseURL + usersUSERNAME + username;
    return await fetchForMe(URL, options);
}

export async function queryUUIDFromUsers(uuid) {
    let URL = baseURL + usersUUID + uuid;
    return await fetchForMe(URL, options);
}

// From table events
export async function queryUUIDFromEvents(uuid) {
    let URL = baseURL + eventsUUID + uuid;
    return await fetchForMe(URL, options);
}

export async function queryDEIDFromEvents(deid) {
    let URL = baseURL + eventsDEID + deid;
    return await fetchForMe(URL, options);
}

export async function queryTypeFromEvents(type) {
    let URL = baseURL + eventsTYPE + type;
    return await fetchForMe(URL, options);
}

export async function queryNameFromEvents(name) {
    let URL = baseURL + eventsNAME + name;
    return await fetchForMe(URL, options);
}

export async function queryLocationFromEvents(location) {
    let URL = baseURL + eventsLOCATION + location;
    return await fetchForMe(URL, options);
}

export async function queryRelationFromEvents(relation) {
    let URL = baseURL + eventsRELATION + relation;
    return await fetchForMe(URL, options);
}

export async function queryDetailsFromEvents(details) {
    let URL = baseURL + eventsDETAILS + details;
    return await fetchForMe(URL, options);
}

export async function queryStartFromEvents(start) {
    let URL = baseURL + eventsSTART + start;
    return await fetchForMe(URL, options);
}

export async function queryEndFromEvents(end) {
    let URL = baseURL + eventsEND + end;
    return await fetchForMe(URL, options);
}

export async function queryDoneFromEvents(done) {
    let URL = baseURL + eventsCOMPLETED + done;
    return await fetchForMe(URL, options);
}

export async function queryColorFromEvents(color) {
    let URL = baseURL + eventsCOLOR + color;
    return await fetchForMe(URL, options);
}

// Deleting a user based on their username from the users table
// This function always returns an empty array
export async function deleteUserByUsername(username) {
    let URL = baseURL + deleteByUSERNAME + username;
    await fetchForMe(URL, options2);
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
