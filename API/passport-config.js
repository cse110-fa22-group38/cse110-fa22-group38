const LocalStratery = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, {message: 'No user with that email' })
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

module.exports = initialize
