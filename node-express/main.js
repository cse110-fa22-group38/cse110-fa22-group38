/**************************************************************************/
/* SECTION 1: SETTING UP EXPRESS SERVER SESSION */

// Loading the appropriate modules from node_modules
const express = require('express')
const app = express();
const path = require('path');
const md5 = require('md5');

// 1 security risk
const db = require("./database.js"); 
const grabFromCanvas = require("./canvasAPI.js");

// Logged user's username, which we will use to query the tables:
let logged_user = null;

// Importing all the modules
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

// The port number to start our local server at
const PORT = 6900;

// passport-config.js should be in the same folder
const initializePassport = require('./passport-config');
const {resourceLimits} = require('worker_threads');
const {request} = require('http');
initializePassport(
    passport, 
    username => users.find(user => user.username === username),
    uuid => users.find(user => user.uuid === uuid)
)

// Store them in local variable inside server (UNUSED)
const users = [];

// Create application/json parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 

// Serving all the important files via express to our local server
// 1) Serving the javascript files
app.use(express.static(path.join(__dirname + '/public/')));

// tells application form to access them inside req inside post method
app.use(express.urlencoded({extended: false}))
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
    res.sendFile(path.join(__dirname + '/../source/login.html'));
})

// index page
app.get('/', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/index.html'));
})

// signup page
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/signup.html'));
})

// Today page
app.get('/today', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    res.sendFile(path.join(__dirname + '/../source/today.html'));
})

// Weekly page
app.get('/week', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    res.sendFile(path.join(__dirname + '/../source/week.html'));
})

// Quarterly page
app.get('/quarter', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    res.sendFile(path.join(__dirname + '/../source/quarter.html'));
})

// Settings page
app.get('/settings', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    res.sendFile(path.join(__dirname + '/../source/settings.html'));
})

// Add event page
app.get('/add', checkNotAuthenticated, (req, res) => {
    if (logged_user == null) {
        res.redirect("/login");
    }

    res.sendFile(path.join(__dirname + '/../source/addevent.html'));
})

// Add pop up page
app.get('/popup/:event_id', checkNotAuthenticated, (req, res) => {
    let event_id = req.params.event_id;

    if (logged_user == null) {
        res.redirect("/login");
    }

    res.sendFile(path.join(__dirname + '/../source/entriesPopup.html'));
})

// Logging out
app.get('/logout', (req, res) => {
    logged_user = null;
    res.redirect('/') // Redirect to login
})

/**************************************************************************/
/* SECTION 3: SETTING UP FUNCTIONS TO HANDLE OUTPUTS ON CERTAIN PAGES */

// Handling the output on the login page
app.post('/login', checkNotAuthenticated, async (req, res) => {
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
                    }
                    else {
                        // PLACEBO
                        res.send("Incorrect Username and/or Password!");
                    }
                })
            }   
            else {
                // PLACEBO
                res.send("Incorrect Username and/or Password!");
            }
        })
    }
    else {
        res.send("Please enter USERNAME and PASSWORD!");
        res.end();
    }
})

