// Put this line at the top of your js file (IT SHOULD BE IN THE SAME DIRECTORY WITH database.js)
const db = require("./dabatase.js") // Importing our database into this script for use

// In our database, we have a table called
// users

// this table has 3 columns: uuid, username and password

// Now I wanna query a username:
let queryUsername = "Tung";

// to query all the rows that have this username from this table, we use the following string:
let sqlString = 'SELECT * from users where username = ?'
let params = [queryUsername];

// "*"" is for selecting "all"
// "from users" dictates which table we gonna query, which is table "users"
// "where username = ?" means we want to query the "username" column
// params is an ARRAY which stores all the values that will replace the question mark '?' in the sqlString
    // eg: username = queryUsername

// The actual code to query from db
db.all(sqlString, params, function(err, rows) {
    // If said username is found in the table, the entire row(s) will be returned from our database
    // and stored into the variable "rows"

    // To access these data
    rows.forEach((row) => {
        // Access them like how you access properties of a javascript object
        row.uuid;
        row.password;
        row.username;
    })
})
