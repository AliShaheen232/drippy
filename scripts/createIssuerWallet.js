const xrpl = require("xrpl");
const fs = require("fs");

// import xrpl from 'xrpl';
// import fs from 'fs';


async function createWallets() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  const issuer = (await client.fundWallet()).wallet;
  const distribution = (await client.fundWallet()).wallet;

  fs.writeFileSync("accounts/issuer.json", JSON.stringify({
    address: issuer.classicAddress,
    seed: issuer.seed
  }, null, 2));

  fs.writeFileSync("accounts/distribution.json", JSON.stringify({
    address: distribution.classicAddress,
    seed: distribution.seed
  }, null, 2));

  console.log("Issuer Wallet:", issuer.classicAddress);
  console.log("Distribution Wallet:", distribution.classicAddress);

  await client.disconnect();
}

createWallets();

import { Client, Wallet } from "xrpl";
import fs from "fs/promises";

const client = new Client("wss://s.altnet.rippletest.net:51233");

async function createWallets() {
  console.log("Connecting to XRPL Testnet...");
  await client.connect();

  const fundResult = await client.fundWallet();
  const wallet = fundResult.wallet;

  console.log("Issuer Wallet Funded:\n", wallet);

  const data = {
    classicAddress: wallet.classicAddress,
    seed: wallet.seed,
  };

  await fs.writeFile("accounts/issuer.json", JSON.stringify(data, null, 2));
  console.log("✅ Issuer wallet saved to accounts/issuer.json");

  await client.disconnect();
}

createWallets();

