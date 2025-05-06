const xrpl = require("xrpl");
const fs = require("fs");

async function checkBalance() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  const distData = JSON.parse(fs.readFileSync("accounts/distribution.json"));
  const account = distData.address;

  const response = await client.request({
    command: "account_lines",
    account
  });

  console.log("Balances:", response.result.lines);
  await client.disconnect();
}

checkBalance();
