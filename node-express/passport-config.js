const LocalStratery = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "./database/user.sqlite";

// DB instance started
let db = new sqlite3.Database(DBSOURCE, sqlite3.OPEN_READWRITE, (err) => {
    if (err){
        console.log("passport-config: ERR DB connection");
    }
    else {
        console.log('passport-config: Connected to DB');
    }
})

function initialize(passport, getUserByUsername, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const user = getUserByUsername(username)
        if (user == null) {
            return done(null, false, {message: 'No user with that username' })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                //user password did match
                return done(null, user)
            } else {
                //user password didn't watch
                return done(null, false, {message: 'Password incoorect'})
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStratery({ usernameField: 'email'}, 
    authenticateUser)),
    passport.serializeUser((user, done) => done(null, user.uuid))
    passport.deserializeUser((uuid, done) => {
        return done(null, getUserById(uuid))
     })
}

db.close()
module.exports = initialize