const express = require('express')
const app = express()
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

let db = new sqlite3.Database("./database/app_database.db",sqlite3.OPEN_READWRITE, (err) => {
    if (err){
        console.log("ERR DB connection")
    }
    else {
        console.log('Connected to DB')
    }
})

module.exports = db //why

app.get("/api/users", (req, res, next) => {
    var sql = "select * from user"
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

//function to get user information
/*db.all(`SELECT * from user_information u where u.username = username and u.password = password`, [username, password],(err, rows ) => {
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

//insertion function
db.run(`INSERT INTO user_information values()`,[uuid, username, password], function(err) {
    if (err){
        console.error('unable to insert into db')
    }
    console.log('inserted into db')
} )*/

const dataentryarray = [];

var dataentry = {
    UUID: "userID",
    DEID: "dataentryID",
    type: "event",
    name: "class 100a",
    relation: "class 100a",
    location: "9500 Gilman Drive",
    details: "description",
    start: "yyyy-mm-ddThh:mm:00",
    end: "yyyy-mm-ddThh:mm:00",
    done: Boolean(false),
    color: "#ffffff"
};

//closing db
db.close();