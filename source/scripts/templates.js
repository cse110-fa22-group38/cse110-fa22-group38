/**
 * random test object
 */

console.log("templates ran");

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
    done: 0,
    color: "#FF0000"
};

/**
 * These are functions that add html components to an object you pass in with a particular data-entry object.
 */

/**
 * Events for the **timelines** on the Today-View and Weekly View
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
            <p class="location">${elapsedTime} minutes ${de.location}</p>
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

function ttask(element, de) {
    if (!element) return;
    if (!de) return;
    let end = new Date(de.end);

    let top = ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;

    console.log(bottom);

    // if time is shorter than 1 hour, use a different display type
    if ((end - start) < 3600000) {

    }
    element.innerHTML = `
    <div class="tevent-box">
        <p class="name">${de.name}</p>
        <p class="location">${de.location}</p>
        <p class="time">${start.toLocaleTimeString()} — ${end.toLocaleTimeString()}</p>
    </div>
    `
    element.style=`background-color: ${de.color}; top: ${top}%; bottom: ${bottom}%; overflow: hidden;`;
    ;
}

class ttask extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        let div = document.createElement("div");
        let style = document.createElement("style");
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(div);
        console.log("constructed");
    }
    set data(de) {
        if (!de) return;
        const div = this.shadowRoot.querySelector("div");
        const style = this.shadowRoot.querySelector("style");

        let end = new Date(de.end);

        div.innerHtml = ``;
        let top = ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;
        style.innerHTML = `
        div {
            background-color: ${de.color};
            height: 5px;
            position: absolute;
            top: ${top}%;
            width: 100%;
            border-radius: 3px;
        }
        `;
    }
}

/**
 * Templates for lists of objects on the Today iewid
 */

class levent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        let div = document.createElement("div");
        let style = document.createElement("style");
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(article);
    }
    set data(de) {
        if (!de) return;
        const div = this.shadowRoot.querySelector("div");
        const style = this.shadowRoot.querySelector("style");
        article.innerHtml = ``;
        let top = ((start.getHours() - 6) + (start.getMinutes() / 60)) / .18;
        let bottom = ((end.getHours() - 6) + (end.getMinutes() / 60)) / .18;
        style.innerHTML = `
        div {
            background-color: ${de.color};
            height: 5px;
            position: absolute;
            top: ${bottom}%;
        }
        `;
    }
}

class ltask extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        let article = document.createElement("article");
        let style = document.createElement("style");
        style.innerHTML = ``;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(article);
    }
    set data(de) {
        if (!de) return;
        const article = this.shadowRoot.querySelector("article");
        article.innerHtml = ``;
    }
}

/**
 * Templates for the Quarter View
 */

class qevent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        let article = document.createElement("article");
        let style = document.createElement("style");
        style.innerHTML = ``;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(article);
    }
    set data(de) {
        if (!de) return;
        const article = this.shadowRoot.querySelector("article");
        article.innerHtml = ``;
    }
}

class qtask extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        let article = document.createElement("article");
        let style = document.createElement("style");
        style.innerHTML = ``;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(article);
    }
    set data(de) {
        if (!de) return;
        const article = this.shadowRoot.querySelector("article");
        article.innerHtml = ``;
    }
}

class qexam extends HTMLElement {
}

window.addEventListener('DOMContentLoaded', init);

function init() {
    console.log("init ran");
    let body = document.querySelector("body");
    let event = document.createElement("div");
    body.appendChild(event);
    tevent(event, d1);
    event.data = d1;
    event.classList.add("tevent");

    //position on timeline

    let start = new Date(d1.start);
    let end = new Date(d1.end);

    let task = document.createElement("t-task");
    task.data = d1;
    body.appendChild(task);
}