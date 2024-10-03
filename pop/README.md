# Payment Processor Smart Contract

This contract allows the execution of payments through the XCM protocol using encoded extrinsics, enabling cross-chain asset transfers via a Polkadot parachain (such as AssetHub). It supports managing and verifying payments, as well as executing transactions with a fixed fee.

## Contract Overview

The `PaymentProcessor` smart contract includes the following key features:

- **Cross-chain Transaction Support**: Utilizes XCM protocol to perform transactions between chains.
- **Refund Mechanism**: Refunds excess payment if the specified fee exceeds the actual cost.

The main message method is `pay`, which requires the encoded extrinsic data to perform the transaction, along with fee and execution parameters.

## Extrinsic Data Format

The contract expects an encoded version of the following extrinsic for processing payments:

```
TransferApproved {
    asset_id: "<ASSET_HUB_ASSET_ID>",
    owner: {
        Id: "<DELEGATOR_ADDRESS>"
    },
    destination: {
        Id: "<CONTRACT_ADDRESS_ON_ASSET_HUB>"
    },
    amount: <TRANSFER_AMOUNT>
}
```

### How to Approve Transfers

To perform the approval, you can use [Polkadot.js](https://polkadot.js.org/apps/).

Steps:
1. Access the Polkadot.js portal.
2. Select the appropriate account (the delegator).
3. Call the `approveTransfer` function on the destination contract with the desired amount and asset ID.

### Encoding the Extrinsic

After approving the transfer, you need to encode the extrinsic data that contains the transfer details in the format mentioned above. This encoded data will be passed to the smart contract when calling the `pay` function.

## Deployment Instructions

Follow these steps to compile, deploy, and interact with the contract:

### 1. Compile the Smart Contract

```sh
pop build
```

### 2. Upload and Deploy

Go to [contracts.onpop.io](https://contracts.onpop.io) to upload and deploy the contract. Once deployed, note the contract's address on the destination chain.

### 3. Interact with the Contract

Using [contracts.onpop.io](https://contracts.onpop.io), you can interact with the contract's `pay` method, providing the required parameters.

### Required Parameters for the `pay` Function

- **feeMax**: `10000000000`
- **refTime**: `10000000000`
- **proofSize**: `100000`
- **toRefund**: The contract's own address on AssetHub.

--- 

This README provides a summary of the payment processing smart contract, explains the extrinsic encoding process, and includes the steps required for deployment and interaction.
