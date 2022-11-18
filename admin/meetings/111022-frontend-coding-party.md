# Wednesday, November 10 12:30PM (Price Center Floor 2)
# Coding With Data Entry Objects

### Attendance
- [x] John
- [x] Hugo
- [x] Thu
- [x] Nina
- [x] Yousuf

### Agenda
- Building Quarter View
- Data Entry Object Workflow

## Building Quarter View
We will expand on Nina's outline of the Quarter View to get things working programmatically rather than hard-coded.

- use a quarter object in the database to know length of the quarter.
- set-up first week's blank days
- manipulate `Date()` objects get each day needed to build the calendar.
- repeatedly fill in each row of the html table with dates for the week.
- Include flex-boxes for events and tasks for later use with data from backend.

## Data Entry Object Workflow
How to go about building elements using data passed in from backend.

- request elements by date from backend
	- should receive an array of data objects to iterate through.
- for each data entry check to see if it matches criteria.
- attach data entry to custom web components
- insert web components into correct page container.

# TODO
- enjoy long weekend! no class on Friday!
- Hugo : element pop-up
- Nina & Yousuf : Quarter View
- Yousuf : Nav Bar
- Thu : work with backend on settings page.