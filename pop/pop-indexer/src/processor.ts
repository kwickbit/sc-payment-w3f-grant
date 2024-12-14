import {
    BlockHeader,
    DataHandlerContext,
    SubstrateBatchProcessor,
    SubstrateBatchProcessorFields,
    Event as _Event,
    Call as _Call,
    Extrinsic as _Extrinsic
} from '@subsquid/substrate-processor'

export const SS58_NETWORK = 'paseo';
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;
const RPC_ENDPOINT_URL = process.env.RPC_ENDPOINT_URL as string;
const BLOCK_NUMBER_START = parseInt(process.env.BLOCK_NUMBER_START as string);



export const processor = new SubstrateBatchProcessor()
    // Lookup archive by the network name in Subsquid registry
    // See https://docs.subsquid.io/substrate-indexing/supported-networks/
    // Chain RPC endpoint is required on Substrate for metadata and real-time updates
    .setRpcEndpoint({
        // Set via .env for local runs or via secrets when deploying to Subsquid Cloud
        // https://docs.subsquid.io/deploy-squid/env-variables/
        url: RPC_ENDPOINT_URL,
        // More RPC connection options at https://docs.subsquid.io/substrate-indexing/setup/general/#set-data-source
        rateLimit: 10
    })
    .addContractsContractEmitted({
        contractAddress: [CONTRACT_ADDRESS],
        extrinsic: true
    })
    .setFields({
        block: {
            timestamp: true
        },
        extrinsic: {
            hash: true
        },
        event: {
            index: true,
            callAddress: true,
            topics: true,
            name: true,
            origin: true,
        },
    })
    .addEvent({

    })
    .setBlockRange({
        // genesis block happens to not have a timestamp, so it's easier
        // to start from 1 in cases when the deployment height is unknown
        from: BLOCK_NUMBER_START,
    });

export type Fields = SubstrateBatchProcessorFields<typeof processor>;
export type Block = BlockHeader<Fields>;
export type Event = _Event<Fields>;
export type Call = _Call<Fields>;
export type Extrinsic = _Extrinsic<Fields>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;
