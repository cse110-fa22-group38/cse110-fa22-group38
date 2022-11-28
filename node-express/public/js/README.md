# The purpose of databaseAPI.js
Any javascript files in the public/js folder are served to the server, but they *cannot* have direct access to our database. In other words, the scripts on the server cannot directly query, insert, update, delete, etc. on our sqlite3 database.

To solve this problem, we need a "middle man" API, and databaseAPI.js is exactly this. It uses the browser's built in fetch() API to communicates with the database's public endpoints (as defined in SECTION 6 of main.js) and query the database via those. To help with readability, I have abstracted these fetch() requests and made different functions to query the database. Please read the section below on how to use them in your scripts stored in public/js folder.

# How to use databaseAPI.js
1) First, put the following line at the top of the script that wants to access the database:
```
import * as dbAPI from "./databaseAPI.js"
```

2) To query (get) something from the database, simply do: 
```
let returnData = dbAPI.queryFunction(theItemYouWantToQuery) // Pseudo-code
```
3) Ex: I want to query all today events for the currently logged in user, I simply do:
```
let returnData = dbAPI.queryTodayEvents();
```
where returnData is an **ARRAY OF OBJECTS** (console.log(returnData) for more information)

Feel free to checkout databaseAPI.js for more available querry functions you can call. If you need a specific function in databaseAPI.js to cater to your needs, please let the backend team know.