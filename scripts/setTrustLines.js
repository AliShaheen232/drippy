const xrpl = require("xrpl");
const fs = require("fs");

async function createTrustLine(receiverWalletSeed) {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  // Load receiver wallet
  const receiverWallet = xrpl.Wallet.fromSeed(receiverWalletSeed);

  // Prepare trust line transaction
  const tx = {
    TransactionType: "TrustSet",
    Account: receiverWallet.classicAddress,
    LimitAmount: {
      currency: "DRIPPY", // The token's ticker
      issuer: "issuer_wallet_address", // Issuer wallet address
      value: "1000000", // The amount the wallet is willing to hold
    },
    Flags: 131072, // Trust line flags
  };

  // Autofill the transaction
  const prepared = await client.autofill(tx);

  // Sign and submit the transaction
  const signed = receiverWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log("Trust Line Creation Result:", result);
  await client.disconnect();
}

// Example: createTrustLine('receiver_wallet_seed_here');
