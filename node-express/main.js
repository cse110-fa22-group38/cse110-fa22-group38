/**************************************************************************/
/* SECTION 1: SETTING UP EXPRESS SERVER SESSION */

// Loading the appropriate modules from node_modules
/**
 * Initializing express
 */
const express = require('express')
/**
* Initializing app
*/
const app = express();

/**
 * Intializing path
 */
const path = require('path');

/**
 * Initializing md5 to encrypt
 */
const md5 = require('md5');

/**
 * Importing db from our database.js
 */
const db = require("./database.js");

/**
 * Importing our swagger file
 */
const swaggerFile = require("./devs/swagger.json");

/**
 * UI Module to display our swagger file
 */
const swaggerUi = require('swagger-ui-express')

/**
 * Importing main function from canvas API to grab calendar events from canvas
 */
const grabFromCanvas = require("./canvasAPI.js");

/**
 * Logged user's username, which we will use to query the tables:
 */
let logged_user = null;

/**
 * Initializing router
 */
const router = express.Router();

/**
 * Initializing bcrypt
 */
const bcrypt = require('bcrypt');
/**
 * Initializing passport
 */
const passport = require('passport');

/**
 * Initializing express flash
 */
const flash = require('express-flash');

/**
 * Initializing express session
 */
const session = require('express-session');

/**
 * Initializing method Overide
 */
const methodOverride = require('method-override');

/**
 * Initializing bodyparser
 */
const bodyParser = require('body-parser');

// passport-config.js should be in the same folder
/** 
 * Importing our app's passport config (UNUSED)
 */
const initializePassport = require('./passport-config');

/** 
 * Initializing worker threads 
 */
const {resourceLimits} = require('worker_threads');

/**
 * Importing http 
 */
const { request } = require('http');
initializePassport(
    passport,
    username => users.find(user => user.username === username),
    uuid => users.find(user => user.uuid === uuid)
)

/**
 * Store them in local variable inside server (UNUSED)
 */
const users = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serving all the important files via express to our local server
// 1) Serving the javascript files
app.use(express.static(path.join(__dirname + '/public/')));

// tells application form to access them inside req inside post method
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: "ThereIsNoSecret",
    resave: false,
    saveUninitialized: false
}))

// This is for passport-config.js
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

/**************************************************************************/
/* SECTION 2: SETTING UP LINKS TO PAGES */

// Rendering the login.html page
app.get('/login', checkNotAuthenticated, (req, res) => {
    // #swagger.description = 'Getting the login page html'
    res.sendFile(path.join(__dirname + '/../source/login.html'));
})

// index page
app.get('/', checkNotAuthenticated, (req, res) => {
    // #swagger.description = 'Getting the index page html'
    res.sendFile(path.join(__dirname + '/../source/index.html'));
})

// signup page
app.get('/register', checkNotAuthenticated, (req, res) => {
    // #swagger.description = 'Getting the signup page html'
    res.sendFile(path.join(__dirname + '/../source/signup.html'));
})

// Today page
app.get('/today', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    // #swagger.description = 'Getting the today page html'
    res.sendFile(path.join(__dirname + '/../source/today.html'));
})

// Weekly page
app.get('/week', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    // #swagger.description = 'Getting the weekly page html'
    res.sendFile(path.join(__dirname + '/../source/week.html'));
})

// Quarterly page
app.get('/quarter', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    // #swagger.description = 'Getting the quarterly page html'
    res.sendFile(path.join(__dirname + '/../source/quarter.html'));
})

// Settings page
app.get('/settings', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    // #swagger.description = 'Getting the settings page html'
    res.sendFile(path.join(__dirname + '/../source/settings.html'));
})

// Add event page
app.get('/add', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    // #swagger.description = 'Getting the event page html'
    res.sendFile(path.join(__dirname + '/../source/addevent.html'));
})

