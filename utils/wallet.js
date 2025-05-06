import { Wallet } from "xrpl";
import { saveWallet, loadWallet } from "./storage.js";

export async function createOrLoadWallet(client, filename) {
  const saved = loadWallet(filename);
  if (saved) {
    return Wallet.fromSeed(saved.seed);
  }

  const { wallet } = await client.fundWallet();
  saveWallet(wallet, filename);
  return wallet;
}
