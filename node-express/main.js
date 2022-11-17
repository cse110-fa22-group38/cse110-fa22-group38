// Loading the appropriate modules from node_modules
const express = require('express')
const app = express()
const path = require('path');
const db = require("./database.js") //one err
//delete
const router = express.Router();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

// The port number to start our local server at
const PORT = 6900;

// passport-config.js should be in the same folder
const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

//store them in local variable inside server
const users = []

// Serving all the important files via express to our local server
// 1) Serving the javascript files
app.use(express.static(path.join(__dirname + '/public/js')));

// 2) Serving all the assets required for our HTML paes
app.use(express.static(path.join(__dirname + '/../source/assets')));

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
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/login',   //redirect change
    failureRedirect: '/login',
    failureFlash: true
}))

// signup page
app.get('/register', checkNotAuthenticated, (req, res) => {
    // res.render('API/views/index.html/register.html')
    // res.sendFile('cse110-fa22-group38/API/views/index.html');
    res.sendFile(path.join(__dirname + '/../source/signup.html'));
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
        res.redirect('/login')
    } catch {
        // If somehow failed, redirect to registering again
        res.redirect('/register')   //redirect change
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
app.listen(PORT)