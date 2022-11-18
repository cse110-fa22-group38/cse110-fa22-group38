// Loading the appropriate modules from node_modules
const express = require('express')
const app = express();
const path = require('path');
const md5 = require('md5');

// 1 unknown error
// 1 security risks
const db = require("./database.js"); 
const grabFromCanvas = require("./canvasAPI.js");

let logged_user;

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
        let uuid = Date.now().toString(); // Grabbing the uuid
        let username = await req.body.username; // Grabbing the username
        let hashedPassword = bcrypt.hashSync(req.body.password, 10); // Hasing the password
        let apiToken = await req.body.apiToken;

        let insertNewUser = `INSERT INTO users (uuid, username, password_hash, api_token) VALUES(?, ?, ?, ?)`;

        //insert user in db param : uuid, username, password
        db.run(insertNewUser, [uuid, username, hashedPassword, apiToken], async (err) => {
            if (err){
                // If err thrown, likely that a user already existed in the database
                // with the same username
                console.error('Failed to register new user');
                console.error(err);

                // Redirect back to register so that they can register again
                res.redirect('/register');
            }
            else {
                console.log('Succesffuly registered new user');

                // Instantly populate our database with info from CANVAS
                console.log(grabFromCanvas);
                await grabFromCanvas(uuid, apiToken);   

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

//to log out
app.delete('/logout', (req, res) => {
    req.logOut() // Log out first
    res.redirect('/login') // Redirect to login
})

// Today page
app.get('/today', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/today.html'));
})

// Weekly page
app.get('/week', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/week.html'));
})

// Quarterly page
app.get('/quarter', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/quarter.html'));
})

// Settings page
app.get('/settings', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/settings.html'));
})

// Account settings page
app.get('/accountsettings', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/../source/accountsettings.html'));
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
        return res.redirect('/')    //change redirect
    } else {
        //if returns false
        next()
    }
}

// Starting up the local server at PORT
app.listen(PORT);

/* DATABASE API SESSION */
//Get all users
app.get("/api/users", (req, res, next) => {
    var sql = "select * from users"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});
  
//Get all by UUID
app.get("/api/users/UUID/:uuid", (req, res, next) => {
    var sql = "select * from users where uuid = ?"
    var params = [req.params.uuid]
    db.get(sql, params, (err, row) => {
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
  
//Get all by username
app.get("/api/users/username/:username", (req, res, next) => {
    var sql = "select * from users where username = ?"
    var params = [req.params.username]
    db.get(sql, params, (err, row) => {
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

//Get all by UUID
app.get("/api/events/UUID/:uuid", (req, res, next) => {
    var sql = "select * from events where uuid = ?"
    var params = [req.params.uuid]
    db.get(sql, params, (err, row) => {
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
  
//Get all by username
app.get("/api/events/username/:username", (req, res, next) => {
    var sql = "select * from events where username = ?"
    var params = [req.params.username]
    db.get(sql, params, (err, row) => {
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
  
//Get all by event_color
app.get("/api/events/event_color/:event_color", (req, res, next) => {
    var sql = "select * from events where event_color = ?"
    var params = [req.params.event_color]
    db.get(sql, params, (err, row) => {
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
  
//Get all by event_completed
app.get("/api/events/event_completed/:event_completed", (req, res, next) => {
    var sql = "select * from events where event_completed = ?"
    var params = [req.params.event_completed]
    db.get(sql, params, (err, row) => {
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
  
//Get all by event_end
app.get("/api/events/event_end/:event_end", (req, res, next) => {
    var sql = "select * from events where event_end = ?"
    var params = [req.params.event_end]
    db.get(sql, params, (err, row) => {
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
  
//Get all by event_start
app.get("/api/events/event_start/:event_start", (req, res, next) => {
    var sql = "select * from events where event_start = ?"
    var params = [req.params.event_start]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        console.log(row);
        res.json({
            "message":"success",
            "data":row
        })
    });
});
  
//Get all by event_details
app.get("/api/events/event_details/:event_details", (req, res, next) => {
    var sql = "select * from events where event_details = ?"
    var params = [req.params.event_details]
    db.get(sql, params, (err, row) => {
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
  
//Get all by event_location
app.get("/api/events/event_location/:event_location", (req, res, next) => {
    var sql = "select * from events where event_location = ?"
    var params = [req.params.event_location]
    db.get(sql, params, (err, row) => {
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
  
//Get all by event_name
app.get("/api/events/event_name/:event_name", (req, res, next) => {
    var sql = "select * from events where event_name = ?"
    var params = [req.params.event_name]
    db.get(sql, params, (err, row) => {
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
  
//Get all by event_type
app.get("/api/events/event_type/:event_type", (req, res, next) => {
    var sql = "select * from events where event_type = ?"
    var params = [req.params.event_type]
    db.get(sql, params, (err, row) => {
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
  
//Get all by event_id
app.get("/api/events/event_id/:event_id", (req, res, next) => {
    var sql = "select * from events where event_id = ?"
    var params = [req.params.event_id]
    db.get(sql, params, (err, row) => {
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

// update function
// see UUID
app.patch("/api/users/:uuid", (req, res, next) => {
    var data = {
        name: req.body.name,
        password : req.body.password ? md5(req.body.password) : null
    }
    db.run(
        `UPDATE users set 
           username = COALESCE(?,username), 
           password = COALESCE(?,password) 
           WHERE uuid = ?`,
        [data.username, data.password, req.params.uuid],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

// Delete user
app.delete("/api/users/:uuid", (req, res, next) => {
    db.run(
        'DELETE FROM users WHERE uuid = ?',
        req.params.uuid,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

// Delete event
app.delete("/api/events/:uuid", (req, res, next) => {
    db.run(
        'DELETE FROM events WHERE uuid = ?',
        req.params.uuid,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

