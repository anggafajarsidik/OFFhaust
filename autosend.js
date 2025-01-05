const { ethers } = require("ethers");
const fs = require("fs");

// Configuration
const RPC_URL = "https://rpc-test.haust.network";
const CHAIN_ID = 1570754601;
const PRIVATE_KEY_FILE = "YourPrivateKey.txt";
const MULTIPLE_WALLETS_FILE = "listaddress.txt";

// ANSI color codes
const colors = {
    reset: "\x1b[0m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
};

// ASCII logo
const logo = `
 ██████╗ ███████╗███████╗    ███████╗ █████╗ ███╗   ███╗██╗██╗  ██╗   ██╗
██╔═══██╗██╔════╝██╔════╝    ██╔════╝██╔══██╗████╗ ████║██║██║  ╚██╗ ██╔╝
██║   ██║█████╗  █████╗      █████╗  ███████║██╔████╔██║██║██║   ╚████╔╝
██║   ██║██╔══╝  ██╔══╝      ██╔══╝  ██╔══██║██║╚██╔╝██║██║██║    ╚██╔╝
╚██████╔╝██║     ██║         ██║     ██║  ██║██║ ╚═╝ ██║██║███████╗██║
 ╚═════╝ ╚═╝     ╚═╝         ╚═╝     ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚══════╝╚═╝
`;

// Countdown timer
function countdownTimer(durationMs) {
    return new Promise((resolve) => {
        let remainingTime = durationMs / 1000; // Convert to seconds
        const interval = setInterval(() => {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = Math.floor(remainingTime % 60);

            process.stdout.write(
                `\r${colors.green}Countdown to next batch: ${colors.blue}${minutes}m ${seconds}s remaining...${colors.reset}`
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
        console.log(`${colors.blue}Sending transaction from ${wallet.address} to ${recipientAddress}...${colors.reset}`);
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
        console.error(`${colors.red}Error sending transaction:${colors.reset}`, error.message);
    }
}

// Main function
async function main(amountToSend, delayMs) {
    console.clear();
    console.log(`${colors.green}${logo}${colors.reset}`);
    console.log(`${colors.blue}Starting batch transactions...${colors.reset}`);

    const privateKeys = fs.readFileSync(PRIVATE_KEY_FILE, "utf8").trim().split("\n");
    const recipients = fs.readFileSync(MULTIPLE_WALLETS_FILE, "utf8").trim().split("\n");

    for (const privateKey of privateKeys) {
        const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(RPC_URL));
        for (const recipient of recipients) {
            await sendTransaction(wallet, recipient, amountToSend);
        }
    }

    console.log(`${colors.green}Batch complete! Waiting for the next batch...${colors.reset}`);
    await countdownTimer(delayMs);
    main(amountToSend, delayMs); // Repeat
}

// Initial prompt
(async () => {
    console.clear();
    console.log(`${colors.green}${logo}${colors.reset}`);
    console.log(`${colors.blue}Welcome to the HAUST Batch Transaction Script!${colors.reset}`);

    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    readline.question("Enter the amount of HAUST to send to each recipient: ", (amount) => {
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            console.error(`${colors.red}Invalid amount! Exiting...${colors.reset}`);
            readline.close();
            return;
        }

        readline.question("Enter the delay between batches (in hours): ", (hours) => {
            if (isNaN(hours) || parseInt(hours) <= 0) {
                console.error(`${colors.red}Invalid delay! Exiting...${colors.reset}`);
                readline.close();
                return;
            }

            const amountToSend = parseFloat(amount).toFixed(18); // Format amount
            const delayMs = parseInt(hours) * 60 * 60 * 1000; // Convert to milliseconds
            readline.close();
            main(amountToSend, delayMs);
        });
    });
})();
