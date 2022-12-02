const LocalStratery = require('passport-local').Strategy;
/**
 * importing bcrypt to encrypt/decrypt password
 */
const bcrypt = require('bcrypt');
/**
 * importing sqlite3 as our database
 */
const sqlite3 = require('sqlite3').verbose();
/**
 * set our database source to our established database
 */
const DBSOURCE = "./database/user.sqlite";

/**
 * starting our DB instance
 */
let db = new sqlite3.Database(DBSOURCE, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log("passport-config: ERR DB connection");
    } else {
        console.log('passport-config: Connected to DB');
    }
})

/**
 * initialize function
 * @param {*} passport 
 * @param {*} getUserByUsername 
 * @param {*} getUserById 
 */
function initialize(passport, getUserByUsername, getUserById) {
    const authenticateUser = async(username, password, done) => {
        const user = getUserByUsername(username)
        if (user == null) {
            return done(null, false, { message: 'No user with that username' })
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                //user password did match
                return done(null, user)
            } else {
                //user password didn't watch
                return done(null, false, { message: 'Password incoorect' })
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStratery({ usernameField: 'email' },
            authenticateUser)),
        passport.serializeUser((user, done) => done(null, user.uuid))
    passport.deserializeUser((uuid, done) => {
        return done(null, getUserById(uuid))
    })
}

db.close()
module.exports = initialize