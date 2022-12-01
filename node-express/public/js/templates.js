/**
 * Sample test event object
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

/**
 * Sample test array of event object
 */
var darray = [dataentry];

/**
 * These are functions that add html components to an object you pass in
 * with a particular data-entry object.
 */
/************************************************************************* 
 * IMPORTANT USAGE INFORMATION:
    
    // pick the correct container for the element
    let container = document.querySelector("<where the element will go>");

    // make an empty <div> to pass in
    let Emptydiv = document.createElement("div");
    
    // pass in <div> and the dataentry you want used to fill the function.
    tevent(Emptydiv, darray[0]); // this modifys the <div> to make it an event for the timeline.

    // add <div> to the container
    container.appendChild(Div);
**************************************************************************/

/**************************************************************************************** 
 * Templates for timelines of objects on the Today/Week views: tevent, ttask */

/**
 * Helper function that redirect to a "pop up" page 
 * that displays more details for an event 
 * based on the provided event's id
 * 
 * @param {String} event_id The id of the event
 */
 function displayPopUp(event_id) {
    let URL = `/popup/${event_id}`;
    window.location.href = URL;
}

/**
 * Timeline Event
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a timeline.
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function tevent(element, de) {
    if (!element) return;
    if (!de) return;

    //setup absolute positioning for timing events

    let start = new Date(de['event_start']);
    let end = new Date(de['event_end']);

    let bottom, top;

    // check if start time is before 6AM
    if (start.getHours() < 6) {
        top = 0;
    } else {
        top = ((start.getHours() - 6) + (start.getMinutes() / 60)) / .18;
    }

    // check if the end time for an event is on a different day (i.e. tomorrow or like 12:00AM)
    if (end.getDate() != start.getDate()) {
        bottom = 0;
    } else {
        bottom = (100 - ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18);
    }

    

    // if time is shorter than 1 hour, use a different display type with less information
    if ((end - start) < 3600000) {
        let elapsedTime = ((end.getTime() - start.getTime()) / 60000) % 61; //in minutes

        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de['event_name']}</p>
            <p class="location">${elapsedTime} min | ${de['event_location']}</p>
        </div>
        `;
        element.style=`background-color: ${de['event_color']}; width: 100%; top: ${top}%; bottom: ${bottom}%; overflow: hidden;`;
        // if event is longer than 18 hours it is an all-day event
    } else if ((end - start) > 72000000) {
        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">All Day: ${de['event_name']}</p>
        </div>
        `;
        element.style=`background-color: ${de['event_color']}; position: relative; width: 50%; height: 22pt; left: 0%; overflow: hidden;`;
        // if event is more than 4 hours, make it less wide
    } else if ((end - start) > 14400000) {
        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de['event_name']}</p>
            <p class="location">${de['event_location']}</p>
            <p class="time">${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        </div>
        `;
        element.style=`background-color: ${de['event_color']}; top: ${top}%; bottom: ${bottom}%; left: 50%; right: 0%; overflow: hidden;`;
    } else {
        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de['event_name']}</p>
            <p class="location">${de['event_location']}</p>
            <p class="time">${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        </div>
        `;
        element.style=`background-color: ${de['event_color']}; width: 100%; top: ${top}%; bottom: ${bottom}%; overflow: hidden;`;
    }
    element.classList.add("ID" + de['event_id']);
    element.classList.add("tevent");

    element.addEventListener('click', () => {
        displayPopUp(de["event_id"]);
    });
}

/**
 * Timeline Task
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a timeline.
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function ttask(element, de) {
    if (!element) return;
    if (!de) return;
    let end = new Date(de['event_end']);

    let top = ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    element.innerHTML = `
        <div style="background-color: ${de['event_color']};"></div>
        `;
    element.style = `top: ${top}%`;
    element.classList.add("ID" + de['event_id']);
    element.classList.add("ttask");

    element.addEventListener('click', () => {
        displayPopUp(de["event_id"]);
    });
    ;
}

/*******************************************************************
 * Templates for lists of objects on the Today view: ltask, levent */

/**
 * List Event
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a list.
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function levent(element, de) {
    if (!element) return;
    if (!de) return;

    //create start and end Date objects for time manipulation
    let start = new Date(de['event_start']);
    let end = new Date(de['event_end']);

    //define contents and fill in using information from de object
    element.innerHTML = `
    <div class="levent-box">
        <p class="name">${de['event_name']}</p>
        <p class="location">${de['event_location']}</p>
        <p class="time">${start.toDateString()} | ${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        <p class="details">${de['event_details']} </p>
    </div>
    `;
    element.style=`background-color: ${de['event_color']}; height: match-content;`;
    element.classList.add("ID" + de['event_id']);
    element.classList.add("levent");
    element.addEventListener('click', () => {
        displayPopUp(de["event_id"]);
    });
}

/**
 * List Task
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a list.
 * 
 * Note: checkbox can be accessed using id=done${DEID}
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function ltask(element, de) {
    if (!element) return;
    if (!de) return;

    //create start and end Date objects for time manipulation
    let start = new Date(de['event_start']);
    let end = new Date(de['event_end']);

    //set checked or not checked

    let checked = '';

    if (de['event_completed']) {
        checked = "checked";
    }

    //define contents and fill in using information from de object
    element.innerHTML = `
    <div class="ltask-box">
        <span style="display: flex; gap: 10px; height: match-content; align-items: center;">
            <input id="done${de['event_id']}" style="height: 12pt; width: 12pt; margin: 0px;" type="checkbox" ${checked}></input>
            <div style="margin: 0px;" class="name">${de['event_name']} | ${de['event_relation']}</div>
        </span>
        <p class="location">${de['event_location']}</p>
        <p class="time">Due ${start.toDateString()} @ ${end.toLocaleTimeString()}</p>
        <p class="details">${de['event_details']}</p>
    </div>
    `;
    element.style=`background-color: ${de['event_color']}; height: match-content;`;
    element.classList.add("ID" + de['event_id']);
    element.classList.add("ltask");
    element.addEventListener('click', () => {
        displayPopUp(de["event_id"]);
    });
}

/********************************
 * Templates for the Quarter View
 */

/**
 * Quarter Event
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a quarter view day.
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function qevent(element, de) {
    if (!element) return;
    if (!de) return;
    element.classList.add("qevent");
    element.classList.add("ID" + de['event_id']);
    element.style = `background-color: ${de['event_color']}`;
    element.addEventListener('click', () => {
        displayPopUp(de["event_id"]);
    });
}

/**
 * Quarter Task
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a quarter view day.
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function qtask(element, de) {
    if (!element) return;
    if (!de) return;
    element.classList.add("qtask");
    element.classList.add("ID" + de['event_id']);
    element.style = `background-color: ${de['event_color']}`;
    element.addEventListener('click', () => {
        displayPopUp(de["event_id"]);
    });
}

/**
 * Quarter Exam
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a quarter view day.
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function qexam(element, de) {
    if (!element) return;
    if (!de) return;
    element.classList.add("qexam");
    element.classList.add("ID" + de['event_id']);
    element.innerHTML = `
    <div class="qexam-dot"></div>
    `;
    element.style = `background-color: ${de['event_color']}`;
    element.addEventListener('click', () => {
        displayPopUp(de["event_id"]);
    });
}

/**
 * Settings Dataentry
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a table on the settings page.
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function sde(element, de) {
    let i = 0;
}
