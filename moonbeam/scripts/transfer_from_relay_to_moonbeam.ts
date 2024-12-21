import 'dotenv/config';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Command } from 'commander';


// Initialize CLI using commander
const program = new Command();

// CLI argument definitions
program
    .option('-n, --network <network>', 'Network to connect to: main, testnet, kusama', 'testnet')
    .option('-f, --foreign-asset <asset>', 'Foreign asset ID')
    .option('-a, --amount <amount>', 'Amount to transfer', '20000000000')
    .option('-p, --paraid <destinationParaId>', 'Destination parachain ID', '1000')
    .option('--sender-mnemonic <senderMnemonic>', 'Mnemonic of the sender account (sr25519)')
    .option('--dest-sk <destPrivateKey>', 'Ethereum private key of the destination account');

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
    testnet: '42259045809535163221576417993425387648',
    main: '32259045809535163221576417993425387648',
    kusama: '22259045809535163221576417993425387648',
};


/**
 * Transfers assets from Relay Chain to Moonbeam.
 * @param {string} network - The network to connect to (main, testnet, kusama).
 * @param {number} destinationParaId - The destination parachain ID (default: Moonbeam ParaID 1000).
 * @param {string} foreignAsset - The foreign asset ID to be transferred.
 * @param {string} senderMnemonic - The mnemonic of the sender account (sr25519).
 * @param {string} destPrivateKey - The private key of the destination account (Ethereum).
 * @param {string} amount - The amount to transfer in UNIT (smallest denomination).
 */
async function transferFromRelayToMoonbeam({
                                               senderMnemonic = process.env.POLKADOT_MNEMONIC as string,
                                               destPrivateKey = process.env.PRIVATE_KEY as string,
                                               amount = '20000000000',
                                               destinationParaId = 1000,
                                               foreignAsset = "32259045809535163221576417993425387648",
                                               network = 'testnet',
                                           }: {
    senderMnemonic: string;
    destPrivateKey: string;
    amount: string;
    destinationParaId: number;
    foreignAsset: string;
    network: string;
}) {
    // Wait for WASM crypto to be initialize
    console.time("Execution Time");

    await cryptoWaitReady();

    // Validate network
    if (!NETWORKS[network]) {
        throw new Error(`Invalid network specified: ${network}`);
    }

    // Initialize the Polkadot.js API for the given network
    const relayProvider = new WsProvider('wss://relay.api.moonbase.moonbeam.network');
    const relayApi = await ApiPromise.create({ provider: relayProvider });

    // Create a keyring and load your account
    const keyringSender = new Keyring({ type: 'sr25519' });
    const accountSender = keyringSender.addFromMnemonic(senderMnemonic);

    const keyringDest = new Keyring({ type: 'ethereum' });
    const accountDest = keyringDest.addFromMnemonic(destPrivateKey);

    const destination = {
        V4: {
            parents: 0,
            interior: {
                X1: [
                    {
                        Parachain: destinationParaId
                    }
                ]
            }
        }
    };
    const assets = {
        V4: [
            {
                id: {
                    parents: "0",
                    interior: "Here"
                },
                fun: {
                    Fungible: amount,
                }
            }
        ]
    };
    const assetsTransferType = { LocalReserve: null };
    const remoteFeesId = {
        V4: {
            parents: "0",
            interior: "Here"
        }
    };
    const feesTransferType = { LocalReserve: null };
    const customXCMOnDest = {
        V4: [
            {
                DepositAsset: {
                    assets: {
                        Wild: {
                            AllCounted: "1"
                        }
                    },
                    beneficiary: {
                        parents: "0",
                        interior: {
                            X1: [
                                {
                                    AccountKey20: {
                                        network: null,
                                        key: accountDest.address,
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ]
    };
    const destWeightLimit = { Unlimited: null }; // Unlimited weight for this example

    const transfer = relayApi.tx.xcmPallet.transferAssetsUsingTypeAndThen(
        destination, assets, assetsTransferType, remoteFeesId, feesTransferType, customXCMOnDest, destWeightLimit
    );

    // Sign and send the transaction
    const unsub = await transfer.signAndSend(accountSender, (result) => {
        if (result.status.isInBlock) {
            console.log(`Transfer included at block hash: ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
            console.log(`Transfer finalized at block hash: ${result.status.asFinalized}`);
            unsub(); // Unsubscribe after finalization
        } else {
            console.log(result.status.type);
        }
    });

    // Close connection after completion
    await relayApi.disconnect();
    console.timeEnd("Execution Time");
}

// Extracting arguments from the CLI and calling the transfer function
transferFromRelayToMoonbeam({
    senderMnemonic: options.senderMnemonic,
    destPrivateKey: options.destSk,
    amount: options.amount,
    destinationParaId: Number(options.paraid),
    foreignAsset: options.foreignAsset,
    network: options.network,
}).catch(console.error);