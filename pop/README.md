# Non-Custodial Payment Processor using Pop-Network

This smart contract is designed to act as a **non-custodial payment processor** in a multi-chain environment, leveraging the **Polkadot Asset Hub (Paseo)** and cross-consensus messaging (XCM).

### Overview
The contract facilitates payments for users by interacting with the **Asset Hub** to process stablecoin transactions. It prevents double payments by tracking payment statuses and relies on an off-chain indexer to handle XCM result callbacks.

---

## Payment Flow Explanation

1. **User Approval**: The user pre-approves a transfer of the payment amount (e.g., USDC) to the contract's address on the Asset Hub.
2. **Calling the Contract**: The user calls the `pay` method on this contract, providing the `payment_id` and amount.
3. **XCM Message**: The contract sends an XCM message to the Asset Hub to initiate the payment.
4. **Event Detection**: Off-chain indexers detect the XCM result and call back the contract with success or failure.
5. **Fund Transfer**: In case of success, the program transfers the funds to the recipient.


---

## Directories

### `payment-processor`
Contains the files defining the smart contract.

### `pop-indexer`
Contains the indexer project that monitors `MessageQueue.Processed` events.

---

## Deployment and Testing Instructions

### Deploying the Smart Contract

1. **Navigate to the `payment-processor` folder**:
   ```bash
   cd payment-processor
   ```

2. **Modify the Asset ID**:
    - Update the variable `ASSET_ID` in the code with an asset ID you own on Asset Hub Paseo.
    - You can create and mint your own asset using [polkadot.js.org](https://polkadot.js.org/) and set the corresponding asset ID in the code.

3. **Build the Contract**:
   ```bash
   pop build
   ```
    - Follow installation instructions for the `pop` CLI if not already installed: [Installing Pop CLI](https://learn.onpop.io/cli/installing-pop-cli).

4. **Deploy the Contract**:
    - Use [contracts.onpop.io](https://contracts.onpop.io/contract/) to deploy the contract.

5. **Fund the Smart Contract**:
    - Retrieve the contract's Asset Hub address from [contracts.onpop.io](https://contracts.onpop.io/contract/).
    - Transfer funds to the contract's address on the Asset Hub: Use [polkadot.js.org](https://polkadot.js.org/) to make the transfer by clicking on `Transfer`.

6. **Test the Payment Feature**:
    - Navigate to [polkadot.js.org](https://polkadot.js.org/) and go to `Developer` -> `Extrinsics`.
    - Use another address (different from the deployer) for testing the payment feature.
    - Call the `pay` method with the following parameters:
        - **amount**: The amount for the transfer.
        - **payment_id**: A random 32-byte string in hex format.

#### Troubleshoot
**Required Tokens**:
  - Ensure you have **PAS tokens** on the Pop network chain for the address calling the `pay` method.
  - Use the [Polkadot Faucet](https://faucet.polkadot.io/) to claim PAS tokens for your Asset Hub or Paseo relay chain address.
  - Transfer PAS tokens from the relay chain to the Pop chain using [onboard.popnetwork.xyz](https://onboard.popnetwork.xyz/).

### Running the Indexer

1. **Navigate to the `pop-indexer` folder**:
   ```bash
   cd pop-indexer
   ```

2. **Create a `.env` file**:
   Add the following variables:
   ```
   CONTRACT_ADDRESS=<CONTRACT_ADDRESS>
   DB_PORT=5432
   GATEWAY_URL=https://v2.archive.subsquid.io/network/asset-hub-paseo
   RPC_ENDPOINT_URL=wss://asset-hub-paseo-rpc.dwellir.com
   BLOCK_NUMBER_START=<RECENT_BLOCK_NUMBER>
   ```

3. **Run the Indexer**:
   ```bash
   docker-compose up --build
   ```

---

## Constants

### General Constants
- **`ASSET_ID`**: The ID of the asset on the Asset Hub. This contract uses asset ID `27` (e.g., USDC).
- **`REF_TIME`**: Reference time parameter for XCM execution.
- **`PROOF_SIZE`**: Proof size parameter for XCM execution.
- **`FEE_MAX`**: Maximum fees the contract is willing to pay for XCM execution on the Asset Hub.

### Payment Status
- **`PAYMENT_FAILED`**: Payment processing failed (`3`).
- **`PAYMENT_DONE`**: Payment successfully completed (`1`).
- **`PAYMENT_ONGOING`**: Payment is in progress (`2`).
- **`PAYMENT_NO_STATUS`**: No payment associated with the given `payment_id` (`0`).

---

## Contract Components

### Storage
1. **`payments`**: Tracks the status of payments using a `Mapping` of `payment_id` (key) to `status` (value).
2. **`owner`**: Stores the account that deployed the contract (the contract owner).

### Error Types
`RuntimeError` captures potential runtime issues, particularly around XCM execution:
- **`XcmExecuteFailed`**: XCM execution failed.
- **`XcmSendFailed`**: XCM message transmission failed.

---

## Key Methods

### Constructor
**`new()`**
- Initializes the contract storage.
- Sets the `owner` as the caller of the constructor.

### Payment Flow

#### `pay(amount: u128, payment_id: [u8; 32])`
Processes a payment:
1. Checks if the `payment_id` already exists with an ongoing or completed status.
2. Sends an XCM message to the Asset Hub to execute a `TransferApproved` transaction.
3. Sets the payment status to `PAYMENT_ONGOING`.
4. Returns the hash of the XCM message sent.

#### `callback_success(payment_id: Vec<u8>)`
Marks a payment as successfully completed:
- Checks that the caller is the contract owner.
- Updates the `payments` mapping with `PAYMENT_DONE`.

#### `callback_fail(payment_id: Vec<u8>)`
Marks a payment as failed:
- Checks that the caller is the contract owner.
- Updates the `payments` mapping with `PAYMENT_FAILED`.

#### `get(payment_id: Vec<u8>) -> u8`
Retrieves the current status of a payment by its `payment_id`. Returns:
- **`PAYMENT_FAILED`**, **`PAYMENT_DONE`**, **`PAYMENT_ONGOING`**, or **`PAYMENT_NO_STATUS`**.

### Utilities

#### `convert_to_hash(family: &str, para_id: u32, account_id: AccountId) -> [u8; 32]`
Generates a 256-bit hash based on the provided parachain and account information. This is used to identify the contract address on the sibling chain.

#### `get_ah_address() -> [u8; 32]`
Returns the hashed address of the contract on the sibling Asset Hub parachain.

---

### Known Limitations

- **Async Nature of XCM**: The contract cannot directly determine the success of the XCM transaction. This is handled by the off-chain indexer.
- **Indexer Dependency**: An off-chain indexer is required to process XCM events and trigger the callback methods.

