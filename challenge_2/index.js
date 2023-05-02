/*
 * "Environment Setup"
 */

// Import statements
const readline = require('node:readline');
const util = require('util');

// Initialize the readline with stdio
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify node:readline.question()
const question = util.promisify(rl.question).bind(rl);

/*
 * Main function
 */

// Declare the overall total and average globally for use in multiple areas
let ovaAvg = 0;
let ovaTotal = 0;

// Main function
(async () => {
    // Declare a cities array for pushing cities into
    const cities = [];

    // Print the name of the program
    console.log('Weather Data');
    console.log();
    
    // Set up the loop
    var i = 0;
    let flag = true;

    // Loop through so that there are AT LEAST 5 cities
    do {
        // Check if there are more than 5 cities
        if (i >= 5) {
            // Prompt the user to add another city
            let c = await question('Add another city? (y/n) >> ');

            // If the user did not say yes, break out of the loop
            if (c.toLowerCase() != 'y')
                break;
        }

        // Get the city info
        const city = await getCity();

        // Push the city data into the cities array for later use
        cities.push(city);

        // Add to the total temp
        ovaTotal += city.temps.avg;

        // Calculate the total avg temp
        ovaAvg = parseFloat((ovaTotal / cities.length).toFixed(1));

        console.log();

        // Write the data to the stdout for the user
        displayData(city);
        console.log();

        // Increment city counter
        i++;
    } while(i < 5 || flag);

    console.log();

    // Upon gathering all cities, record the overall average temperature
    console.log(`Overall Average Temperature: ${ovaAvg}F, ${parseFloat(fToC(ovaAvg).toFixed(1))}C`);

    // Close the reader
    rl.close();
})();

/**
 * Prompts the user for all data about a city. 
 * This includes the name of the city and the temperatures recorded.
 * 
 * @returns Object containing city name and temperature data
 */
async function getCity() {
    const temps = [];
    let tempAvg = 0;
    let tempHighest = 0;
    let tempLowest = 0;

    let name = await question('Enter city name >> ');
    
    console.log();
    console.log('Note: Temperatures should be recorded in Fahrenheit.');
    do {
        let temp = await question("Enter a temperature (type 'close' to exit) >> ");
        
        if (temp.toLowerCase() == 'close')
            break;
        
        temp = parseInt(temp);

        if (temp > tempHighest)
            tempHighest = temp;
        
        if (temps.length == 0 || temp < tempLowest)
            tempLowest = temp;

        temps.push(temp);
    } while(true);

    temps.forEach(e => tempAvg += e);
    tempAvg = parseFloat((tempAvg / temps.length).toFixed(1));

    return {
        name: name,
        temps: {
            allTemps: temps,
            avg: tempAvg,
            high: tempHighest,
            low: tempLowest
        }
    }
}

/**
 * Prints the data into the stdout for the user to view.
 * @param {Object} data Object containing all data about one city
 */
function displayData(data) {
    // Print out overall average temperature
    console.log(`Current Overall Average Temperature: ${ovaAvg}F, ${parseFloat(fToC(ovaAvg).toFixed(1))}C`);

    // Print the name of the city
    console.log(`City: ${data.name}`);

    // Indicate that the following lines include temperature data
    console.log('Temperatures: ');

    // Loop through each individual temperature and print it out
    data.temps.allTemps.forEach(e => {
        // Displays each temperature in both Fahrenheit and Celsius
        console.log(`    ${e}F, ${Math.round(fToC(e))}C`);
    });

    // Prints out the average temperature of the city
    console.log(`Current Average Temperature: ${data.temps.avg}F, ${parseFloat(fToC(data.temps.avg).toFixed(1))}C`);

    // Prints out the highest temperature recorded for the city
    console.log(`Highest Temperature: ${data.temps.high}F, ${Math.round(fToC(data.temps.high))}C`);
    
    // Prints out the lowest temperature recorded for the city
    console.log(`Lowest Temperature: ${data.temps.low}F, ${Math.round(fToC(data.temps.low))}C`);
}

/**
 * Converts a temperature in Fahrenheit to one in Celsius
 * 
 * @param {Number} f Temperature given in Fahrenheit
 * @returns Floating point number as the temperature given in Celsius
 */
function fToC(f) {
    // Equation for the conversion
    return 5 / 9 * (f - 32);
}
