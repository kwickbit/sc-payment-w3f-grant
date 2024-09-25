import 'dotenv/config';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { cryptoWaitReady, decodeAddress } from '@polkadot/util-crypto';
import { Command } from 'commander';


// Initialize CLI using commander
const program = new Command();

// CLI argument definitions
program
    .option('-n, --network <network>', 'Network to connect to: main, testnet, kusama', 'testnet')
    .option('-f, --foreign-asset <asset>', 'Foreign asset ID') // No default here as we set it based on network later
    .option('-a, --amount <amount>', 'Amount to transfer', '20000000000') // Default amount is 1 unit in the smallest denomination
    .option('--sender-sk <senderSk>', 'Ethereum private key of the sender')
    .option('--dest-mnemonic <destMnemonic>', 'Mnemonic of the destination account');

program.parse(process.argv); // Parse CLI arguments

const options = program.opts();

// Define the supported networks and the corresponding WebSocket providers
const NETWORKS: Record<string, string> = {
    testnet: 'wss://moonbase-alpha.public.blastapi.io/',
    main: 'wss://moonbeam.public.blastapi.io/',
    kusama: 'wss://moonriver.public.blastapi.io/',
};

// Define default foreign asset IDs for each network
const DEFAULT_FOREIGN_ASSETS: Record<string, string> = {
    testnet: '42259045809535163221576417993425387648', // Replace with actual testnet ID if different
    main: '32259045809535163221576417993425387648',    // Replace with the main network ID
    kusama: '22259045809535163221576417993425387648',  // Replace with the Kusama network ID
};


/**
 * Transfers assets from Moonbeam to the Relay chain.
 * @param {string} network - The target network to connect to (main, testnet, kusama).
 * @param {string} foreignAsset - The foreign asset ID to be transferred.
 * @param {string} amount - The amount to transfer in the smallest denomination.
 * @param {string} senderSk - The private key of the Ethereum sender account.
 * @param {string} destMnemonic - The mnemonic of the destination account.
 *
 * @remarks
 * The foreignAsset ID is not the XC20 contract address. Foreign Asset IDs can be found at the following link:
 * https://xc20s-dashboard.netlify.app/?network=moonbeam
 */
async function transferFromMoonbeamToRelay({
                                                   network = 'testnet',
                                                   foreignAsset = DEFAULT_FOREIGN_ASSETS[network],
                                                   amount = '20000000000',
                                                   senderPrivateKey = process.env.PRIVATE_KEY as string,
                                                   destMnemonic = process.env.POLKADOT_MNEMONIC as string,
                                               }: {
        network: string;
        foreignAsset?: string;
        amount: string;
        senderPrivateKey: string;
        destMnemonic: string;
    }) {
    // Ensure WASM crypto initialization
    await cryptoWaitReady();

    // Validate network
    if (!NETWORKS[network]) {
        throw new Error(`Invalid network specified: ${network}`);
    }

    // Initialize the Polkadot.js API for the given network
    const moonbaseProvider = new WsProvider(NETWORKS[network]);
    const moonbaseApi = await ApiPromise.create({ provider: moonbaseProvider });

    // Create keyrings for sender and destination accounts
    const keyringDest = new Keyring({ type: 'sr25519' });
    const keyringSender = new Keyring({ type: 'ethereum' });

    // Load sender and destination accounts from their respective keys/mnemonics
    const accountSender = keyringSender.addFromMnemonic(senderPrivateKey);
    const accountDest = keyringDest.addFromMnemonic(destMnemonic);
    const addressDest = decodeAddress(accountDest.address);

    // Foreign Asset ID for the specific network
    const currencyId = {
        ForeignAsset: foreignAsset
    };

    // Destination structure as required by Moonbeam
    const destination = {
        V4: {
            parents: 1,
            interior: {
                X1: [
                    {
                        AccountId32: {
                            network: null,
                            id: addressDest,
                        }
                    }
                    ]
            }
        }
    };

    // No limit on weight for this example
    const destWeightLimit = { Unlimited: null }; // Unlimited weight for this example

    // Prepare and send the transfer transaction
    const tx = moonbaseApi.tx.xTokens.transfer(currencyId, amount, destination, destWeightLimit);

    // Sign and send the transaction, waiting for confirmation
    const unsub = await tx.signAndSend(accountSender, (result) => {
        if (result.status.isInBlock) {
            console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
            console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
            unsub();
        }
    });

    // Close the connection after transaction
    moonbaseApi.disconnect();
}

// Extracting arguments from the CLI and calling the transfer function
transferFromMoonbeamToRelay({
    network: options.network,
    foreignAsset: options.foreignAsset || DEFAULT_FOREIGN_ASSETS[options.network], // Set the default foreign asset ID based on the network
    amount: options.amount,
    senderPrivateKey: options.senderSk || process.env.PRIVATE_KEY, // If --sender-sk is not provided, fallback to env variable
    destMnemonic: options.destMnemonic || process.env.POLKADOT_MNEMONIC, // If --dest-mnemonic is not provided, fallback to env variable
}).catch(console.error);