// Add pop up page
app.get('/popup/:event_id', checkNotAuthenticated, (req, res) => {
    let event_id = req.params.event_id;

    if (logged_user == null) {
        res.redirect("/login");
    }

    // #swagger.description = 'Getting the pop-up page'
    res.sendFile(path.join(__dirname + '/../source/entriesPopup.html'));
})

// Add update page
app.get('/update/:event_id', checkNotAuthenticated, (req, res) => {
    let event_id = req.params.event_id;

    if (logged_user == null) {
        res.redirect("/login");
    }

    // #swagger.description = 'Getting the update event page html'
    res.sendFile(path.join(__dirname + '/../source/updateevent.html'));
})

// Logging out
app.get('/logout', (req, res) => {
    logged_user = null;
    // #swagger.description = 'Logging out the user, setting logged_user to null'
    res.redirect('/') // Redirect to login
})

// Add swagger doc page
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile), ()=> {
    // #swagger.description = 'Logging out the user, setting logged_user to null'
})
    
/**************************************************************************/
/* SECTION 3: SETTING UP FUNCTIONS TO HANDLE OUTPUTS ON CERTAIN PAGES */

// Handling the output on the login page
app.post('/login', checkNotAuthenticated, async(req, res) => {
    // #swagger.description = 'Handling the outputs on the login page.'
    /* #swagger.parameters['username'] = {
        in: "body",
        description: "The username you want to log in",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['password'] = {
        in: "body",
        description: "The password of said username",
        required: true,
        type: "String",
    } */
    
    // Capture the input fields,
    let username = await req.body.username;
    let password = await req.body.password;

    // Making sure they ain't empty
    if (username && password) {
        let queryDB = 'SELECT * FROM users WHERE username = ?';
        db.all(queryDB, [username], (err, results) => {
            if (err) {
                console.log(err);
                throw err;
            }

            // Username found
            if (results.length > 0) {
                results.forEach((result) => {
                    let matched = bcrypt.compareSync(password, result.password_hash);
                    if (matched) {
                        // Authenticate the user
                        res.redirect('/today');
                        console.log("SUCCESS");
                        logged_user = username;
                    } else {
                        // PLACEBO
                        res.send("Incorrect Username and/or Password!");
                    }
                })
            } else {
                // PLACEBO
                res.send("Incorrect Username and/or Password!");
            }
        })
    } else {
        res.send("Please enter USERNAME and PASSWORD!");
        res.end();
    }
})

// Handling the output on the register page
app.post('/register', checkNotAuthenticated, async(req, res) => {
    // #swagger.description = 'Handling the output on the register page.'
    /* #swagger.parameters['username'] = {
        in: "body",
        description: "The username you want to register",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['password'] = {
        in: "body",
        description: "The new password for given username",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['apiToken'] = {
        in: "body",
        description: "The valid Canvas API token for the new account",
        required: true,
        type: "String",
    } */
    try {
        let username = await req.body.username; // Grabbing the username
        let hashedPassword = bcrypt.hashSync(req.body.password, 10); // Hasing the password
        let apiToken = await req.body.apiToken;

        let insertNewUser = `INSERT INTO users (username, password_hash, api_token) VALUES(?, ?, ?)`;

        //insert user in db param : uuid, username, password
        db.run(insertNewUser, [username, hashedPassword, apiToken], async(err) => {
            if (err) {
                // If err thrown, likely that a user already existed in the database
                // with the same username
                console.error('Failed to register new user');
                console.error(err);

                // Redirect back to register so that they can register again
                res.redirect('/register');
            } else {
                console.log('Succesfully registered new user');

                // Instantly populate our database with info from CANVAS
                await grabFromCanvas(username, apiToken);

                // Aftering registering, redirect to the login page
                res.redirect('/login')
            }
        })
    } catch (err) {
        // If somehow failed, redirect to registering again
        res.redirect('/register') // redirect change
        console.error(err);
    }
})

