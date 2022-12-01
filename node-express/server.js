/**
 * initialized app by importing main.js
 */
const app = require("./main.js");
/**
 * initialize port to 6900
 */
const PORT = 6900;



app.listen(PORT, () => {
    console.log("Server is running on port " + 6900)
});