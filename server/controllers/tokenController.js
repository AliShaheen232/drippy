const xrpl = require('xrpl');
const Token = require('../models/Token'); // Import Token model

// Function to issue a token on XRPL and save token details in MongoDB
const issueToken = async (issuerWalletSeed, tokenData) => {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const issuerWallet = xrpl.Wallet.fromSeed(issuerWalletSeed);

  const tx = {
    TransactionType: 'Payment',
    Account: issuerWallet.classicAddress,
    Amount: tokenData.amount, // Adjust this according to the amount needed
    Destination: issuerWallet.classicAddress,
    Flags: 0x80000000,
  };

  const prepared = await client.autofill(tx);
  const signed = issuerWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);
  console.log('Token Issuance Result:', result);

  // Save token details in MongoDB
  const newToken = new Token({
    name: tokenData.name,
    ticker: tokenData.ticker,
    supply: tokenData.supply,
    issuer: issuerWallet.classicAddress,
  });

  await newToken.save(); // Save to database

  await client.disconnect();
  return newToken; // Return token details
};

module.exports = { issueToken };