// Handling the outputs on the add event page
app.post('/add', checkNotAuthenticated, async(req, res) => {
    /* #swagger.parameters['event_name'] = {
        in: "body",
        description: "The name of the new event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_type'] = {
        in: "body",
        description: "The type of the new event: event, task, exam or quarter",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_relation'] = {
        in: "body",
        description: "The relation of the new event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_location'] = {
        in: "body",
        description: "The location of the new event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_start_time'] = {
        in: "body",
        description: "The start time of the new event",
        required: true,
        type: "String",
        format: "ISO 8601 yyyy-mm-ddThh:mm:00",
    } */
    /* #swagger.parameters['event_end_time'] = {
        in: "body",
        description: "The end time of the new event",
        required: true,
        type: "String",
        format: "ISO 8601 yyyy-mm-ddThh:mm:00",
    } */
    /* #swagger.parameters['event_details'] = {
        in: "body",
        description: "The details of the new event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_color'] = {
        in: "body",
        description: "The color of the new event",
        required: true,
        type: "String",
        format: "6-digits hex #ffffff",
    } */

    try {
        let event_id = String(Date.now() + Math.floor(Math.random() * 1000));
        let username = logged_user;
        let event_n = req.body.event_name;
        let event_t = req.body.event_type;
        let event_rel = req.body.event_relation;
        let event_loc = req.body.event_location;
        let local_start_time = req.body.event_start_time;
        let local_end_time = req.body.event_end_time;
        let event_details = req.body.event_details;
        let event_color = req.body.event_color;
        let event_completed = Boolean(false);

        // Converting local time into universal time before inserting into db
        let universal_start = new Date(local_start_time);
        let universal_end = new Date(local_end_time);

        start_time = universal_start.toISOString();
        end_time = universal_end.toISOString();

        let INSERT =
            `
        INSERT INTO events (
            username,
            event_id,
            event_type,
            event_name,
            event_relation,
            event_location,
            event_details,
            event_start,
            event_end,
            event_completed,
            event_color) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `;

        let params = [username, event_id, event_t,
            event_n, event_rel, event_loc, event_details,
            start_time, end_time, event_completed,
            event_color
        ];

        //insert user in db param : uuid, username, password
        db.run(INSERT, params, async(err) => {
            if (err) {
                // If err thrown, likely that a user already existed in the database
                // with the same username
                console.error('Failed to add event to DB');
                console.error(err);

                // Redirect back to register so that they can register again
                res.redirect('/add');
            } else {
                console.log('Succesfully added new event for user: ' + username);

                // Aftering registering, redirect to the login page
                res.redirect('/today')
            }
        })
    } catch (err) {
        // If somehow failed, redirect to registering again
        res.redirect('/add') // redirect change
        console.error(err);
    }
})

