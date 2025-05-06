import { Client } from "xrpl";
import { XRPL_ENDPOINT, NETWORK_TYPE } from "../config.js";

// Network verification function
async function checkNetwork(client) {
  try {
    const net = await client.getNetworkID();
    if (NETWORK_TYPE === 'testnet' && net !== 1) {
      throw new Error(`Connected to network ID ${net} but expected testnet (ID 1)`);
    }
    if (NETWORK_TYPE === 'mainnet' && net !== 0) {
      throw new Error(`Connected to network ID ${net} but expected mainnet (ID 0)`);
    }
    if (NETWORK_TYPE === 'devnet' && net !== 2) {
      throw new Error(`Connected to network ID ${net} but expected devnet (ID 2)`);
    }
  } catch (err) {
    console.error("Network verification failed:", err.message);
    throw err;
  }
}

export async function connectClient() {
  const client = new Client(XRPL_ENDPOINT);
  await client.connect();
  
  // Add network verification right after connecting
  // await checkNetwork(client);
  
  return client;
}
