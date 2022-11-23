// Loading the appropriate modules from node_modules
const express = require('express')
const app = express();
const path = require('path');
const md5 = require('md5');

// 1 unknown error
// 1 security risks
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
const { resourceLimits } = require('worker_threads');
const { request } = require('http');
initializePassport(
    passport, 
    username => users.find(user => user.username === username),
    uuid => users.find(user => user.uuid === uuid)
)

// Store them in local variable inside server
const users = []

// Create application/json parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 

// Serving all the important files via express to our local server
// 1) Serving the javascript files
app.use(express.static(path.join(__dirname + '/public/js')));

// 2) Serving all the assets required for our HTML paes
app.use(express.static(path.join(__dirname + '/node_modukes')));

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
 
// Rendering the login.html page
// FIX REDIRECTS
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/login.html'));
})

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
            
            console.log(results);
            
            // Username found
            if (results.length > 0) {
                results.forEach((result) => {
                    let matched = bcrypt.compareSync(password, result.password_hash);
                    console.log(matched); 
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

// index page
app.get('/', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/index.html'));
})

// signup page
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/signup.html'));
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


//to log out (FIX IT)
app.delete('/logout', (req, res) => {
    req.logOut() // Log out first
    res.redirect('/login') // Redirect to login
    logged_user = null;

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

// Account settings page
app.get('/accountsettings', checkNotAuthenticated, (req, res) => {

    if (logged_user == null) {
        res.redirect("/login");
    }

    res.sendFile(path.join(__dirname + '/../source/accountsettings.html'));
})

// Add event page
app.get('/add', checkNotAuthenticated, (req, res) => {

    if (logged_user == null) {
        res.redirect("/login");
    }

    res.sendFile(path.join(__dirname + '/../source/addevent.html'));
})

// Handling output from the accountsettings page
app.post('/accountsettings', checkNotAuthenticated, async (req, res) => {
    try {
        // Handling the save button
        if (req.query.button == "save") {
            let hashedPassword = bcrypt.hashSync(req.body.password, 10);

            let sql = `UPDATE users set password_hash = COALESCE (?,password_hash) WHERE username = ?`;
            db.run(sql, [hashedPassword, logged_user], async (err) => {
                if (err) {
                    console.err(err);
                    return;
                }
                else {
                    console.log("PASSWORD SUCCESSFULLY CHANGED FOR USER " + logged_user);
                    res.redirect('/login');
                }
            });
        }

        // Handling the delete button
        if (req.query.button == "delete") {
            // Do nothing
            let sqlUsers = `DELETE from users WHERE username = ?`;
            let sqlEvents = 'DELETE from events WHERE username = ?';
            let password = await req.body.password;

            let queryOldPass = 'SELECT * from users WHERE username = ?';
            db.all(queryOldPass, [logged_user], (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    // Username found
                    if (results.length > 0) {
                        results.forEach((result) => {
                            let matched = bcrypt.compareSync(password, result.password_hash);
                            console.log(matched); 
                            if (matched) {
                                // Delete the user
                                db.run(sqlUsers, [logged_user], async (err) => {
                                    if (err) {
                                        console.err(err);
                                        return;
                                    }
                                    else {
                                        console.log("SUCCESSFULLY DELETED USER " + logged_user + " FROM TABLE USERS");
                                    }
                                })
                    
                                db.run(sqlEvents, [logged_user], async (err) => {
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

                                // Once finished deleting, redirect to login page
                                res.redirect("/login");
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

// Starting up the local server at PORT
app.listen(PORT);


/* DATABASE API ENDPOINTS */
// Get all users' info
app.get("/api/users", (req, res, next) => {
    var sql = "select * from users"
    var params = []
    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});

// Get ALL events no matter what
app.get("/api/allEvents/", (req, res, next) => {
    var sql = "select * from events"
    var params = []
    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});

// Get ALL events belonging to the logged in user
app.get("/api/events/", (req, res, next) => {
    var sql = "select * from events where username = ?"
    var params = [logged_user]
    console.log(logged_user);

    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };
    
    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});
  
// Get all by event_color
app.get("/api/events/event_color/:event_color", (req, res, next) => {
    var sql = "select * from events where event_color = ? and username = ?"
    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    var params = [req.params.event_color, logged_user];
    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});
  
// Get all by event_completed
app.get("/api/events/event_completed/:event_completed", (req, res, next) => {
    var sql = "select * from events where event_completed = ? and username = ?"
    var params = [req.params.event_completed, logged_user]
    
    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});
  
// Get all by event_end
app.get("/api/events/event_end/:event_end", (req, res, next) => {
    var sql = "select * from events where event_end = ? and username = ?"
    var params = [req.params.event_end, logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
    });
});
  

// Get all by event_start
app.get("/api/events/event_start/:event_start", (req, res, next) => {
    var sql = "select * from events where event_start = ? and username = ?"
    var params = [req.params.event_start, username]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        console.log(row);

        res.json({row});
    });
});
  
// Get all by event_details
app.get("/api/events/event_details/:event_details", (req, res, next) => {
    var sql = "select * from events where event_details = ? and username = ?"
    var params = [req.params.event_details, logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});

// Get all by event_relation
app.get("/api/events/event_relation/:event_relation", (req, res, next) => {
    var sql = "select * from events where event_relation = ? and username = ?"
    var params = [req.params.event_relation, logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({row});
    });
});
  
// Get all by event_location
app.get("/api/events/event_location/:event_location", (req, res, next) => {
    var sql = "select * from events where event_location = ? and username = ?"
    var params = [req.params.event_location, logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});
  
// Get all by event_name
app.get("/api/events/event_name/:event_name", (req, res, next) => {
    var sql = "select * from events where event_name = ? and username = ?"
    var params = [req.params.event_name, logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});
  
// Get all by event_type
app.get("/api/events/event_type/:event_type", (req, res, next) => {
    var sql = "select * from events where event_type = ? and username = ?"
    var params = [req.params.event_type, logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {
ms, (err, row) => {

  

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    }
    });

});
  
// Get all by event_id
app.get("/api/events/event_id/:event_id", (req, res, next) => {
    var sql = "select * from events where event_id = ? and username = ?"
    var params = [req.params.event_id, logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {

        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({row});
    });
});

// Delete a user in the users table by their username
app.delete("/api/users/delete/:username", (req, res, next) => {
    var deletesql = "delete from users where username = ?"
    var username = req.params.username;
    var params = [req.params.username];

    db.run(deletesql, params, (err, row) => {

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

// Getting today's events (DONE)
app.get("/api/events/today", (req, res, next) => {
    // or date of event_end = date of today (in local time)
    // May need adjustment (TODO)
    var sql = `
    SELECT * from events where 
    strftime('%Y-%m-%d', event_end, 'localtime') = strftime('%Y-%m-%d', 'now', 'localtime')
    and username = ?`;

    var params = [logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({row});
    });
});

// Getting this week's events (TODO)
app.get("/api/events/this_week", (req, res, next) => {
    var sql = `
    SELECT * from events where 
    strftime('%W', event_end, 'localtime') = strftime('%W', 'now', 'localtime')
    and username = ?`;

    // 'now' returns today in UTC time "YYYY-MM-DD"
    // select all where event_end is in "this" week
    // Today: we compare nov 21st end to curr time: nov 21st
    // Week: We will have to check whether (end_date = nov 21st) ||
    //(nov 22nd) || (nov 23rd)...(nov 28th)

    // strftime('%W') returns the WEEK number of the month
    // November has 4 weeks: strftime('%W', 'now') = 4
    // wednesday, second half of week 3 and first half of week 4. If its end of the month
    // Week 4 half and week 1 of next month half
    
    var params = [logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({row});
    });
});

// Getting this month's events (TODO)
app.get("/api/events/this_month", (req, res, next) => {
    // There may be edge cases where the database also includes entry whose end date
    // is at 11:59 of the day before the start day/time of this month.
    var sql = `
    select * from events where 
    strftime('%m', event_end, 'localtime') = strftime('%m', 'now', 'localtime')
    and username = ?`;

    var params = [logged_user]

    console.log(logged_user);
    if (!logged_user) {
        console.log("User not logged in");
        res.redirect('/login');
        return;
    };

    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({row});
    });
});