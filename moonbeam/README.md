# Moonbeam-Relay Chain Payment Solution

## Overview

This project explores the feasibility of using scripts and smart contracts to facilitate asset transfers between the Polkadot/Kusama relay chain (or AssetHub) and the Moonbeam parachain. The aim is to enable users to pay for invoices using assets from the relay chain and then to manage payments via smart contracts deployed on Moonbeam.

### Key Features:
1. **Asset Transfer Between Chains**: Transfer assets between the Moonbeam parachain and the relay chain (or AssetHub) using Polkadot.js API scripts.
2. **Smart Contract Interaction**: Handle payments via smart contracts deployed on Moonbeam. The user authorizes a smart contract for payment, attaches a 'paymentId' to track the payment, and the contract verifies that the payment is not a duplicate.
3. **Payment Event Emission**: Upon successful payment, the smart contract emits a 'Payment(paymentId)' event.
4. **Refund via Batch Call**: After the payment is made, the user triggers the transfer of any remaining funds back to the relay chain using a batch call, which includes the call to the smart contract. The smart contract itself does not handle the refund automatically.
5. **Event Indexer**: An indexer that listens for payment events emitted by the smart contract and notifies (logs) the event.


## Folder Structure

```
.
├── scripts/
│   ├── transfer_from_moonbeam_to_relay.ts
│   ├── transfer_from_relay_to_moonbeam.ts
├── contracts/
│   └── PaymentContract.sol
├── README.md
└── package.json
```

- **scripts/**: Contains TypeScript scripts that handle asset transfers between Moonbeam and the relay chain.
    - 'transfer_from_moonbeam_to_relay.ts': A script to transfer assets from Moonbeam to the relay chain.
    - 'transfer_from_relay_to_moonbeam.ts': A script to transfer assets from the relay chain to Moonbeam.

- **contracts/**: Contains Solidity contracts for handling payments.
    - 'PaymentContract.sol': A Solidity contract deployed on Moonbeam that manages payments with unique 'paymentId's and emits events.

## Installation

### Prerequisites

- Node.js >= 18.x
- 'npm' or 'yarn'
- Polkadot.js API
- Solidity compiler ('solc')

### Steps

1. Clone the repository:
   ```
   git clone git@github.com:kwickbit/sc-payment-w3f-grant.git
   cd sc-payment-w3f-grant/moonbeam
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your `.env` file to store sensitive keys (or pass them via CLI). Your `.env` file should contain:
   ```
   PRIVATE_KEY=your_sender_private_key
   POLKADOT_MNEMONIC=your_destination_mnemonic
   ```

4. Compile the Solidity contract:
   ```
   npx hardhat compile
   ```

## Usage

### 1. Transferring Assets from Moonbeam to Relay Chain

To transfer assets from Moonbeam to the relay chain:

```
node scripts/transfer_from_moonbeam_to_relay.ts --network testnet --foreign-asset <foreign_asset_id> --amount <amount> --sender-sk <your_sender_private_key> --dest-mnemonic <your_destination_mnemonic>
```

- **network** ('-n') - The network to use (testnet, main, kusama). Default: 'testnet'.
- **foreign-asset** ('-f') - The foreign asset ID (default: network-specific default).
- **amount** ('-a') - The amount to transfer (default: '20000000000').
- **sender-sk** - Sender's Ethereum private key.
- **dest-mnemonic** - Destination Polkadot account mnemonic.

### 2. Transferring Assets from Relay Chain to Moonbeam (not implemented yet)

To transfer assets from the relay chain to Moonbeam:

```
node scripts/transfer_from_relay_to_moonbeam.ts --network testnet --foreign-asset <foreign_asset_id> --amount <amount> --sender-sk <your_sender_private_key> --dest-mnemonic <your_destination_mnemonic>
```

- **network** ('-n') - The network to use (testnet, main, kusama). Default: 'testnet'.
- **foreign-asset** ('-f') - The foreign asset ID (default: network-specific default).
- **amount** ('-a') - The amount to transfer (default: '20000000000').
- **dest-sk** - Destination's Ethereum private key.
- **sender-mnemonic** - Sender's Polkadot account mnemonic.


### 3. Smart Contract Deployment and Payment

The `PaymentContract.sol` smart contract allows users to pay for invoices on Moonbeam. To deploy the contract, you can use tools like Hardhat or Remix.

#### Deploying the Contract

1. Ensure your Solidity contract is in the `contracts/` folder.
2. Compile and deploy the contract using a tool like Hardhat:
   ```
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network moonbeam
   ```

#### Payment Workflow:

1. The user authorizes the smart contract to withdraw up to a specified amount.
2. The user calls the smart contract’s 'pay' function, attaching a 'paymentId' for tracking.
3. The contract verifies the payment has not been made before (to avoid duplicates).
4. The contract emits a 'Payment(paymentId)' event upon successful payment.
5. If any funds remain unused, the user triggers a batch call that transfers the remaining funds back to the relay chain.

### 4. Indexer for Smart Contract Events (to be implemented)

An indexer is implemented to listen for the `Payment(paymentId)` event emitted by the smart contract. This indexer can be used to log the payment event to the terminal or trigger additional business logic.

```
node scripts/event_indexer.js
```

This script listens for events and logs them when a payment is processed on Moonbeam.

## Environment Variables

The following environment variables should be set in a `.env` file or passed as command-line arguments:

- **PRIVATE_KEY**: The Ethereum sender's private key.
- **POLKADOT_MNEMONIC**: The destination Polkadot mnemonic used for receiving assets.

## Example Workflow

1. **User transfers assets from the relay chain to Moonbeam**.
2. **User authorizes the smart contract on Moonbeam** to handle the payment.
3. **User calls the smart contract** with the 'paymentId'.
4. **Smart contract verifies and emits the 'Payment(paymentId)' event**.
5. **An indexer listens for the 'Payment' event** and notifies when the payment is completed.
6. **The user triggers a batch call** to send any remaining funds from Moonbeam to the relay chain.

## Notes

- The 'foreignAsset' ID used in transfers is **not** the XC20 contract address but the foreign asset ID. These can be found at the following link: [XC20 Assets Dashboard](https://xc20s-dashboard.netlify.app/?network=moonbeam).

## Future Work

- Implement the **event indexer** to listen for payment events emitted by the smart contract and notify in real time.
- Integrate more robust **batch processing** for handling multiple payments in a single transaction.


## License

This project is licensed under the Apache 2.0 License.

