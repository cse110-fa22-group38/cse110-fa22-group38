//load in all our environment variables
if (process.env.NODE_ENV !== 'production') {
     // This reqruies a .env file in the root
     // directory
     // Do we really even need it?
    require('dotenv').config()
}

// Loading the appropriate modules from node_modules
const express = require('express')
const app = express()
const path = require('path');
//delete
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

//DB instance started
let db = new sqlite3.Database("./database/app_database.db",sqlite3.OPEN_READWRITE, (err) => {
    if (err){
        console.log("ERR DB connection")
    }
    console.log('Connected to DB')
})

//function to get user information
db.all(`SELECT * from user_information u where u.username = ? and u.password = password`, [username, password],(err, rows ) => {
    if (err){
        console.log('Unable to authenticate')
    }

    if  (rows == null){
        console.log('user not found')
    }else{
    return rows.uuid;
    }
    return null;
});


// passport-config.js should be in the same folder
const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

//store them in local variable inside server
const users = []



// //insertion function
// db.run(`INSERT INTO user_information values()`,[uuid, username, password], function(err) {
//     if (err){
//         console.error('unable to insert into db')
//     }
//     console.log('inserted into db')
// } )


// app.set('view-engine', 'ejs') // #TODO FIX THIS SHIT
//tells application form to access them inside req inside post method
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

// This is for passport-config.js
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
 
// Rendering the login.html page
app.get('/', checkNotAuthenticated, (req, res) => {
    // res.render('API/views/index.html/login.html')
    // res.sendFile('cse110-fa22-group38/API/views/index.html');
    res.sendFile(path.join(__dirname + '/../source/login.html'));
})

// Handling the output on the login page
app.post('/', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
}))

// register page (but not ready yet)
app.get('/register', checkNotAuthenticated, (req, res) => {
    // res.render('API/views/index.html/register.html')
    // res.sendFile('cse110-fa22-group38/API/views/index.html');
    res.sendFile(path.join(__dirname + '/../source/login.html'));
})
// Handling the output on the register page
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        // Hasing the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        //insert user in db param : uuid, username, password
        db.run(`INSERT INTO user_information values()`,[Date.now().toString(), req.body.name, hashedPassword], function(err) {
            if (err){
                console.error('unable to insert into db')
            }
            console.log('inserted into db')
        } )
        // users.push({
        //     // Pushing to the users array at the top
        //     id: Date.now().toString(),
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: hashedPassword
        // })
        // Aftering registering, redirect to the login page
        res.redirect('/')
    } catch {
        // If somehow failed, redirect to registering again
        res.redirect('/')
    }
})

//to log out
app.delete('/logout', (req, res) => {
    req.logOut() // Log out first
    res.redirect('/login') // Redirect to login
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
        res.redirect('/login')
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
        return res.redirect('/')
    } else {
        //if returns false
        next()
    }
}

//closing db
db.close()

// Starting up the local server at port 3000
app.listen(3000)
