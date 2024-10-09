import {TypeormDatabase} from '@subsquid/typeorm-store'
import {ERC20PaymentReceived} from './model'
import * as KBPaymentProcessorABI from "./abi/KBPaymentProcessor"
import { Log, processor, PAYMENT_PROCESSOR_ADDRESS } from "./processor"

interface ERC20PaymentReceivedData {
    paymentId: string;
    token: string;
    amount: bigint;
    merchant: string;
    royaltyAmount: bigint
    from: string;
}


processor.run(new TypeormDatabase({supportHotBlocks: true}), 
    async (ctx) => {
        let events: ERC20PaymentReceivedData [] = []

        for (let block of ctx.blocks) {
            for (let log of block.logs) {
                if (log.topics[0] == KBPaymentProcessorABI.events.ERC20PaymentReceived.topic && log.address.toLowerCase() == PAYMENT_PROCESSOR_ADDRESS.toLowerCase()) {
                    // process data
                    let event = getKBPaymentData(log)
                    console.log("found event")
                    events.push(event)
                }
            }
        }
        
        let payments: ERC20PaymentReceived [] = events.map(a => new ERC20PaymentReceived({
            ...a,
            id: a.paymentId,
            timestamp: new Date()
        }))

        await ctx.store.save(payments)

})

function getKBPaymentData(log: Log): ERC20PaymentReceivedData {
    let event = KBPaymentProcessorABI.events.ERC20PaymentReceived.decode(log);
    return {
        paymentId: event.paymentId,
        token: event.token,
        amount: event.amount,
        merchant: event.merchant,
        royaltyAmount: event.royaltyAmount,
        from: log.transaction?.from || ""
    }
}