## The purpose of databaseAPI.js
We have to understand that database.js and its respective database/users.sqlite is "NOT SERVED" to our local express server. AKA the server DOES NOT HAVE DIRECT ACCESS to our database.js file, and thus cannot directly query, insert, update, delete, etc.

To solve this problem, we need some sort of "middle man" API, and databaseAPI.js is exactly this. It *abstracts* the process of communicating with the database's ENDPOINTs on the server and simplify these processes into simple functions.

## How to use databaseAPI.js
1) First, put the following line at the top of the script that wants to access the database:
```
import * as dbAPI from "./databaseAPI.js"
```

2) To query (get) something from the database, simply do: 
```
dbAPI.queryFunction(theItemYouWantToQuery) // Pseudo-code
```

3) Ex: I want to query all the info related to the username = "Tung" from the table "users" in our database, we simply do:
   
```
let returnData = dbAPI.queryUsernameFromUsers("Tung")
```
where returnData is an **ARRAY OF OBJECTS** (console.log(returnData) for more information)

Please checkout databaseAPI.js for more available querry functions you can call