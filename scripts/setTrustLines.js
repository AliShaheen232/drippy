const xrpl = require("xrpl");
const fs = require("fs");

async function setTrustLine() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  const issuerData = JSON.parse(fs.readFileSync("accounts/issuer.json"));
  const distData = JSON.parse(fs.readFileSync("accounts/distribution.json"));

  const issuerAddress = issuerData.address;
  const distWallet = xrpl.Wallet.fromSeed(distData.seed);

  const trustSetTx = {
    TransactionType: "TrustSet",
    Account: distWallet.classicAddress,
    LimitAmount: {
      currency: "DRIPPY",
      issuer: issuerAddress,
      value: "1000000"
    },
    Flags: xrpl.TrustSetFlags.tfSetNoRipple
  };

  const prepared = await client.autofill(trustSetTx);
  const signed = distWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log("Trust line status:", result.result.meta.TransactionResult);
  await client.disconnect();
}

setTrustLine();
