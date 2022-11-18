import * as dbAPI from "./databaseAPI.js";

// You need this line
// Wait until server finishes loading the basic html page,
// then run this script
window.addEventListener('DOMContentLoaded', init())

// init short for initialize
// Main function
async function init() {
    // For calling other functions
    // No crazy scripting
    // We wana keep this function neat and tidy
    let username = "tonyshark116";
    modifyPLACEHOLDER(username);

    // Delete username
    deleteUser(username);
}

function modifyPLACEHOLDER(username) {
    let divRef = document.querySelector("#username");

    divRef.innerHTML = 
    `
    <div id="username">
        <p> Username: ${username} </p>
    </div>
    `
}

function deleteUser(username) {
    let deleteButton = document.querySelector(".delete")

    deleteButton.addEventListener('click', async () => {
        return await dbAPI.deleteUserByUsername(username);
    })
}