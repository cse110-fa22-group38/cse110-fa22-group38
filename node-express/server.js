/**
 * Importing the app module in main.js
 */
const app = require("./main.js");

/**
 * Setting number port to 6900
 */
const PORT = 6900;

/**
 * Initializing our app on localhost
 */
app.listen(PORT, () => {
    console.log("Server is running on localhost:" + PORT)
});