/**
 * Importing express module (UNUSED)
 */
const express = require('express');

/**
 * Initializing app (UNUSED)
 */
const app = express();

/**
 * Importing sqlite3 database to js file
 */
const sqlite3 = require('sqlite3').verbose();

/** 
 * Using md 5 to encrypt (UNUSED) 
 */
const md5 = require('md5');

/**
 * Table users to hold all users' data
 */
let usersTable =
    `
CREATE TABLE IF NOT EXISTS users (
  username type UNIQUE,
  password_hash,
  api_token)
`;

/**
 * Table events to hold all users' events
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
 * Insert new User query (template)
 */
const insertNewUser =
`
INSERT INTO users (
  username,
  password_hash,
  api_token) 
  VALUES (?,?,?,?)
`;

/**
 * Insert new Event query (template)
 */
const insertNewEvent = 
`
INSERT INTO events (
    username,
    event_id,
    event_type,
    event_name,
    event_relation,
    event_location,
    event_details,
    event_start,
    event_end,
    event_completed,
    event_color) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
`;

/** Path to source file of our database */
const DBSOURCE = "./database/user.sqlite";

/**
 * Our database to be used by other js files within the same node.js environment.
 * 
 * @module
 * @param {String} DBSOURCE The path + file name 
 *                          where we will create/access our database
 * @throw Any critical errors (Most likely failed to create/access database)
 */
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

/**
 * Exporting our database as a module, ready to be used 
 * by other js files within the same node.js environment.
 */
module.exports = db;

/**
 * Example of an event object (template)
 */
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