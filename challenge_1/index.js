/*
 * "Environment Setup"
 */

// Import statements
const readline = require('node:readline');
const fs = require('node:fs');
const util = require('util');

// Use of a third party module for ease of use when handling json files
const jsonfile = require('jsonfile');

// Path for use in checking if the file exists and read/writing to it
const DATA_PATH = './data.json';

// Initialize the readline with stdio
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify node:readline.question()
const question = util.promisify(rl.question).bind(rl);  

/*
 * Main Function
 */

(async () => {
    // If file does not exist, close reader and exit program
    if (!fs.existsSync(DATA_PATH)) {
        rl.close();
        return console.error(`'${DATA_PATH}' does not exist.`);
    }

    // Variables
    const data = {};
    const chargeRate = 9.87;
    const chargeFee = 25.0;

    // Report title of program
    console.log('Mulch Calculator');
    
    // Loop until the user has input a valid character
    do {
        console.log();

        // Prompt the user to select a figure
        // There is NO REASON to ask the user if the area is a square, 
        // as the exact same thing is achieved with a rectangle.
        let ans = await question('Circular or Rectangular figure (Enter R or C) >> ');
        ans = ans.trim().toUpperCase();

        // Check if character is valid
        if (ans != 'C' && ans != 'R')
            // If the character is invalid, prompt the user and restart
            console.log('Invalid Entry.');
        else {
            // If the character is valid, save it and exit the loop
            data.shapeChar = ans.trim().toUpperCase();
            break;
        }
    } while(true);

    // Set the figure string decided by the character above
    data.figure = data.shapeChar == 'C'? 'Circle': 'Rectangle';

    console.log();
    
    // Ensure the user knows that data should be measured in inches
    console.log('Note: All data entered should be in inches.');

    // Call the proper function dependant on the character gathered above
    data.volData = data.shapeChar == 'C'? 
        await getVolCircle() : await getVolRectangle();

    // Calculate and store the cost in the 'data' object
    data.cost = parseFloat((data.volData.Volume * chargeRate + chargeFee).toFixed(2));

    console.log();

    // Write the data to the stdout for the user to view
    displayData(data);

    // Write the data to a JSON file for later use
    writeData(data);

    // Close the reader
    rl.close();
})();

/**
 * Writes the the data out to a JSON file for possible later use
 * @param {Object} data Object containg all data about the volume
 */
function writeData(data) {
    // Read the existing JSON
    const jsonArr = jsonfile.readFileSync(DATA_PATH);

    // Reverse the JSON so that the first index is the last
    jsonArr.reverse();
    
    // Push the new data into the JSON array
    jsonArr.push({
        figure: data.figure,
        volData: data.volData,
        cost: data.cost
    });

    // Reverse the JSON so that the last index is the first
    jsonArr.reverse();

    // Rewrite the data to the file (overwrites existing data, but the above code stores that existing data)
    jsonfile.writeFile(DATA_PATH, jsonArr);
}

/**
 * Display all of the information about the volume and cost to stdout
 * @param {Object} data Object containg all data about the volume
 */
function displayData(data) {
    // Get the key names from the objects
    // This will make it easier to print the dimensions as there are two different configurations
    const dataKeys = Object.keys(data.volData);

    // Get rid of the last element (volume) as it is not printed out like the others
    dataKeys.pop();
    
    // Print out which figure the user selected
    console.log(`Figure selected: ${data.figure}`);

    // Loop through the keys and print out their corresponding values from the object
    dataKeys.forEach(e =>
        console.log(`${e} of figure: ${data.volData[e]} inches`)
    );
    
    // Print out the volume of mulch needed in square inches
    console.log(`Amount of mulch needed: ${data.volData.Volume} sq. inches`);

    // Print out the cost of all of the mulch including the delivery fee
    console.log(`Final cost: $${data.cost.toFixed(2)}`);
}

/**
 * Gets the data for the volume of a circle (cylinder)
 * @returns Object containing all data about the volume
 */
async function getVolCircle() {
    // Declare the object that contains the data
    const obj = {};

    // Prompt the user for the radius and depth of the figure
    obj.Radius = parseFloat(await question('Enter the radius of the figure >> '));
    obj.Depth = parseFloat(await question('Enter the depth of the figure >> '));

    // Calculate and store the volume in the object
    obj.Volume = Math.round((obj.Radius * obj.Radius) * Math.PI * obj.Depth);

    // Return the object for use in the main function
    return obj;
}

/**
 * Gets the data for the volume of a square / rectangle
 * @returns Object containing all data about the volume
 */
async function getVolRectangle() {
    // Declare the object that contains the data
    const obj = {};
    
    // Prompt the user for the length, width, and height (depth) of the figure
    obj.Length = parseFloat(await question('Enter the length of the figure >> '));
    obj.Width = parseFloat(await question('Enter the width of the figure >> '));
    obj.Depth = parseFloat(await question('Enter the depth of the figure >> '));
    
    // Calculate and store the volume in the object
    obj.Volume = Math.round(obj.Length * obj.Width * obj.Depth);

    // Return the object for use in the main function
    return obj;
}
