import { request, gql } from 'graphql-request';

const endpoint = 'http://localhost:4350/graphql'; // Change this to your actual Subsquid GraphQL endpoint

// Define the GraphQL query to fetch ERC20PaymentReceived events
const query = gql`
  {
    erc20PaymentReceiveds(orderBy: id_DESC, limit: 10) {
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
`;

// Set to keep track of the latest event IDs to avoid duplicates
let processedEvents = new Set<string>();
const now = new Date()
// Function to fetch and process events
const fetchEvents = async () => {
  try {
    const data = (await request(endpoint, query) as any);

    const events = data.erc20PaymentReceiveds;
    if (events && events.length) {
      events.forEach((event: any) => {
        // Check if the event has already been processed
        if (!processedEvents.has(event.id)) {
          if ((new Date(event.timestamp)).getTime() > now.getTime()) {
            console.log('New Payment Received:');
            console.log(`Payment ID: ${event.paymentId}`);
            console.log(`From: ${event.from}`);
            console.log(`Amount: ${event.amount}`);
            console.log(`Merchant: ${event.merchant}`);
            console.log(`Royalty Amount: ${event.royaltyAmount}`);
            console.log('---------------------------');

          }

          // Mark the event as processed
          processedEvents.add(event.id);
        }
      });
    }
    else {
        console.log('No new events')
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Poll the API every 3 seconds
const pollInterval = 3000; // 3 seconds

setInterval(fetchEvents, pollInterval);

// Initial fetch
fetchEvents();