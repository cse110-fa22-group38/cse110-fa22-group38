import * as dbAPI from "./databaseAPI.js";

// predefined quarter start and end date for FA2022
let quarter = {
	start: "",
	end: "",
};

// Waiting for the html page 
window.addEventListener('DOMContentLoaded', init);

async function init() {
	// 1.a) query for quarter objects from the database
	let qA = await dbAPI.queryTypeFromEvents('quarter');

	// 1.b) select the quarter we are currently in OR if not in a quarter, select the upcoming quarter
	// Note: Date.parse returns milliseconds since 1970
	const today = Date.parse(new Date()); // in milliseconds since 1970

	// Iterating over all the quarter objects to find the current quarter
	for (let i = 0; i < qA.length; i++) {
		qA[i].start = Date.parse(qA[i]['event_start']); // in milliseconds since 1970
		qA[i].end = Date.parse(qA[i]['event_end']); // in milliseconds since 1970

		// We found the current quarter if both conditions are true
		if (qA[i].start < today && qA[i].end > today) {
			quarter.start = qA[i]["event_start"];
			quarter.end = qA[i]["event_end"];
			break;
		}
		// Saving the dates for upcoming quarter as well
		if (qA[i].start > today) {
			quarter.startNext = qA[i]["event_start"];
			quarter.endNext = qA[i]["event_end"];
			break;
		}
	}

	// If current quarter is not found, we will take the upcoming quarter
	if (quarter.start == "") {
		// search for upcoming quarter
		quarter.start = quarter.startNext;
		quarter.end = quarter.endNext;
	} 
	// If there are still no valid quarters to choose from, 
	// display a message 'add a quarter to show here'
	if (quarter.start == "") {
		// If there is no quarter
		console.error("Can't display quarter if there is no quarter to display *taps head*")
	}

	// 2) Retrieve all the events for this quarter based on the date range
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

	convertDate(deArray);
	
	// 2) Build the calendar from the data that we just grabbed.
	buildCalendar(deArray);
}

function convertDate(deArray) {
	for (let i = 0; i < deArray.length; i++) {
		deArray[i].start = new Date(deArray[i]['event_start'])
		deArray[i].end = new Date(deArray[i]['event_end'])
	}
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
		
		let taskcontainer = document.createElement("div");
		taskcontainer.classList.add("task-container");

		for(let i = 0; i < deArray.length; i++) {
			let event_type = deArray[i]['event_type'];
			let event_start_local = deArray[i].start.toLocaleDateString();
			let currdate_local = currdate.toLocaleDateString();

			if (event_start_local == currdate_local) {
				let newDiv = document.createElement('div');
				if (event_type == 'event') {
					qevent(newDiv, deArray[i]);
					eventcontainer.appendChild(newDiv);
				}
				else if (event_type == 'exam') {
					qexam(newDiv, deArray[i]);
					eventcontainer.appendChild(newDiv);
				}
				else if (event_type == 'task'){
					qtask(newDiv, deArray[i]);
					taskcontainer.appendChild(newDiv);
				}
			}
		}

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