// Handling the output from the settings page
app.post('/settings', checkNotAuthenticated, async(req, res) => {
    // #swagger.description = 'Handling the output from the settings page.'
    /* #swagger.parameters['button'] = {
        in: "body",
        description: "The button: either update or delete",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['old_pass'] = {
        in: "body",
        description: "The old password of the user",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['new_pass'] = {
        in: "body",
        description: "The new password for the user",
        required: false,
        type: "String",
    } */
    try {
        let button = req.body.button;

        // Handling the update button
        if (button == "update") {
            let sqlUpdate = `UPDATE users set password_hash = COALESCE (?,password_hash) WHERE username = ?`;
            let queryOldPass = 'SELECT * from users WHERE username = ?'
            let password = await req.body.old_pass;
            let hashedNew = bcrypt.hashSync(req.body.new_pass, 10);

            // First check if the user knew the old password
            db.all(queryOldPass, [logged_user], async(err, results) => {
                if (err) {
                    console.err(err);
                    throw err;
                } else {
                    console.log(results);
                    if (results.length > 0) {
                        results.forEach((result) => {
                            let matched = bcrypt.compareSync(password, result.password_hash);

                            if (matched) {
                                // Update user with new passord
                                db.run(sqlUpdate, [hashedNew, logged_user], async(err) => {
                                    if (err) {
                                        console.err(err);
                                        return;
                                    } else {
                                        console.log("PASSWORD SUCCESSFULLY CHANGED FOR USER " + logged_user);
                                        res.redirect('/login');
                                    }
                                })
                            } else {
                                res.redirect('/settings');
                            }
                        })
                    }
                }
            });
        }

        // Handling the delete button
        if (button == "delete") {
            let sqlDelUsers = `DELETE from users WHERE username = ?`;
            let sqlDelEvents = 'DELETE from events WHERE username = ?';
            let queryOldPass = 'SELECT * from users WHERE username = ?';
            let password = await req.body.old_pass;

            db.all(queryOldPass, [logged_user], async(err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    // Username found
                    if (results.length > 0) {
                        results.forEach((result) => {
                            let matched = bcrypt.compareSync(password, result.password_hash);
                            if (matched) {
                                // Delete the user
                                db.run(sqlDelUsers, [logged_user], async(err) => {
                                    if (err) {
                                        console.err(err);
                                        return;
                                    } else {
                                        console.log("SUCCESSFULLY DELETED USER " + logged_user + " FROM TABLE USERS");
                                    }
                                })

                                db.run(sqlDelEvents, [logged_user], async(err) => {
                                    if (err) {
                                        console.err(err);
                                        return;
                                    } else {
                                        console.log("SUCCESSFULLY DELETED USER " + logged_user + " FROM TABLE EVENTS");
                                    }
                                })

                                // Log out the user
                                logged_user = null;

                                // Once finished deleting, redirect to index page
                                res.redirect("/");
                            } else {
                                // PLACEBO
                                // WE WILL FIGURE OUT LATER
                                res.send("Incorrect Username and/or Password!");
                            }
                        })
                    } else {
                        // PLACEBO
                        res.send("Incorrect Username and/or Password!");
                    }
                }
            })
        }
    } catch (err) {
        console.log(err);
    }
})

// Handling the delete button from entriesPopUp page
app.post("/deleteEvent", checkNotAuthenticated, async(req, res) => {
    // #swagger.description = 'Handling the output from the settings page.'
    /* #swagger.parameters['button'] = {
        in: "body",
        description: "The button contains the event_id of the event",
        required: true,
        type: "String",
        format: "String/Number",
    } */
    let eventId = req.body.button;

    try {
        let sqlDelEvent = 'DELETE from events WHERE username = ? and event_id = ?';
        let params = [logged_user, eventId];

        db.run(sqlDelEvent, params, async(err) => {
            if (err) {
                console.error(err);
                throw err;
            } else {
                console.log("SUCCESSFULLY DELETED EVENT " + eventId + " FROM TABLE EVENTS");
                res.redirect('/today');
            }
        })
    } catch (err) {
        console.log("FAILED TO DELETE EVENT " + eventId + " FROM TABLE EVENTS");
        return;
    }
})

// Pressing update button on pop up page
app.post("/updateEvent", checkNotAuthenticated, async(req, res) => {
    // #swagger.description = 'Redirect to the update event page.'
    /* #swagger.parameters['button'] = {
        in: "body",
        description: "The button contains the event_id of the event",
        required: true,
        type: "String",
        format: "String/Number",
    } */
    let eventId = req.body.button;

    try {
        res.redirect(`/update/${eventId}`);
        return;
    } catch (err) {
        // TODO
        console.log("FAILED TO UPDATE EVENT " + eventId + " ON TABLE EVENTS");
        return;
    }
})

