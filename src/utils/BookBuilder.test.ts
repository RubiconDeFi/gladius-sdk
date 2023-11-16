import BookBuilder from './BookBuilder'; // Adjust the import path as needed

describe('BookBuilder Integration Tests', () => {
  let bookBuilder: BookBuilder;

  beforeAll(() => {
    // Initialize with actual config
    bookBuilder = new BookBuilder({
      chainID: 10,
      assetAddress: '0x4200000000000000000000000000000000000006',
      quoteAddress: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      gladiusUrl: 'https://gladius-staging.rubicon.finance/',
      rpcUrl: 'https://rpc.ankr.com/optimism',
      gladiusPollTime: 500, // Optional, can be adjusted
      expirationPadding: 0, // Optional, can be adjusted
    });
  });

  test('getOffers fetches data from live API', async () => {
    const data = await bookBuilder.getOffers();
    // console.log("this data from getOffers", data);
    // const exampleBid = data.bids.orders[0];
    // console.log("this is an exmaple bid", exampleBid);
    // console.log("this is an example bid input", exampleBid.input);
    // console.log("this is an example bid output", exampleBid.outputs);
    
    // console.log("these inputs order 0", data.orders[0].input);
    // console.log('these outputs order 0', data.orders[0].outputs);
    // console.log('these input order 1', data.orders[1].input);
    // console.log('these outputs order 1', data.orders[1].outputs);
    
    expect(data).toBeDefined();
    expect(data).toHaveProperty('asks.orders');
    expect(data).toHaveProperty('bids.orders');

    // Further assertions can be added based on the expected structure of data
  });

  test('listenToGladiusBook updates the book', async () => {
    // Call the method and then wait for a short duration to allow the update
    jest.setTimeout(3000); // Set timeout to 3 seconds for this test
    // bookBuilder.listenToGladiusBook();

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 2 seconds

    const book = bookBuilder.getBook();

    expect(bookBuilder).toHaveProperty('book');
    expect(book).toHaveProperty('asks');
    expect(book).toHaveProperty('bids');

    // console.log("this is the book", book);
    
    expect(book.asks.length).toBeGreaterThanOrEqual(1);
    expect(book.bids.length).toBeGreaterThanOrEqual(1);
    // Further assertions can be added based on the expected structure of the book

  });


  test('queryMarketBuy calculates correct asset purchase and returns encoded orders', () => {
    const quoteToSpend = 3000;
    const expectedAssetAmount = 2.5;

    const result = bookBuilder.queryMarketBuy(quoteToSpend);

    // console.log("Market Buy Result:", result);
    
    expect(result.assetPurchased).toBeGreaterThan(0);
    expect(result.assetPurchased).toBeLessThan(expectedAssetAmount);
    expect(result.orders).toBeDefined();
    expect(result.orders.length).toBeGreaterThanOrEqual(1); // Check if at least one order is returned
});

test('queryMarketSell calculates correct quote received and returns encoded orders', () => {
    const assetToSell = 2;
    const expectedQuoteAmount = 4000;

    const result = bookBuilder.queryMarketSell(assetToSell);

    // console.log("Market Sell Result:", result);
    
    expect(result.quoteReceived).toBeGreaterThan(0);
    expect(result.quoteReceived).toBeLessThan(expectedQuoteAmount);
    expect(result.orders).toBeDefined();
    expect(result.orders.length).toBeGreaterThanOrEqual(1); // Check if at least one order is returned
});

  // Additional tests...
});
