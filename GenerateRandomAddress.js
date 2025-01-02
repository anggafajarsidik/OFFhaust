const fs = require('fs');
const { ethers } = require('ethers');
const inquirer = require('inquirer');

// File to save the generated addresses
const OUTPUT_FILE = 'listaddress.txt';

async function main() {
    // Ask user how many addresses to generate
    const prompt = inquirer.createPromptModule();
    const { count } = await prompt([
        {
            type: 'input',
            name: 'count',
            message: 'How many random addresses do you want to generate?',
            validate: (input) => {
                const num = parseInt(input);
                return num > 0 ? true : 'Please enter a valid positive number.';
            },
        },
    ]);

    // Generate random addresses
    console.log(`Generating ${count} random addresses...`);
    const addresses = [];
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        addresses.push(wallet.address);
    }

    // Write addresses to file
    try {
        fs.writeFileSync(OUTPUT_FILE, addresses.join('\n'), 'utf8');
        console.log(`Successfully saved ${count} addresses to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`Error writing to file: ${error.message}`);
    }
}

main().catch((error) => {
    console.error(`Error: ${error.message}`);
});
