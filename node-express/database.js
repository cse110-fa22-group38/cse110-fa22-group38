const express = require('express')
const app = express()
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

let db = new sqlite3.Database("./database/student.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err){
        console.log(err);
    }
    else {
        console.log("Connected to DB")
        //temp TO BE DELETED
        db.run(`CREATE TABLE user (
            event_id varchar(60),
            event_type varchar(60),
            event_name varchar(60),
            event_location varchar(60),
            event_details varchar(120),
            event_start datetime,
            event_end datetime,
            event_completed boolean,
            event_color varchar(10)),
            uuid varchar(60),
            username varchar(60),
            password_hash varchar(120))
            )`,
        (err) => {
            if (err) {
                // Table already created
            } else {
                // Table just created, creating some rows
                var insert = 'INSERT INTO user (event_id, event_type, event_name, event_location, event_details, event_start, event_end, event_completed, event_color, uuid, username, password_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
                db.run(insert, ["3", "first", "second", "third", "fourth", "1000-01-01 00:00:00", "1000-01-01 00:00:00", "1", "#FFFFFF", "2", "Vedant", "hash1"])
                db.run(insert, ["4", "fifth", "sixth", "seventh", "eigth", "1000-01-02 00:00:00", "1000-01-02 00:00:00", "0", "#AAAAAA", "4", "Jason", "hash2"])
            }
        });
    }
})

module.exports = db

//Get all users
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

//Get all by UUID
app.get("/api/user/:uuid", (req, res, next) => {
    var sql = "select * from user where uuid = ?"
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
app.get("/api/user/:username", (req, res, next) => {
    var sql = "select * from user where username = ?"
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
app.get("/api/user/:event_color", (req, res, next) => {
    var sql = "select * from user where event_color = ?"
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
app.get("/api/user/:event_completed", (req, res, next) => {
    var sql = "select * from user where event_completed = ?"
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
app.get("/api/user/:event_end", (req, res, next) => {
    var sql = "select * from user where event_end = ?"
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
app.get("/api/user/:event_start", (req, res, next) => {
    var sql = "select * from user where event_start = ?"
    var params = [req.params.event_start]
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

//Get all by event_details
app.get("/api/user/:event_details", (req, res, next) => {
    var sql = "select * from user where event_details = ?"
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
app.get("/api/user/:event_location", (req, res, next) => {
    var sql = "select * from user where event_location = ?"
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
app.get("/api/user/:event_name", (req, res, next) => {
    var sql = "select * from user where event_name = ?"
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
app.get("/api/user/:event_type", (req, res, next) => {
    var sql = "select * from user where event_type = ?"
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
app.get("/api/user/:event_id", (req, res, next) => {
    var sql = "select * from user where event_id = ?"
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

// //insertion function
// db.run(`INSERT INTO user_information values()`,[uuid, username, password], function(err) {
//     if (err){
//         console.error('unable to insert into db')
//     }
//     console.log('inserted into db')
// } )

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