// Handling the update button on update event page
app.post("/update", checkNotAuthenticated, async(req, res) => {
    // #swagger.description = 'Handling the update button on update event page.'
    /* #swagger.parameters['event_id'] = {
        in: "body",
        description: "The id of this event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_name'] = {
        in: "body",
        description: "The name of this event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_type'] = {
        in: "body",
        description: "The type of this event: event, task, exam or quarter",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_relation'] = {
        in: "body",
        description: "The relation of this event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_location'] = {
        in: "body",
        description: "The location of this event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_start_time'] = {
        in: "body",
        description: "The start time of this event",
        required: true,
        type: "String",
        format: "ISO 8601 yyyy-mm-ddThh:mm:00",
    } */
    /* #swagger.parameters['event_end_time'] = {
        in: "body",
        description: "The end time of this event",
        required: true,
        type: "String",
        format: "ISO 8601 yyyy-mm-ddThh:mm:00",
    } */
    /* #swagger.parameters['event_details'] = {
        in: "body",
        description: "The details of this event",
        required: true,
        type: "String",
    } */
    /* #swagger.parameters['event_color'] = {
        in: "body",
        description: "The color of this event",
        required: true,
        type: "String",
        format: "6-digits hex #ffffff",
    } */
    try {
        let event_id = req.body.event_id;
        let username = logged_user;
        let event_n = req.body.event_name;
        let event_t = req.body.event_type;
        let event_rel = req.body.event_relation;
        let event_loc = req.body.event_location;
        let local_start_time = req.body.event_start_time;
        let local_end_time = req.body.event_end_time;
        let event_details = req.body.event_details;
        let event_color = req.body.event_color;
        let event_completed = Boolean(false);

        // Converting local time into universal time before inserting into db
        let universal_start = new Date(local_start_time);
        let universal_end = new Date(local_end_time);

        start_time = universal_start.toISOString();
        end_time = universal_end.toISOString();

        let UPDATE =
            `
        UPDATE events SET
            username = COALESCE (?,username),
            event_type = COALESCE (?,event_type),
            event_name = COALESCE (?,event_name),
            event_relation = COALESCE (?,event_relation),
            event_location = COALESCE (?,event_location),
            event_details = COALESCE (?,event_details),
            event_start = COALESCE (?,event_start),
            event_end = COALESCE (?,event_end),
            event_completed = COALESCE (?,event_completed),
            event_color = COALESCE (?,event_color)
        WHERE event_id = ?
        `;

        let params = [username, event_t, event_n, event_rel, event_loc, event_details,
            start_time, end_time, event_completed, event_color, event_id
        ];

        // Update event that matches the event id in database
        db.run(UPDATE, params, async(err) => {
            if (err) {
                // If err thrown, we don't know why
                console.error(`Failed to update ${event_id} event to DB`);
                console.error(err);

                // Redirect back to today view
                res.redirect('/today');
            } else {
                console.log(`Succesfully update event ${event_id} for user: ${username}`);

                // If succeeded, also redirect to today view
                res.redirect('/today')
            }
        })
    } catch (err) {
        console.error(err);
        // Catastrophic error, redirect to index page
        res.redirect('/') // redirect to index
    }
})

/**************************************************************************/
/* SECTION 4: PASSWORD CONFIGS (UNUSED) */

/*
 * This function checks authentication from the array 
 * and checks the output of the query (UNUSED)
 */
function checkAuthenticated(req, res, next) {
    //check if the user is authenticated
    if (req.isAuthenticated()) {
        //if returns true
        return next()
    } else {
        //if returns false
        res.redirect('/')
    }
}

/*
 * This function checks authentication from the array 
 * and checks the output of the query (BROKEN)
 */
function checkNotAuthenticated(req, res, next) {
    //check if the user is authenticated
    if (req.isAuthenticated()) {
        //if returns true
        return res.redirect('/') //change redirect
    } else {
        //if returns false
        next()
    }
}

/**************************************************************************/
/* SECTION 5: DATABASE API ENDPOINTS */

// Get currently logged in user's username
app.get("/api/username", (req, res, next) => {
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    res.json(logged_user);
    // #swagger.description = 'Get currently logged in user's username'
})

