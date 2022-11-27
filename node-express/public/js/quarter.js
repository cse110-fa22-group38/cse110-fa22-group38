import * as dbAPI from "./databaseAPI.js";

// predefined quarter start and end date for FA2022
const quarter = {
	start: "2022-09-22T07:00:00.000Z",
	end: "2022-12-10T19:59:59.000Z",
};

// Waiting for the html page 
window.addEventListener('DOMContentLoaded', init);

async function init() {
	// 1) Retrieve all the events for this quarter based on the date range
	// From the database
	// Converting the strings into universal time first
	let universal_start = new Date(quarter.start);
	let universal_end = new Date(quarter.end);
	let universal_start_string = universal_start.toISOString();
	let universal_end_string = universal_end.toISOString();

	console.log(universal_start_string);
	console.log(universal_end_string);

	let deArray = await retrieveFromDatabase(universal_start_string, universal_end_string);
	console.log(deArray);
	
	// 2) Build the calendar from the data that we just grabbed.
	buildCalendar(deArray);
}

async function buildCalendar(deArray) {
	let qstart = new Date(quarter.start);
	let qend = new Date(quarter.end);
	
	let currdate = qstart;
	let calendar = document.querySelector(".calendar");
	
	let numweek = 1
	let week = document.createElement("tr");
	
	if (qstart.getDay() == 4) {
		//if we start on a thursday there is a week 0"
		numweek = 0;
	}
	
	// set up first week (becuase it is special :) )
	let weeknum = document.createElement("td");
	weeknum.innerHTML = `${numweek}`;
	weeknum.classList.add("week-number");
	week.appendChild(weeknum);
	numweek++;
	
	for (let i = 0; i < currdate.getDay(); i++) {
		week.appendChild(document.createElement("td"));
		calendar.appendChild(week);
	}
	let i = 0;

	/*Putting elements in calendar happens here:*/
	while (currdate <= qend) {
		//make a new week if we are on a sunday beucase sunday is the first day of the week
		if(currdate.getDay() == 0) {
			week = document.createElement("tr");
			calendar.appendChild(week);
			
			let weeknum = document.createElement("td");
			weeknum.innerHTML = `${numweek}`;
			weeknum.classList.add("week-number");
			numweek++;
			week.appendChild(weeknum)
		}
		let day = document.createElement("td");
		
		/*Stuff in the boxes goes here:*/
		//let events = Databaseething.getByDate(currday.toISOString);
		
		day.innerHTML = `
		<div class="date-value">${currdate.getDate()}</div>
		
		`;
		day.classList.add("day-container");
		day.classList.add(currdate.toISOString())
		
		let eventcontainer = document.createElement("div");
		eventcontainer.classList.add("event-container");

        // if event date == currDate
		
        // create a qevent object

        // eventcontainer.appendchild(qevent)
        

		let taskcontainer = document.createElement("div");
		taskcontainer.classList.add("task-container");

        // if task date == currDate
		
        // create a qtask object

        // taskcontainer.appendchild(qevent)
		

		//for each event in eventsfromdatabase {add the event to the box in some clever way}
		//for each task in eventsfromdatabase {add the event to the box in some clever way}
		
		day.appendChild(eventcontainer);
		day.appendChild(taskcontainer);
		
		week.appendChild(day);
		currdate.setDate(currdate.getDate() + 1);
		i++;
	}
}

// Retrieving this quarter's events within
async function retrieveFromDatabase(start_date, end_date) {
    return await dbAPI.queryThisQuarterEvents(start_date, end_date);
}