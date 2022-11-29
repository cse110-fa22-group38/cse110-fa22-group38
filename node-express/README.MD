# How to install dependencies for our app:

1) Open your terminal to the app's root directory, input the following command:
```
cd node-express 
```
2) Next, input the following command to install all the dependencies:
```
npm install --save express sqlite3 md5 node-fetch ical.js nodemon bcrypt passport express-flash express-session method-override passport-local dotenv
```

# How to run the server
1) To run the server without monitoring changes in javascript files, simply do:
```
npm run server
```
2) (For devs only) to run the server with monitoring changes in javascript files so that it automatically restarts every time there is a change, simply do:
```
npm run server-dev
```
