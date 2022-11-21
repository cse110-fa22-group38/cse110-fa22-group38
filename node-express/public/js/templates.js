/**
 * sample test data
 */

// sample event
var d1 = {
    UUID: "John",
    DEID: 1,
    type: "event",
    name: "cse110 lecture",
    relation: "cse110",
    location: "center hall 113",
    details: "this class is difficult",
    start: "2022-11-21T14:00:00.000",
    end: "2022-11-21T15:50:00.000",
    done: false,
    color: "#FF0000"
};

// sample task
var t1 = {
    UUID: "John",
    DEID: 2,
    type: "task",
    name: "lab 1",
    relation: "cse110",
    location: "center hall 113",
    details: "probably some rediculous javascript assignment",
    start: "2022-11-21T17:00:00.000",
    end: "2022-11-21T17:00:00.000",
    done: false,
    color: "#FF0000"
}

// sample exam
var e1 = {
    UUID: "John",
    DEID: 3,
    type: "exam",
    name: "midterm 1",
    relation: "math100a",
    location: "Price Center",
    details: "chapters 2,3,6\ncan use 1 page of notes",
    start: "2022-11-21T12:00:00.000",
    end: "2022-11-21T12:50:00.000",
    done: false,
    color: "#0033AA"
}

var darray = [d1,t1,e1];

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
 * Timeline Event
 * 
 * This function attaches html elements and fills in appropriate data from the dataentry object.
 * This element goes in a timeline
 * 
 * @param {HTMLElement} element element to attach data to
 * @param {dataentry} de data entry object to attacht to the element
 */
function tevent(element, de) {
    if (!element) return;
    if (!de) return;

    //setup absolute positioning for timing events

    let start = new Date(de.start);
    let end = new Date(de.end);

    let top = ((start.getHours() - 6) + (start.getMinutes() / 60)) / .18;
    let bottom = 100 - ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    

    // if time is shorter than 1 hour, use a different display type with less information
    if ((end - start) < 3600000) {
        let elapsedTime = ((end.getTime() - start.getTime()) / 60000) % 61; //in minutes

        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de.name}</p>
            <p class="location">${elapsedTime} min | ${de.location}</p>
        </div>
        `;
    } else {
        element.innerHTML = `
        <div class="tevent-box">
            <p class="name">${de.name}</p>
            <p class="location">${de.location}</p>
            <p class="time">${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        </div>
        `;
    }
    element.style=`background-color: ${de.color}; top: ${top}%; bottom: ${bottom}%; overflow: hidden;`;
    element.classList.add("ID" + de.DEID);
    element.classList.add("tevent");
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
    let end = new Date(de.end);

    let top = ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    element.innerHTML = `
        <div style="background-color: ${de.color};"></div>
        `;
    element.style = `top: ${top}%`;
    element.classList.add("ttask");
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
    let start = new Date(de.start);
    let end = new Date(de.end);

    //define contents and fill in using information from de object
    element.innerHTML = `
    <div class="levent-box">
        <p class="name">${de.name}</p>
        <p class="location">${de.location}</p>
        <p class="time">${start.toDateString()} | ${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
        <p class="details">${de.details} </p>
    </div>
    `;
    element.style=`background-color: ${de.color}; height: match-content;`;
    element.classList.add("ID" + de.DEID);
    element.classList.add("levent");
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
    let start = new Date(de.start);
    let end = new Date(de.end);

    //set checked or not checked

    let checked = '';

    if (de.done) {
        checked = "checked";
    }

    //define contents and fill in using information from de object
    element.innerHTML = `
    <div class="ltask-box">
        <span style="display: flex; gap: 10px; height: match-content; align-items: center;">
            <input id="done${de.DEID}" style="height: 12pt; width: 12pt; margin: 0px;" type="checkbox" ${checked}></input>
            <div style="margin: 0px;" class="name">${de.name} | ${de.relation}</div>
        </span>
        <p class="location">${de.location}</p>
        <p class="time">Due ${start.toDateString()} @ ${end.toLocaleTimeString()}</p>
        <p class="details">${de.details}</p>
    </div>
    `;
    element.style=`background-color: ${de.color}; height: match-content;`;
    element.classList.add("ID" + de.DEID);
    element.classList.add("ltask");
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
    element.classList.add("ID" + de.DEID);
    element.style = `background-color: ${de.color}`;
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
    element.classList.add("ID" + de.DEID);
    element.style = `background-color: ${de.color}`;
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
    element.classList.add("ID" + de.DEID);
    element.innerHTML = `
    <div class="qexam-dot"></div>
    `;
    element.style = `background-color: ${de.color}`;
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
