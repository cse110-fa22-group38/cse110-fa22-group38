// Waiting for the html page 
window.addEventListener('DOMContentLoaded', init);
function init() {
	let quarter = {
		start: "2022-09-22T00:00:00",
		end: "2022-12-10T00:00:00"
	};
	
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
	
	// set up first week (becuase it is specail :) )
	let weeknum = document.createElement("td");
	weeknum.innerHTML = `${numweek}`;
	weeknum.classList.add("week-number");
	week.appendChild(weeknum);
	numweek++;
	
	for (let i = 0; i < currdate.getDay(); i++) {
		week.appendChild(document.createElement("td"));
		console.log("this thing ran lol");
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
		
		console.log(currdate.toISOString());
		week.appendChild(day);
		currdate.setDate(currdate.getDate() + 1);
		i++;
	}
}

async function retrieveFromDatabase() {
    return awa
}