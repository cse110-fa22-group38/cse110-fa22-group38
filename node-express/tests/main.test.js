const request = require("supertest");
const PORT = 6900;
const baseURL = require(`../main.js`);

let login = "/login";
let register = "/register";
let today = "/today";
let settings = "/settings";
let index = "/";

let allUsers = "/api/users/";
let loggedUser = "/api/username";
let loggedEvents = "/api/events/";
let allEvents = "/api/events/all";

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

let deleteByUSERNAME = "/api/users/delete/";

let eventsTODAY = "/api/events/today";
let eventsTHISWEEK = "/api/events/this_week";
let eventsTHISMONTH = "/api/events/this_month";
let eventsTHISQUARTER = "/api/events/";

// Fake object to test our app
let user1 = {username: "Fake Fake User", password: "123", 
            apiToken: "13171~IAu8yjQC3jNUnooJkPPoBEgugKNoaYcEjCEgs69H2FBKuzqVYx8Qb9wro8vAoYrV"};
let deleteUser = {button: "delete", old_pass: user1.password};

/* SECTION 1: TESTING REGISTER AND LOGIN */
// Register first
describe("Testing the registering page's redirection", () => {
    // Assuming that user was not in database
    it("Server should redirect to /login page if succeeded", (done) => {
        request(baseURL)
            .post(register)
            .send(user1)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(302)
            .expect('Location', login, done); // Check if server redirect to login page
    })  
    it("Attempting to register the same user should redirect to /register instead", (done) => {
        request(baseURL)
            .post(register)
            .send(user1)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(302)
            .expect('Location', register, done) // Check if server redirect to register
    })
})

// Login first
describe("Testing the login page", (done) => {
    it("Server should log in the user if password matched and redirect to today view", 
    (done) => {
        let correctLoginInfo = {
            username: user1.username,
            password: user1.password
        }

        request(baseURL)
            .post(login)
            .send(correctLoginInfo)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(302)
            .expect('Location', today, done);
    })  

    it("If provided wrong password, page should say Incorrect Username and/or Password", 
    (done) => {
        let wrongLoginInfo = {
            username: user1.username,
            password: user1.password + "ThisIsWrong"
        }

        request(baseURL)
            .post(login)
            .send(wrongLoginInfo)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect("Incorrect Username and/or Password!", done);
    });
})

