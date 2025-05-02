const xrpl = require("xrpl");
const fs = require("fs");

require("dotenv").config();

(async () => {
  const client = new xrpl.Client("https://s.altnet.rippletest.net:51234");
  await client.connect();
  const wallet = xrpl.Wallet.generate();
  fs.writeFileSync("accounts/issuer.json", JSON.stringify(wallet, null, 2));
  console.log("Issuer wallet created:", wallet.address);
  await client.disconnect();
})();