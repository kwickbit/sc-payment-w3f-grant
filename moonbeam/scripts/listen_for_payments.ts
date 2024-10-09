import { request, gql } from 'graphql-request';
import { createClient } from 'graphql-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import WebSocket from 'ws'; // Import the WebSocket polyfill

const wsEndpoint = 'ws://localhost:4350/graphql'; // Change this to your actual Subsquid GraphQL endpoint

const port = process.env.GQL_PORT || 4350
const host = process.env.GQL_HOST || 'localhost'
const proto = process.env.GQL_PROTO || 'ws'

const client = createClient({
  webSocketImpl: WebSocket,
  url: `${proto}://${host}:${port}/graphql`,
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

