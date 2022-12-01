/**
 * importing express object
 */
const express = require('express');
/**
 * initializing app
 */
const app = express();
/**
 * importing sqlite 3 to js file
 */
const sqlite3 = require('sqlite3').verbose();
/** use md 5 to encrypt */
const md5 = require('md5');

/**
 *  usertable to hold user data
 */
let usersTable =
    `
CREATE TABLE IF NOT EXISTS users (
  username type UNIQUE,
  password_hash,
  api_token)
`;


/**
 * eventTable to hold events
 */
let eventTable =
    `
CREATE TABLE IF NOT EXISTS events (
  username,
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

/**
 * insertNew User query
 */
let insertNewUser =
    `
INSERT INTO users (
  username,
  password_hash,
  api_token) VALUES (?,?,?,?)
`;

/** source of db */
const DBSOURCE = "./database/user.sqlite";

/**actual db */
let db = new sqlite3.Database(DBSOURCE,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.log(err);
            throw (err);
        } else {
            console.log("database.js: Connected to DB")
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
    "username": "Tung",
    "event_id": "dataentryID",
    "event_type": "event",
    "event_name": "class 100a",
    "event_relation": "class 100a",
    "event_location": "9500 Gilman Drive",
    "event_details": "description",
    "event_start": "yyyy-mm-ddThh:mm:00Z",
    "event_end": "yyyy-mm-ddThh:mm:00Z",
    "event_completed": Boolean(false),
    "event_color": "#ffffff"
}