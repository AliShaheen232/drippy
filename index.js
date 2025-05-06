import { connectClient } from "./utils/xrplClient.js";
import { createOrLoadWallet } from "./utils/wallet.js";
import {
  setAccountFlags,
  createTrustLine,
  issueToken,
  getGatewayBalances,
  setHotAccountFlags,
} from "./utils/transactions.js";

async function main() {
  const client = await connectClient();
  console.log("✅ Connected to XRPL Testnet");

  try {
    // Load existing wallets or create new ones
    const coldWallet = await createOrLoadWallet(client, "issuer.json");
    const hotWallet = await createOrLoadWallet(client, "distributor.json");

    console.log(`🧊 Cold wallet (Issuer): ${coldWallet.address}`);
    console.log(`🔥 Hot wallet (Distributor): ${hotWallet.address}`);

    // Check balances
    const coldBalance = await client.getXrpBalance(coldWallet.address);
    const hotBalance = await client.getXrpBalance(hotWallet.address);
    console.log("💰 Cold wallet balance:", coldBalance);
    console.log("💰 Hot wallet balance:", hotBalance);

    // Set account flags (once)
    await setAccountFlags(client, coldWallet);
    console.log("🧊🔧 Cold wallet flags set");
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    await setHotAccountFlags(client, coldWallet, hotWallet); // ✅ Fixed argument
    console.log("🔥🔧 Hot wallet flags set");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Establish trustline
    await createTrustLine(client, hotWallet, coldWallet);
    console.log("🔗 Trust line created");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("🔐 Authorizing trust line...");
    await authorizeTrustLine(client, hotWallet, coldWallet);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Verify authorization
    const lines = await client.request({
      command: "account_lines",
      account: hotWallet.address,
      peer: coldWallet.address,
      ledger_index: "validated"
    });
    
    const drpLine = lines.result.lines.find(l => l.currency === CURRENCY_CODE);
    if (!drpLine?.authorized) {
      throw new Error("Trust line authorization failed");
    }
    console.log("✅ Trust line properly authorized");
    
    // Issue token
    await issueToken(client, coldWallet, hotWallet);
    console.log("💸 Token issued to distributor");

    // View balances
    const balances = await getGatewayBalances(client, coldWallet, hotWallet);
    console.log("📊 Gateway balances:\n", JSON.stringify(balances, null, 2));
  } catch (err) {
    console.error("❌ Error:", err?.message || err);
  } finally {
    await client.disconnect();
    console.log("🔌 Disconnected from XRPL");
  }
}

main();
