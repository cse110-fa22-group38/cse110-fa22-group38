const { expect } = require("@jest/globals");

/* PUPPETEER TEST */
describe('Powell Puff Planner Basic Tests', () => {
    // First, visit the register website
    beforeAll(async () => {
      await page.goto('http://localhost:6900/register');
    });

    // Function to generate a random username with given length
    function makeid(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
      // Sample account to test
      var testusername = makeid(6) + "@ucsd.edu";
      var testpassword = 'test123';
      var testapitoken = 'A123456';

    /* REGISTER TEST */
    it('Checking if sign up successfully and return to the log in page', async () => {
      console.log("Checking if sign up successfully and return to the log in page...");
      await page.waitForTimeout(4000);
      // Wait for the page to select the username
      await page.waitForSelector("[name='username']");
      // Type the username in the username input
      await page.type("[name='username']", testusername);

      // Press tab to go to the next input
      await page.keyboard.down('Tab');
      // uncomment the following if you want the passwort to be visible
      // page.$eval("._2hvTZ.pexuQ.zyHYP[type='password']", (el) => el.setAttribute("type", "text"));
      // Type the password in the password input
      await page.type("[name='password']", testpassword);
      // Type the password in the password repeat input
      await page.type("[name='password-repeat']", testpassword);
      // Type the API token in the API token input
      await page.type("[name='apiToken']", testapitoken);
      // Press confirm and wait for the page to navigate
      await Promise.all([page.click("button[class='confirm']"),page.waitForNavigation({waitUntil: 'networkidle2'})])    
    
      // Expect the heading is the Log In Page (Account is signed up successfully)
      // await page.goto('http://localhost:6900/login');
      let heading = await page.$eval('h1', heading => heading.innerText);
      expect(heading).toBe("Powell Puff Planner");
    }, 10000);

    /* LOGIN TEST */
    it('Checking if log in successfully and move to the today page', async () => {
      console.log('Checking if log in successfully and move to the today page');
      // Wait for the page to select the username
      await page.waitForSelector("[name='username']");
      // Type the username in the username input
      await page.type("[name='username']", testusername);
      // press tab to go to the next input
      await page.keyboard.down('Tab');
      // uncomment the following if you want the password to be visible
      // page.$eval("._2hvTZ.pexuQ.zyHYP[type='password']", (el) => el.setAttribute("type", "text"));
      // Type the password in the password input
      await page.type("[name='password']", testpassword);
      // Press submit to add event and wait for the page to navigate
      await Promise.all([page.click("button[type='submit']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);
      await page.goto('http://localhost:6900/today');
    }, 10000); // Time expected for the test to run

    // Sample Event to Test
    let testEventRelation = "CSE101";
    let testEventName = "Lecture";
    let testEventLocation = "Peterson Hall";
    let testEventDescription = "Exam Review";
    let testStartTime = "1200p" // event starts at 12pm
    let testEndTime = "200p" // event ends at 2pm
    // Get the current date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + dd + yyyy;

    /* ADD EVENT TEST TO TODAY */
    it('Checking add an event successfully to today page', async () => {
      console.log('Checking add an event successfully to today page');

      await page.goto('http://localhost:6900/add'); // click?
      await page.waitForSelector("[name='event_type']");
      await page.click("[name='event_type']");
      await page.waitForSelector("[name='event_relation']");
      await page.type("[name='event_relation']", testEventRelation);
      // Type the event name into corresponding input
      await page.waitForSelector("[name='event_name']");
      await page.type("[name='event_name']", testEventName);
      // Type the event location into corresponding input
      await page.waitForSelector("[name='event_location']");
      await page.type("[name='event_location']", testEventLocation);
      // Type the event start time into corresponding input
      await page.waitForSelector("[name='event_start_time']")
      await page.type("[name='event_start_time']", today);
      await page.keyboard.press('ArrowRight');
      await page.type("[name='event_start_time']", testStartTime);
      // Type the event end time into corresponding input
      await page.waitForSelector("[name='event_end_time']")
      await page.type("[name='event_end_time']", today);
      // Move to right to adjust event time
      await page.keyboard.press('ArrowRight');
      await page.type("[name='event_end_time']", testEndTime);
      // Type the event description into corresponding input
      await page.waitForSelector("textarea");
      await page.type("textarea", testEventDescription);
      // Press submit to add event and wait for the page to navigate
      await Promise.all([page.click("input[type='submit']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);
      // Count the number of event
      const leventCount = await page.$$eval('.levent', levents => levents.length);
      // Expect the number of event currently is 1
      expect(leventCount).toBe(1);  
    }, 10000);

    /* ADD EVENT TEST TO WEEK */
    it('Checking add an event successfully to week page', async () => {
      console.log('Checking add an event successfully to week page');
      await page.goto('http://localhost:6900/week'); 
      await page.reload();
      // Count the number of event
      const teventCount = await page.$$eval('.tevent', tevents => tevents.length);
      // Expect the number of event currently is 1
      expect(teventCount).toBe(1);
    }, 5000);

    /* QUARTER TEST AND EVENT COUNT */
    let testQuarterRelation = "Fall 2022";
    let testQuarterName = "Fall 2022";
    let testQuarterLocation = "UCSD";
    let testQuarterDescription = "A new quarter has started!";
    let testQuarterStartDate = "09202022"; // 09/20/2022
    let testQuarterEndDate = "12102022"; // 12/10/2022
    let testQuarterTime = "1200a" // quarter starts and ends at 12am

    it('Checking add an event successfully to quarter page', async () => {
      console.log('Checking add an event successfully to quarter page');

      await page.goto('http://localhost:6900/add'); // go to quarter page
      // Select to add a new quarter
      await page.waitForSelector("[id='quarter']");
      await page.click("[id='quarter']");
      // Type the quarter relation into corresponding input
      await page.waitForSelector("[name='event_relation']");
      await page.type("[name='event_relation']", testQuarterRelation);
      // Type the quarter name into corresponding input
      await page.waitForSelector("[name='event_name']");
      await page.type("[name='event_name']", testQuarterName);
      // Type the quarter location into corresponding input
      await page.waitForSelector("[name='event_location']");
      await page.type("[name='event_location']", testQuarterLocation);
      // Type the quarter start time into corresponding input
      await page.waitForSelector("[name='event_start_time']")
      await page.type("[name='event_start_time']", testQuarterStartDate);
      await page.keyboard.press('ArrowRight');
      await page.type("[name='event_start_time']", testQuarterTime);
      // Type the quarter end time into corresponding input
      await page.waitForSelector("[name='event_end_time']")
      await page.type("[name='event_end_time']", testQuarterEndDate);
      // Move to right to adjust quarter time
      await page.keyboard.press('ArrowRight');
      await page.type("[name='event_end_time']", testQuarterTime);
      // Type the quarter description into corresponding input
      await page.waitForSelector("textarea");
      await page.type("textarea", testQuarterDescription);
      // Press submit to add quarter and wait for the page to navigate
      await Promise.all([page.click("input[type='submit']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);

      await page.goto('http://localhost:6900/quarter'); 

      // From start date to end date should result in 82 blocks representing 82 days
      const qdays = await page.$$eval('.day-container', qdays => qdays.length);
      expect(qdays).toBe(82);
      // Count the number of event in quarter view
      const qeventCount = await page.$$eval('.qevent', qevents => qevents.length);
      // Expect the number of event in quarter view currently is 1
      expect(qeventCount).toBe(1);  
    }, 20000);

    let newpassword = "test321"
    
     /* ACCOUNT SETTINGS TEST */
     it('Change password and using old password to log in should return error message', async () => {
      console.log('Change password and using old password to log in should return error message');
      await page.goto('http://localhost:6900/settings'); 
      
      await page.waitForSelector("[name='old_pass']");
      await page.type("[name='old_pass']", testpassword);

      await page.waitForSelector("[name='new_pass']");
      await page.type("[name='new_pass']", newpassword);

      // Press submit to change password
      await Promise.all([page.click("button[type='submit']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);
      let heading = await page.$eval('h1', heading => heading.innerText);
      expect(heading).toBe("Powell Puff Planner");

      /* Log in using old password */
      // Wait for the page to select the username
      await page.waitForSelector("[name='username']");
      // Type the username in the username input
      await page.type("[name='username']", testusername);
      // press tab to go to the next input
      await page.keyboard.down('Tab');
      // uncomment the following if you want the password to be visible
      // page.$eval("._2hvTZ.pexuQ.zyHYP[type='password']", (el) => el.setAttribute("type", "text"));
      // Type the password in the password input
      await page.type("[name='password']", testpassword);
      // Press submit to add event and wait for the page to navigate
      await Promise.all([page.click("button[type='submit']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);

      let errorMessage = await page.$eval('body', errorMessage => errorMessage.innerText);
      console.log(errorMessage);
      expect(errorMessage).toBe("Incorrect Username and/or Password!");
    }, 10000);

    /* UPDATE EVENT TEST */
    it('Checking update an event', async () => {
      /* Log in using new password */
      await page.goto('http://localhost:6900/login'); 
      // Wait for the page to select the username
      await page.waitForSelector("[name='username']");
      // Type the username in the username input
      await page.type("[name='username']", testusername);
      // press tab to go to the next input
      await page.keyboard.down('Tab');
      // Type the password in the password input
      await page.type("[name='password']", newpassword);
      // Press submit to add event and wait for the page to navigate
      await Promise.all([page.click("button[type='submit']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);


      console.log('Checking update an event');
      await page.goto('http://localhost:6900/today'); 
      await page.reload();
      
      // click on the event
      await page.waitForSelector('.levent');
      await page.click('.levent');
      
      // click on update event button
      await page.waitForSelector("[id='update_but']");
      await page.click("[id='update_but']");

      let updateName = "CSE110";
      // update name of event
      await page.click("[name='event_name']");

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Backspace');
      }

      await page.type("[name='event_name']", updateName);

      // submit
      await Promise.all([page.click("input[type='submit']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);

      // click on the event
      await page.waitForSelector('.levent');
      await page.click('.levent');
      
      // Get the new content of the event
      const levent = await page.$('#name');
      let leventName = await levent.getProperty('innerHTML');
      leventName = await leventName.jsonValue();
      // Expect the new name appear
      expect(leventName).toBe(updateName);
    }, 10000);

    /* DELETE USER TEST */
    it('Checking delete user account', async () => {
      console.log('Checking delete user account');
      await page.goto('http://localhost:6900/settings'); 
      await page.reload();

      await page.waitForSelector("[name='old_pass']");
      await page.type("[name='old_pass']", newpassword);

      // Count the number of event
      await Promise.all([page.click("[id='deleteButton']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);


      /* Log in using new password */
      await page.goto('http://localhost:6900/login'); 
      // Wait for the page to select the username
      await page.waitForSelector("[name='username']");
      // Type the username in the username input
      await page.type("[name='username']", testusername);
      // press tab to go to the next input
      await page.keyboard.down('Tab');
      // Type the password in the password input
      await page.type("[name='password']", newpassword);
      // Press submit to add event and wait for the page to navigate
      await Promise.all([page.click("button[type='submit']"),page.waitForNavigation({waitUntil: 'networkidle2'})]);

      let errorMessage = await page.$eval('body', errorMessage => errorMessage.innerText);
      console.log(errorMessage);
      expect(errorMessage).toBe("Incorrect Username and/or Password!");

    }, 10000);
});