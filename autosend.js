const { ethers } = require("ethers");
const fs = require("fs");
const inquirer = require("inquirer");

// Configuration
const RPC_URL = "https://rpc-test.haust.network";
const CHAIN_ID = 1570754601;
const PRIVATE_KEY_FILE = "YourPrivateKey.txt";
const MULTIPLE_WALLETS_FILE = "listaddress.txt";

// ANSI color codes
const colors = {
    reset: "\x1b[0m",
    purple: "\x1b[35m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
};

// Custom ASCII art logo
const createdByLogo = `
 ██████╗ ███████╗███████╗    ███████╗ █████╗ ███╗   ███╗██╗██╗  ██╗   ██╗
██╔═══██╗██╔════╝██╔════╝    ██╔════╝██╔══██╗████╗ ████║██║██║  ╚██╗ ██╔╝
██║   ██║█████╗  █████╗      █████╗  ███████║██╔████╔██║██║██║   ╚████╔╝
██║   ██║██╔══╝  ██╔══╝      ██╔══╝  ██╔══██║██║╚██╔╝██║██║██║    ╚██╔╝
╚██████╔╝██║     ██║         ██║     ██║  ██║██║ ╚═╝ ██║██║███████╗██║
 ╚═════╝ ╚═╝     ╚═╝         ╚═╝     ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚══════╝╚═╝
`;

const creativeMessage = `
We’re here to make blockchain easier and better.
`;

function displayAnimatedText(text, color, callback) {
    let index = 0;
    const interval = setInterval(() => {
        if (index < text.length) {
            process.stdout.write(color + text[index++] + colors.reset);
        } else {
            process.stdout.write("\n");
            clearInterval(interval);
            if (callback) callback(); // Call the next function after animation
        }
    }, 50);
}

function displayMessage(callback) {
    displayAnimatedText("Script Created by:", colors.blue, () => {
        console.log(`${colors.purple}${createdByLogo}${colors.reset}`);
        displayAnimatedText(creativeMessage, colors.blue, callback);
    });
}

// Clear terminal once at the beginning
console.clear();

// Load private keys from file
function loadPrivateKeys() {
    try {
        const privateKeys = fs.readFileSync(PRIVATE_KEY_FILE, "utf8").trim().split("\n");
        return privateKeys.map((key) => key.trim()).filter((key) => key.length > 0);
    } catch (error) {
        console.error(`${colors.red}Error reading private keys from ${PRIVATE_KEY_FILE}:${colors.reset}`, error.message);
        process.exit(1);
    }
}

// Load recipient addresses from file
function loadRecipients() {
    try {
        if (fs.existsSync(MULTIPLE_WALLETS_FILE)) {
            const addresses = fs.readFileSync(MULTIPLE_WALLETS_FILE, "utf8").trim().split("\n");
            return addresses.filter((addr) => ethers.isAddress(addr));
        }
        console.error(`${colors.red}File ${MULTIPLE_WALLETS_FILE} not found or is empty.${colors.reset}`);
        process.exit(1);
    } catch (error) {
        console.error(`${colors.red}Error reading addresses from ${MULTIPLE_WALLETS_FILE}:${colors.reset}`, error.message);
        process.exit(1);
    }
}

// Countdown timer
function countdownTimer(durationMs) {
    return new Promise((resolve) => {
        let remainingTime = durationMs / 1000; // Convert to seconds
        const interval = setInterval(() => {
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = Math.floor(remainingTime % 60);

            process.stdout.write(
                `\r${colors.green}Countdown to next batch: ${colors.blue}${hours}h ${minutes}m ${seconds}s remaining...${colors.reset}`
            );

            remainingTime--;

            if (remainingTime < 0) {
                clearInterval(interval);
                process.stdout.write("\n");
                resolve();
            }
        }, 1000);
    });
}

// Send transaction
async function sendTransaction(wallet, recipientAddress, amountToSend) {
    try {
        if (wallet.address.toLowerCase() === recipientAddress.toLowerCase()) {
            console.warn(`${colors.yellow}Skipping: Cannot send to the sender's own address (${wallet.address})${colors.reset}`);
            return;
        }
        console.log(`${colors.blue}Sending transaction from ${wallet.address} to ${recipientAddress}...${colors.reset}`);
        const balance = await wallet.provider.getBalance(wallet.address);
        const balanceInEther = ethers.formatEther(balance);
        console.log(`${colors.green}Wallet balance: ${balanceInEther} HAUST${colors.reset}`);
        if (BigInt(balance) < ethers.parseEther(amountToSend)) {
            console.error(`${colors.red}Insufficient funds!${colors.reset}`);
            return;
        }
        const tx = {
            to: recipientAddress,
            value: ethers.parseEther(amountToSend),
            chainId: CHAIN_ID,
        };
        const txResponse = await wallet.sendTransaction(tx);
        const receipt = await txResponse.wait();
        console.log(`${colors.green}Transaction confirmed in block ${receipt.blockNumber}${colors.reset}`);
        console.log(`${colors.green}View on Explorer: https://explorer-test.haust.network/tx/${txResponse.hash}${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}Error sending transaction from ${wallet.address} to ${recipientAddress}:${colors.reset}`, error.message);
    }
}

// Main function
async function main() {
    displayMessage(async () => {
        const privateKeys = loadPrivateKeys();
        const recipients = loadRecipients();
        if (privateKeys.length === 0) {
            console.error(`${colors.red}No private keys found in YourPrivateKey.txt!${colors.reset}`);
            return;
        }
        if (recipients.length === 0) {
            console.error(`${colors.red}No recipient addresses found in listaddress.txt!${colors.reset}`);
            return;
        }
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const prompt = inquirer.createPromptModule();

        while (true) {
            const answers = await prompt([
                {
                    type: "input",
                    name: "amountToSend",
                    message: "Enter the amount of HAUST to send:",
                    validate: (input) => !isNaN(parseFloat(input)) && parseFloat(input) > 0 || `${colors.red}Invalid amount!${colors.reset}`,
                },
                {
                    type: "input",
                    name: "delayHours",
                    message: "How many hours to wait before sending the next batch of transactions? (e.g., 1 hour = 1, 24 hours = 24):",
                    validate: (input) => !isNaN(parseInt(input)) && parseInt(input) > 0 || `${colors.red}Invalid number of hours!${colors.reset}`,
                },
            ]);

            const amountToSend = answers.amountToSend;
            const delayMs = parseInt(answers.delayHours) * 60 * 60 * 1000;

            for (const privateKey of privateKeys) {
                const wallet = new ethers.Wallet(privateKey, provider);
                console.log(`\n${colors.purple}Starting transactions from sender: ${wallet.address}${colors.reset}`);
                for (const recipient of recipients) {
                    await sendTransaction(wallet, recipient, amountToSend);
                }
            }

            console.log(`\n${colors.green}All transactions completed! Countdown to next batch starting...${colors.reset}`);
            await countdownTimer(delayMs);
        }
    });
}

main();