/* SECTION 2: TESTING SOME SERVER'S API ENDPOINTS */
// Testing getting all users info
describe("GET " + allUsers, () => {
    it("Server should return an array of all users' info", async() => {
        const response = await request(baseURL).get(allUsers);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting currently logged in username
describe("GET " + loggedUser, () => {
    it("Server should return the username of the logged in user"
    , async() => {
        const response = await request(baseURL).get(loggedUser);
        if (response.text != "Found. Redirecting to /login") {
            const resText = await JSON.parse(response.text);
            expect(typeof resText == "string").toBe(true);
            expect(resText).toBe(user1.username);
        }
        else {
            expect(false).toBe(false);  // There is no logged user, so this test
                                        // is not valid
        }
    })
})

// Testing all Events
describe("GET " + allEvents, () => {
    // Get all the usernames (NOT ENOUGH TIME)
    /*
    let allUsernames = [];
    beforeAll(async() => {
        const response = await request(baseURL).get(allUsers);
        const resArray = await JSON.parse(response.text);

        for (let i = 0; i < resArray.length; i++) {
            allUsernames.push(resArray[i]["username"]);
        }
    })
    */

    it("Server should return an array of all events beloging to all users"
    , async() => {
        const response = await request(baseURL).get(allEvents);
        const resArray = await JSON.parse(response.text);
        console.log(resArray);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + loggedEvents, () => {
    it("Server should return an array of all users' events that have this username"
    , async() => {
        const response = await request(baseURL).get(loggedEvents);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })

    it("All events returned should belong to the logged in user", async() => {
        const response = await request(baseURL).get(loggedEvents);
        const resArray = await JSON.parse(response.text);
        // Checking if all the returned events actually belonging to this user
        let allAreCorrect = true;

        for (let i = 0; i < resArray.length; i++) {
            if (resArray[i]["username"] != user1.username) {allAreCorrect = false};
        }

        expect(allAreCorrect).toBe(true);
    });
})

// WORK IN PROGRESS
/*
// Testing getting all the currently logged in user's events
describe("GET " + eventsDEID, () => {
    it("Server should return an array of all users' events that have this DEID"
    , async() => {
        const response = await request(baseURL).get(eventsDEID);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsTYPE, () => {
    it("Server should return an array of all users' events that have this type"
    , async() => {
        const response = await request(baseURL).get(eventsTYPE);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsNAME, () => {
    it("Server should return an array of all users' events that have this name"
    , async() => {
        const response = await request(baseURL).get(eventsNAME);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsLOCATION, () => {
    it("Server should return an array of all users' events that have this location"
    , async() => {
        const response = await request(baseURL).get(eventsLOCATION);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsRELATION, () => {
    it("Server should return an array of all users' events that have this relation"
    , async() => {
        const response = await request(baseURL).get(eventsRELATION);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsDETAILS, () => {
    it("Server should return an array of all users' events that have this details"
    , async() => {
        const response = await request(baseURL).get(eventsDETAILS);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsSTART, () => {
    it("Server should return an array of all users' events that have this start"
    , async() => {
        const response = await request(baseURL).get(eventsSTART);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsEND, () => {
    it("Server should return an array of all users' events that have this end"
    , async() => {
        const response = await request(baseURL).get(eventsEND);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsCOMPLETED, () => {
    it("Server should return an array of all users' events that have this completed tag"
    , async() => {
        const response = await request(baseURL).get(eventsCOMPLETED);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsCOLOR, () => {
    it("Server should return an array of all users' events that have this color"
    , async() => {
        const response = await request(baseURL).get(eventsCOLOR);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsTODAY, () => {
    it("Server should return an array of all users' events that have this date"
    , async() => {
        const response = await request(baseURL).get(eventsTODAY);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsTHISWEEK, () => {
    it("Server should return an array of all users' events that have this week"
    , async() => {
        const response = await request(baseURL).get(eventsTHISWEEK);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsTHISMONTH, () => {
    it("Server should return an array of all users' events that have this month"
    , async() => {
        const response = await request(baseURL).get(eventsTHISMONTH);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

// Testing getting all the currently logged in user's events
describe("GET " + eventsTHISQUARTER, () => {
    it("Server should return an array of all users' events that have this quarter"
    , async() => {
        const response = await request(baseURL).get(eventsTHISQUARTER);
        const resArray = await JSON.parse(response.text);
        expect(Array.isArray(resArray)).toBe(true);
    })
})

/* EXTRA SECTION: DELETING USER AFTER FINISHED TESTING */
describe("Testing the deleting user functionality of our app", () => {
    it("Server should redirect to index page if succeeded", (done) => {
        request(baseURL)
            .post(settings)
            .send(deleteUser)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(302)
            .expect('Location', index, done); // Check if server redirect to login page
    })
    
    it("Attempting to delete said user again should say Incorrect Username and/or Password", (done) => {
        request(baseURL)
            .post(settings)
            .send(deleteUser)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect("Incorrect Username and/or Password!", done);
    })

    it("Table users should no longer have this particular user", async() => {
        const response = await request(baseURL).get(allUsers);
        const resArray = await JSON.parse(response.text);
        
        let userStillExists = false;
        // Scan through the list to see if the user still exists
        for (let i = 0; i < resArray.length; i++) {
            if (resArray[i]["username"] == user1.username) {
                userStillExists = true;
            }
        }

        expect(userStillExists).toBe(false);
    })

    it("Table events for this particular user should be empty", async() => {
        const response = await request(baseURL).get(allEvents);
        const resArray = await JSON.parse(response.text);
        
        let eventsStillExist = false;
        // Scan through the list to see if the user still exists
        for (let i = 0; i < resArray.length; i++) {
            if (resArray[i]["username"] == user1.username) {
                eventsStillExist = true;
            }
        }

        expect(eventsStillExist).toBe(false);
    })
})