// Get all users' info (SECURITY RISK)
app.get("/api/users", (req, res, next) => {
    var sql = "select * from users";
    var params = [];

    return db.all(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(row);
    })
    // #swagger.description = 'Get all users' info (SECURITY RISK)'
});

// Get all events for all users (SECURITY RISK)
app.get("/api/events/all", (req, res, next) => {
    var sql = "select * from events"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all events for all users (SECURITY RISK)'
});

// Get all events belonging to the logged in user
app.get("/api/events", (req, res, next) => {
    var sql = "select * from events where username = ?"
    var params = [logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all events belonging to the logged in user'
});

// Get all by event_color for the logged in user
app.get("/api/events/event_color/:event_color", (req, res, next) => {
    var sql = "select * from events where event_color = ? and username = ?";
    var params = [req.params.event_color, logged_user];

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_color for the logged in user'
    /* #swagger.parameters['event_color'] = {
        in: "params",
        description: "The color of the the events",
        required: true,
        type: "String",
        format: "6-digits hex #ffffff",
    } */
});

// Get all by event_completed for the logged in user
app.get("/api/events/event_completed/:event_completed", (req, res, next) => {
    var sql = "select * from events where event_completed = ? and username = ?"
    var params = [req.params.event_completed, logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_completed for the logged in user'
    /* #swagger.parameters['event_completed'] = {
        in: "params",
        description: "Whether the events are done",
        required: true,
        type: "Boolean",
    } */
});

// Get all by event_end for the logged in user
app.get("/api/events/event_end/:event_end", (req, res, next) => {
    var sql = "select * from events where event_end = ? and username = ?"
    var params = [req.params.event_end, logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows)
    });
    // #swagger.description = 'Get all by event_end for the logged in user'
    /* #swagger.parameters['event_end'] = {
        in: "params",
        description: "The end time of the events",
        required: true,
        type: "Boolean",
        format: "ISO 8601 yyyy-mm-ddThh:mm:00",
    } */
});


// Get all by event_start for the logged in user
app.get("/api/events/event_start/:event_start", (req, res, next) => {
    var sql = "select * from events where event_start = ? and username = ?"
    var params = [req.params.event_start, username]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_start for the logged in user'
    /* #swagger.parameters['event_start'] = {
        in: "params",
        description: "The start time of the events",
        required: true,
        type: "String",
        format: "ISO 8601 yyyy-mm-ddThh:mm:00",
    } */
});

