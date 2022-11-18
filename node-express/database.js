const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

let usersTable = 
`
CREATE TABLE IF NOT EXISTS users (
  username type UNIQUE,
  password_hash,
  api_token)
`;

let eventTable = 
`
CREATE TABLE IF NOT EXISTS events (
  username PRIMARY KEY,
  event_id,
  event_type,
  event_name,
  event_relation,
  event_location,
  event_details,
  event_start datetime,
  event_end datetime,
  event_completed boolean,
  event_color)
`;

let insertNewUser = 
`
INSERT INTO users (
  uuid,
  username,
  password_hash,
  api_token) VALUES (?,?,?,?)
`;

const DBSOURCE = "./database/user.sqlite";

let db = new sqlite3.Database(DBSOURCE, 
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err){
        console.log(err);
        throw(err);
    }
    else {
        console.log("Connected to DB")
        db.run(usersTable, (err) => {
            if (err) {
                // Table already created
            } else {
                // Table just created, creating a dummy user
            }
        });

        db.run(eventTable, (err) => {
            if (err) {
                // Table already created
            }
        });
    }
})

// Exporting our db via module, ready for use 
module.exports = db;

// Example of a dataentry object
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
}
