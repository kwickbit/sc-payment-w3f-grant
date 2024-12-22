import { createClient } from 'graphql-ws';
import WebSocket from 'ws'; // Import the WebSocket polyfill
const wsEndpoint = process.env.WS_ENDPOINT ?? 'ws://0b342a1b-0dbc-421a-afd4-cf9a847a479b.squids.live/kb-payment-sqd/v/v1/graphql'; // Change this to your actual Subsquid GraphQL endpoint
``
const client = createClient({
  webSocketImpl: WebSocket,
  url: wsEndpoint,
});

client.subscribe(
  {
    query: `
    subscription {
        erc20PaymentReceiveds(limit: 1, orderBy: timestamp_DESC) {
          id
          token
          from
          amount
          paymentId
          merchant
          royaltyAmount
          timestamp
      }
    }  
    `,
  },
  {
    next: (data) => {
      console.log(`New transfers: ${JSON.stringify(data)}\n`);
    },
    error: (error) => {
      console.error('error', error);
    },
    complete: () => {
      console.log('done!');
    },
  }
);