// Get all by event_details for the logged in user
app.get("/api/events/event_details/:event_details", (req, res, next) => {
    var sql = "select * from events where event_details = ? and username = ?"
    var params = [req.params.event_details, logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_details for the logged in user'
    /* #swagger.parameters['event_details'] = {
        in: "params",
        description: "The details of the events",
        required: true,
        type: "String",
    } */
});

// Get all by event_relation for the logged in user
app.get("/api/events/event_relation/:event_relation", (req, res, next) => {
    var sql = "select * from events where event_relation = ? and username = ?"
    var params = [req.params.event_relation, logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_relation for the logged in user'
    /* #swagger.parameters['event_relation'] = {
        in: "params",
        description: "The relation of the events",
        required: true,
        type: "String",
    } */
});

// Get all by event_location for the logged in user
app.get("/api/events/event_location/:event_location", (req, res, next) => {
    var sql = "select * from events where event_location = ? and username = ?"
    var params = [req.params.event_location, logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_location for the logged in user'
    /* #swagger.parameters['event_locationt'] = {
        in: "params",
        description: "The location of the events",
        required: true,
        type: "String",
    } */
});

// Get all by event_name for the logged in user
app.get("/api/events/event_name/:event_name", (req, res, next) => {
    var sql = "select * from events where event_name = ? and username = ?"
    var params = [req.params.event_name, logged_user];

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_name for the logged in user'
    /* #swagger.parameters['event_name'] = {
        in: "params",
        description: "The name of the events",
        required: true,
        type: "String",
    } */
});

// Get all by event_type for the logged in user
app.get("/api/events/event_type/:event_type", (req, res, next) => {
    var sql = "select * from events where event_type = ? and username = ?"
    var params = [req.params.event_type, logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_type for the logged in user'
    /* #swagger.parameters['event_type'] = {
        in: "params",
        description: "The type of the events",
        required: true,
        type: "String",
    } */
});

// Get all by event_id for the logged in user
app.get("/api/events/event_id/:event_id", (req, res, next) => {
    var sql = "select * from events where event_id = ? and username = ?"
    var params = [req.params.event_id, logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.json(rows);
    });
    // #swagger.description = 'Get all by event_id for the logged in user'
    /* #swagger.parameters['event_id'] = {
        in: "params",
        description: "The id of an event",
        required: true,
        type: "String/Number",
    } */
});

// Delete a user in the users table by their username
app.delete("/api/users/delete/:username", (req, res, next) => {
    var deletesql = "delete from users where username = ?"
    var params = [req.params.username];

    db.run(deletesql, params, (err) => {
        if (err) {
            res.status(400).json({ "error": res.message })
            return;
        } else {
            if (this.changes != 0) {
                console.log(username + " wasn't found");
            } else {
                console.log(username + " was succesffuly deleted");
            }
        }
    });
    // #swagger.description = 'Delete a user in the users table by their username'
    /* #swagger.parameters['username'] = {
        in: "params",
        description: "The username we want to delete any related info to",
        required: true,
        type: "String",
    } */
});

// Getting today's events
app.get("/api/events/today", (req, res, next) => {
    // or date of event_end = date of today (in local time)
    var sql = `
    SELECT * from events where 
    strftime('%Y-%m-%d', event_end, 'localtime') = strftime('%Y-%m-%d', 'now', 'localtime')
    and username = ?
    ORDER BY event_start`;

    var params = [logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
    // #swagger.description = 'Getting today's events'
});

// Getting this week's events
app.get("/api/events/this_week", (req, res, next) => {
    var sql = `
    SELECT * from events where 
    strftime('%W', event_end, 'localtime') = strftime('%W', 'now', 'localtime')
    and username = ?
    ORDER BY event_start`;

    var params = [logged_user];

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
    // #swagger.description = 'Getting this week's events'
});

// Getting this month's events
app.get("/api/events/this_month", (req, res, next) => {
    // There may be edge cases where the database also includes entry whose end date
    // is at 11:59 of the day before the start day/time of this month.
    var sql = `
    select * from events where 
    strftime('%m', event_end, 'localtime') = strftime('%m', 'now', 'localtime')
    and username = ?
    ORDER BY event_start`;

    var params = [logged_user];

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
    // #swagger.description = 'Getting this month's events'
});

// Getting this quarter's events 
app.get("/api/events/:start_date/:end_date", (req, res, next) => {
    var sql = `
    SELECT * from events where 
    strftime('%Y-%m-%d', event_start, 'localtime') >= strftime('%Y-%m-%d', ?, 'localtime') and
    strftime('%Y-%m-%d', event_end, 'localtime') <= strftime('%Y-%m-%d', ?, 'localtime')
    and username = ?
    ORDER BY event_start`;

    var params = [req.params.start_date, req.params.end_date, logged_user];

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
    // #swagger.description = 
    // 'Getting this quarter's events within the specified date range'
    /* #swagger.parameters['event_start'] = {
        in: "params",
        description: "The start time of the quarter",
        required: true,
        type: "String",
        format: "ISO 8601 yyyy-mm-ddThh:mm:00",
    } */
    /* #swagger.parameters['event_end'] = {
        in: "params",
        description: "The end time of the quarter",
        required: true,
        type: "Boolean",
        format: "ISO 8601 yyyy-mm-ddThh:mm:00",
    } */
})

/**************************************************************************/
/* SECTION 6: EXPORTING THE APP */

/*
 * Exporting the app for use by other js files within the same node.js
 * environment
 */
module.exports = app;