// Handling the output on the register page
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        let username = await req.body.username; // Grabbing the username
        let hashedPassword = bcrypt.hashSync(req.body.password, 10); // Hasing the password
        let apiToken = await req.body.apiToken;

        let insertNewUser = `INSERT INTO users (username, password_hash, api_token) VALUES(?, ?, ?)`;

        //insert user in db param : uuid, username, password
        db.run(insertNewUser, [username, hashedPassword, apiToken], async (err) => {
            if (err){
                // If err thrown, likely that a user already existed in the database
                // with the same username
                console.error('Failed to register new user');
                console.error(err);

                // Redirect back to register so that they can register again
                res.redirect('/register');
            }
            else {
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
app.post('/add', checkNotAuthenticated, async (req, res) => {
    try {
        let event_id = String(Date.now() + Math.floor(Math.random()*1000));
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

        let params = 
        [username, event_id, event_t, 
        event_n, event_rel, event_loc, event_details, 
        start_time, end_time, event_completed, 
        event_color];

        console.log(params);

        // Insert user in db param : uuid, username, password
        db.run(INSERT, params, async (err) => {
            if (err){
                // If err thrown, likely that a user already existed in the database
                // with the same username
                console.error('Failed to add event to DB');
                console.error(err);

                // Redirect back to register so that they can register again
                res.redirect('/add');
            }
            else {
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
app.post('/settings', checkNotAuthenticated, async (req, res) => {
    try {
        let button = req.body.button;

        // Handling the update button
        if (button == "update") {
            let sqlUpdate = `UPDATE users set password_hash = COALESCE (?,password_hash) WHERE username = ?`;
            let queryOldPass = 'SELECT * from users WHERE username = ?'
            let password = await req.body.old_pass;
            let hashedNew = bcrypt.hashSync(req.body.new_pass, 10);

            // First check if the user knew the old password
            db.all(queryOldPass, [logged_user], async (err, results) => {
                if (err) {
                    console.err(err);
                    throw err;
                }
                else {
                    console.log(results);
                    if (results.length > 0) {
                        results.forEach((result) => {
                            let matched = bcrypt.compareSync(password, result.password_hash);

                            if (matched) {
                                // Update user with new passord
                                db.run(sqlUpdate, [hashedNew, logged_user], async (err) => {
                                    if (err) {
                                        console.err(err);
                                        return;
                                    }
                                    else {
                                        console.log("PASSWORD SUCCESSFULLY CHANGED FOR USER " + logged_user);
                                        res.redirect('/login');
                                    }
                                })
                            }
                            else {
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

            db.all(queryOldPass, [logged_user], async (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    // Username found
                    if (results.length > 0) {
                        results.forEach((result) => {
                            let matched = bcrypt.compareSync(password, result.password_hash);
                            if (matched) {
                                // Delete the user
                                db.run(sqlDelUsers, [logged_user], async (err) => {
                                    if (err) {
                                        console.err(err);
                                        return;
                                    }
                                    else {
                                        console.log("SUCCESSFULLY DELETED USER " + logged_user + " FROM TABLE USERS");
                                    }
                                })
                    
                                db.run(sqlDelEvents, [logged_user], async (err) => {
                                    if (err) {
                                        console.err(err);
                                        return;
                                    }
                                    else {
                                        console.log("SUCCESSFULLY DELETED USER " + logged_user + " FROM TABLE EVENTS");
                                    }
                                })
                                
                                // Log out the user
                                logged_user = null;

                                // Once finished deleting, redirect to index page
                                res.redirect("/");
                            }
                            else {
                                // PLACEBO
                                // WE WILL FIGURE OUT LATER
                                res.send("Incorrect Username and/or Password!");
                            }
                        })
                    }   
                    else {
                        // PLACEBO
                        res.send("Incorrect Username and/or Password!");
                    }
                }
            })
        }
    }
    catch (err) {
        console.log(err);
    }
})

// Handling the delete button from entriesPopUp page
app.post("/deleteEvent", checkNotAuthenticated, async (req, res) => {
    let eventId = req.body.button;
    
    try {
        let sqlDelEvent = 'DELETE from events WHERE username = ? and event_id = ?';
        let params = [logged_user, eventId];

        db.run(sqlDelEvent, params, async (err) => {
            if (err) {
                console.error(err);
                throw err;
            }
            else {
                console.log("SUCCESSFULLY DELETED EVENT " + eventId + " FROM TABLE EVENTS");
                res.redirect('/today');
            }
        })
    }  
    catch (err) {
        console.log("FAILED TO DELETE EVENT " + eventId + " FROM TABLE EVENTS");
        return;
    }
})

/**************************************************************************/
/* SECTION 4: PASSWORD CONFIGS (UNUSED) */

/*
 * This function checks authentication from the array 
 * and checks the output of the query
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
 * and checks the output of the query
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
})

// Get all users' info (SECURITY RISK)
app.get("/api/users", (req, res, next) => {
    var sql = "select * from users";
    var params = [];

    return db.all(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
    
        res.json(row);
    })
});

// Get all events for all users (SECURITY RISK)
app.get("/api/events/all", (req, res, next) => {
    var sql = "select * from events"
    var params = []

    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
});

// Get all events belonging to the logged in user
app.get("/api/events/", (req, res, next) => {
    var sql = "select * from events where username = ?"
    var params = [logged_user]

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };
    
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows)
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }

        res.json(rows);
    });
});

// Delete a user in the users table by their username
app.delete("/api/users/delete/:username", (req, res, next) => {
    var deletesql = "delete from users where username = ?"
    var params = [req.params.username];

    db.run(deletesql, params, (err) => {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        else {
            if (this.changes != 0) {
                console.log(username + " wasn't found");
            }
            else {
                console.log(username + " was succesffuly deleted");
            }
        }
    });
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
          res.status(400).json({"error":err.message});
          return;
        }
        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }
        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }
        res.json(rows);
    });
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
          res.status(400).json({"error":err.message});
          return;
        }
        res.json(rows);
    });
})

/**************************************************************************/
/* SECTION 6: EXPORTING THE APP */

// Exporting the app for use by other files
module.exports = app;
