const xrpl = require("xrpl");
const fs = require("fs");

async function issueToken() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  const issuerData = JSON.parse(fs.readFileSync("accounts/issuer.json"));
  const distData = JSON.parse(fs.readFileSync("accounts/distribution.json"));

  const issuerWallet = xrpl.Wallet.fromSeed(issuerData.seed);

  const sendTokenTx = {
    TransactionType: "Payment",
    Account: issuerWallet.classicAddress,
    Destination: distData.address,
    Amount: {
      currency: "DRIPPY",
      value: "5890000000", //5.89 billion
      issuer: issuerWallet.classicAddress
    }
  };

  const prepared = await client.autofill(sendTokenTx);
  const signed = issuerWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log("Token issued:", result.result.meta.TransactionResult);
  await client.disconnect();
}

issueToken();
