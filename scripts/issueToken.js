const xrpl = require("xrpl");
const fs = require("fs");

(async () => {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233"); // Use WebSocket
  await client.connect();

  const issuerWallet = xrpl.Wallet.fromSeed(JSON.parse(fs.readFileSync("accounts/issuer.json")).seed);

  const tx = {
    TransactionType: "Payment",
    Account: issuerWallet.classicAddress,
    Destination: issuerWallet.classicAddress, // Sending to self
    Amount: {
      currency: "DRIPPY",
      value: "5890000000", // 5.89 billion DRIPPY
      issuer: issuerWallet.classicAddress
    }
  };

  const prepared = await client.autofill(tx);
  const signed = issuerWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log("Token Issuance Result:", result);

  await client.disconnect();
})();
