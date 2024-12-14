# Pop Indexer

The Pop Indexer is an off-chain service designed to monitor `MessageQueue.Processed` events on the Pop Network. It facilitates the validation of payment statuses by reacting to on-chain events and triggering necessary follow-up actions.

---

## Features
- Listens for `MessageQueue.Processed` events.
- Extracts `payment_id` topics from events for off-chain processing.
- Publishes business events for calling `callback_success` or `callback_fail` on-chain.

---

## Setup and Running the Indexer

### Prerequisites
1. **Docker**: Ensure Docker is installed on your system.
2. **PostgreSQL**: Default DB port is `5432`.

---

### Configuration
1. Create a `.env` file in the `pop-indexer` directory with the following variables:
   '''
   CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
   DB_PORT=5432
   GATEWAY_URL=https://v2.archive.subsquid.io/network/asset-hub-paseo
   RPC_ENDPOINT_URL=wss://asset-hub-paseo-rpc.dwellir.com
   BLOCK_NUMBER_START=<RECENT_BLOCK_NUMBER>
   '''

2. Replace `<DEPLOYED_CONTRACT_ADDRESS>` with the address of your deployed smart contract.

3. Set `<RECENT_BLOCK_NUMBER>` to a recent block height for the indexer to start monitoring.

---

### Running the Indexer
1. Build and start the indexer using Docker Compose:
   '''
   docker-compose up --build
   '''

---

## Notes
- Ensure the smart contract address (`CONTRACT_ADDRESS`) is correct.
- Indexer requires access to a PostgreSQL database on port `5432`.

---

## Resources
- [Subsquid Gateway](https://v2.archive.subsquid.io/network/asset-hub-paseo)
- [RPC Endpoint](https://asset-hub-paseo-rpc.dwellir.com)
