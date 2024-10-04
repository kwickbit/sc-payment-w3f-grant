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

#### Install Subsquid CLI
```
npm i -g @subsquid/cli@latest
```

#### Start Indexer Service
```
npm run indexer 
```
#### Listen to Indexer
```
npm run listen
```
#### Sign and Submit Payment
```
npm run sign
```


## Benchmarks
### Moonbeam 

- Transferring from Relay Chain To Moonbase: TBD

- Transferring from Moonbase to Relay Chain: TBD

- Approving XC-20 Transfer: ~25s

- Submitting Payment: ~25s

- Indexer: ~1-3s

## Contributing

If you would like to contribute to this project or add additional benchmarks, feel free to open a pull request. Make sure to follow the repository's contribution guidelines.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
