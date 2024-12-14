# Moonbeam Use Case: Testing the Smart Contract

This guide explains how to test the Moonbeam use case for the Polkadot Ecosystem Smart Contract Solutions Benchmark. The Moonbeam implementation demonstrates the capabilities of Ethereum-compatible smart contracts within the Polkadot ecosystem.

---

## Prerequisites

### Tools and Accounts
1. **Polkadot.js Wallet**
    - Set up a Polkadot.js wallet and create accounts for testing.

2. **Moonbeam Development Tools**
    - Familiarity with Ethereum-compatible tools like [Remix](https://remix.ethereum.org/), [Hardhat](https://hardhat.org/), or [Truffle](https://trufflesuite.com/).

3. **USDC Asset on Asset Hub**
    - Mint or acquire USDC (asset ID: 27) on the Asset Hub.

4. **Moonbeam Testnet (Moonbase Alpha)**
    - Fund your test account with GLMR tokens from the [Moonbase Alpha Faucet](https://docs.moonbeam.network/builders/get-started/testnet/faucet/).

5. **Installed Pop CLI**
    - Install the Pop CLI for deployment and interaction:
      '''
      npm i -g @subsquid/cli@latest
      '''

---

## Testing the Smart Contract

### Step 1: Teleport USDC to Moonbeam
1. Use the provided script `scripts/transfer_from_relay_to_moonbeam.ts`:
    - This script automates the teleportation of USDC from Asset Hub to Moonbeam, converting it into xUSDC.
    - Run the script using:
      '''
      ts-node scripts/transfer_from_relay_to_moonbeam.ts
      '''
2. Ensure that the USDC appears as `xUSDC` on Moonbeam after the teleportation.

### Step 2: Deploy the Smart Contract
1. Use a development tool like Remix or Hardhat.
2. Deploy the Solidity smart contract to the Moonbeam network:
    - Ensure the contract has methods to handle USDC payments.
    - Use the Moonbeam testnet RPC endpoint: `https://rpc.testnet.moonbeam.network`.

3. After deployment, note the contract address for future interactions.

### Step 3: Interact with the Contract
1. **Prerequisite GLMR Tokens**: Ensure the test wallet interacting with the contract has enough GLMR tokens to pay gas fees.
2. Call the payment method on the contract with the following parameters:
    - **`amount`**: The USDC amount for payment.
    - **`payment_id`**: A random unique identifier for the transaction (e.g., `0x1234...`).
3. Confirm the transaction and monitor its status on a block explorer like [Moonscan](https://moonbase.moonscan.io/).

### Step 4: Teleport xUSDC Back to Asset Hub
If needed, use the provided script `scripts/transfer_from_moonbeam_to_relay.ts` to teleport xUSDC back to Asset Hub:
- Run the script using:
  '''
  ts-node scripts/transfer_from_moonbeam_to_relay.ts
  '''

---

## Drawbacks of the Moonbeam Approach
- **Non-Atomic Workflow**: Teleporting USDC to Moonbeam and calling the smart contract are separate steps. If the contract call fails, the user ends up with xUSDC on Moonbeam without explicitly requesting it.
- **Gas Fees in GLMR**: Users must maintain GLMR tokens for gas fees, adding complexity to the user experience.

---

## Resources
- [Moonbeam Documentation](https://docs.moonbeam.network/)
- [Moonbase Alpha Faucet](https://docs.moonbeam.network/builders/get-started/testnet/faucet/)
- [Polkadot.js](https://polkadot.js.org/apps/)
- [Moonscan Explorer](https://moonbase.moonscan.io/)