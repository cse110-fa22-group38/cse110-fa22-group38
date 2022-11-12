const LocalStratery = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3').verbose();

//DB instance started
let db = new sqlite3.Database("./database/app_database.db",sqlite3.OPEN_READWRITE, (err) => {
    if (err){
        console.log("ERR DB connection")
    }
    console.log('Connected to DB')
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
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
     })
}
db.close()
module.exports = initialize
