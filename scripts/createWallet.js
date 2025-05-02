const xrpl = require('xrpl');

async function createTestWallet() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const fundResult = await client.fundWallet();
  console.log('Wallet created:', fundResult.wallet.address);
  console.log('Secret:', fundResult.wallet.seed);

  await client.disconnect();
}

createTestWallet();
