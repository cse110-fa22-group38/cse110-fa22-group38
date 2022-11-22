let ical = require("ical.js");
let testDate = new ical.Time.fromJSDate(new Date("2022-12-22"));

var date = Date.parse("2022-10-22");
var offset = new Date().getTimezoneOffset()*60*1000;

var startdate = new Date(date + offset);
var enddate = new Date(date + offset + 86400000);

console.log(startdate);
console.log(enddate);
console.log(testDate.isDate);

// console.log(testDate.utcOffset());