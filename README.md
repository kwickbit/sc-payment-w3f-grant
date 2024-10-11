# Polkadot Ecosystem Smart Contract Solutions Benchmark

## Overview

This repository contains a benchmark of various smart contract solutions within the Polkadot ecosystem. It aims to evaluate the performance, flexibility, and features of different platforms within the Polkadot network, helping developers understand the advantages of each solution.

## Smart Contract Platforms Benchmarked

### 1. **Moonbeam**

Moonbeam is a smart contract platform within the Polkadot ecosystem that provides full Ethereum compatibility. It is a parachain that enables developers to deploy existing Ethereum-based smart contracts with minimal changes.

**Key Features of Moonbeam:**

- **Full Ethereum Compatibility**: Moonbeam supports Solidity smart contracts, allowing Ethereum projects to be ported easily.
- **Integration with Polkadot**: As a Polkadot parachain, Moonbeam benefits from Polkadot's shared security and cross-chain interoperability.
- **Ethereum Tools**: Developers can use popular Ethereum tools like Remix, Truffle, and Hardhat.
- **Native Token Support**: Moonbeam supports XC-20 tokens, which are interoperable across the Polkadot ecosystem.
- **EVM-Compatible**: It provides a full EVM implementation, enabling the use of Ethereum-based decentralized applications (dApps).

For detailed information about the Moonbeam implementation, benchmarks, and usage, refer to the [Moonbeam folder](moonbeam/README.md).

## Purpose of the Benchmark

The goal of this repository is to evaluate and compare the performance of different smart contract platforms in the Polkadot ecosystem. We look into:

- **Execution speed**
- **Gas costs**
- **Scalability**
- **Developer experience**
- **Cross-chain interoperability**
- **User experience for seamless invoice payments on-chain**

## How to Use This Repository

### Prerequisites

- Subsquid
- Node
- Docker

### Install Subsquid CLI

```
npm i -g @subsquid/cli@latest
```

## Running Moonbeam Demo

```
cd moonbeam
```

### Start Local Indexer

To prevent the indexer from starting at genesis, visit https://moonbase.moonscan.io/ to get the latest block, then put it in `BLOCK_START_HEIGHT` envvar under `.env` under ``/moonbeam-indexer``. Return to `/moonbeam` directory then in each separate terminal run the following commands:

```
npm run indexer 
```

You may also use the deployed endpoint instead: `ws://0b342a1b-0dbc-421a-afd4-cf9a847a479b.squids.live/kb-payment-sqd/v/v1/graphql`

### Listen to Indexer

To subscribe to new **erc_20_payment_received** events, specify `WS_ENDPOINT` in .env to either your local  or the default deployed endpoint. Then run:

```
npm run listen
```

### Sign and Submit Payment

To submit a payment run

```
npm run sign
```

## Benchmarks

### Moonbeam

On Moonbeam mainnet avg gas cost: 125 gwei

- Transferring from Relay Chain To Moonbase: TBD
- Transferring from Moonbase to Relay Chain: TBD
- Approving XC-20 Transfer: ~25s (gas / weight: 130,304 units) ~
  - 130,304 units * 125 gwei = 16288000 gwei = 0.016288 $GLMR
- Submitting Payment: ~25s (gas / weight: 343,830 units) ~
  - 343,830 units * 125 gwei = 42978750 gwei = 0.0429 $GLMR
- Indexer: ~1-3s

## Contributing

If you would like to contribute to this project or add additional benchmarks, feel free to open a pull request. Make sure to follow the repository's contribution guidelines.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
