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
const db = require("./database.js") //one err
//delete
const router = express.Router();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

// passport-config.js should be in the same folder
const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

//store them in local variable inside server
const users = []

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
// FIX REDIRECTS
app.get('/', checkNotAuthenticated, (req, res) => {
    // res.render('API/views/index.html/login.html')
    // res.sendFile('cse110-fa22-group38/API/views/index.html');
    res.sendFile(path.join(__dirname + '/../source/login.html'));
})

// Handling the output on the login page
app.post('/', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',   //redirect change
    failureRedirect: '/',
    failureFlash: true
}))

// register page (but not ready yet)
app.get('/register', checkNotAuthenticated, (req, res) => {
    // res.render('API/views/index.html/register.html')
    // res.sendFile('cse110-fa22-group38/API/views/index.html');
    res.sendFile(path.join(__dirname + '/../source/register.html'));
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
        res.redirect('/register')   //redirect change
    }
})

//to log out
app.delete('/logout', (req, res) => {
    req.logOut() // Log out first
    res.redirect('/') // Redirect to login
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



// Starting up the local server at port 3000
app.listen(3000)