
# OFFhaust - Automated Transaction Script for Haust Network

This script automates sending HAUST tokens from one or more wallets to a list of recipients at specified intervals. It is designed for the Haust network.

## Features

- Automatically sends HAUST tokens from multiple wallets to a list of recipient addresses.
- Configurable delay between transaction batches (in hours).
- Displays wallet balances and transaction confirmations.
- Countdown timer for waiting before the next transaction batch.

## Requirements

Before running the script, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/)

### Dependencies

This project uses the following Node.js packages:

- `ethers` - For interacting with the Ethereum-compatible Haust network.
- `inquirer` - For creating prompts to gather user input.
- `fs` - For reading and writing files.

## Setup Instructions

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/anggafajarsidik/OFFhaust.git
cd OFFhaust
```

### 2. Install Dependencies

Install the required Node.js dependencies:

```bash
npm install
```

### 3. Prepare Your Files

Ensure you have the following files in the same directory as the script:

- `YourPrivateKey.txt` - A file containing your private key(s) (one per line) to be used for sending transactions.
- `listaddress.txt` - A file containing recipient wallet addresses (one per line).

### 4. Running the Script

To execute the script, run the following command:

```bash
node autosend.js
```

The script will prompt you for the following:

- **Amount of HAUST to send**: Enter the number of HAUST tokens you want to send per transaction.
- **Wait time before next batch**: Enter how many hours to wait before sending the next batch of transactions.

The script will then proceed to send transactions and display relevant information, including wallet balances and confirmation of successful transactions. A countdown will show the remaining time before the next batch.

##Disclaimer
This script is provided "as-is" for educational purposes only. The author and contributors are not responsible for any damages, losses, or legal issues arising from the use of this script. Users must ensure compliance with local laws and regulations regarding cryptocurrency transactions and blockchain technology.

Use at your own risk.
