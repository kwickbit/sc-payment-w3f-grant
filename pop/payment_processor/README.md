# Payment Processor Smart Contract

This is a non-custodial payment processor smart contract designed for the Polkadot ecosystem. It facilitates payments using assets on the Asset Hub Paseo network by leveraging XCM for cross-chain communication.

---

## Features
- Processes payments in stablecoins or other supported assets.
- Prevents duplicate payments using `payment_id` tracking.
- Off-chain indexer monitors and reacts to payment success or failure.
- Fully interoperable with Polkadot’s parachain ecosystem.

---

## Setup and Deployment

### Prerequisites
1. **Polkadot.js**: Create and mint your own assets on [Polkadot.js](https://polkadot.js.org/).
2. **Install `pop-cli`**: Follow the instructions [here](https://learn.onpop.io/cli/installing-pop-cli).
3. **Claim PAS Tokens**: Use [Polkadot Faucet](https://faucet.polkadot.io/) and transfer tokens to the Pop network using [Onboard](https://onboard.popnetwork.xyz/).

### Deployment Steps
1. Navigate to the `payment-processor` folder:
   '''
   cd payment-processor
   '''

2. Modify the `ASSET_ID` in the contract code:
    - Replace `ASSET_ID` with the ID of your created asset on Asset Hub Paseo.

3. Build the contract:
   '''
   pop build
   '''

4. Deploy the contract:
    - Use [contracts.onpop.io](https://contracts.onpop.io/contract/) to deploy the contract.

5. Fund the contract on Asset Hub:
    - Transfer funds to the contract address using [Polkadot.js.org](https://polkadot.js.org/) by clicking on `Transfer`.

6. Test the contract:
    - Call the `pay` method from [contracts.onpop.io](https://contracts.onpop.io/contract/):
        - **Parameters:**
            - `amount`: Amount to transfer.
            - `payment_id`: Random 32-byte hex string.

---

## Additional Notes
- Ensure you have PAS tokens on the Pop network for executing transactions.
- Tokens can be transferred from the relay chain to the Pop chain via [Onboard](https://onboard.popnetwork.xyz/).
- Use another address (not the contract owner) to test payments for realistic benchmarking.

---

## Resources
- [Polkadot Faucet](https://faucet.polkadot.io/)
- [Onboard PAS Tokens](https://onboard.popnetwork.xyz/)
- [Asset Minting Guide](https://polkadot.js.org/)
