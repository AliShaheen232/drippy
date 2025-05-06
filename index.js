import { CURRENCY_CODE } from "./config.js";
import { connectClient } from "./utils/xrplClient.js";
import { createOrLoadWallet } from "./utils/wallet.js";
import {
  setAccountFlags,
  createTrustLine,
  issueToken,
  getGatewayBalances,
  setHotAccountFlags,
  authorizeTrustLine,
  checkTrustLineAuthorization,
  modifyTrustLine
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

    await setHotAccountFlags(client, hotWallet); // ✅ Fixed argument
    console.log("🔥🔧 Hot wallet flags set");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Establish trustline
    await createTrustLine(client, hotWallet, coldWallet);
    console.log("🔗 Trust line created");
    await new Promise((resolve) => setTimeout(resolve, 5000));

// Replace the authorization flow with this:
try {
  console.log("🔐 Attempting to authorize trust line...");
  await authorizeTrustLine(client, hotWallet, coldWallet);
  
  // Verification
  const isAuthorized = await checkTrustLineAuthorization(client, hotWallet, coldWallet);
  if (!isAuthorized) {
    console.log("⚠️ Trust line shows as unauthorized but tefNO_AUTH_REQUIRED suggests it's already authorized");
    console.log("ℹ️ Proceeding with token issuance");
  }
} catch (err) {
  if (err.message && err.message.includes('tefNO_AUTH_REQUIRED')) {
    console.log("ℹ️ Trust line already authorized - proceeding");
  } else {
    console.error("❌ Authorization error:", err);
    throw err;
  }
}

// Add this verification step
const finalCheck = await client.request({
  command: "account_lines",
  account: hotWallet.address,
  peer: coldWallet.address,
  ledger_index: "validated"
});

console.log("Final trust line check:", JSON.stringify(finalCheck.result, null, 2));

const drpLine = finalCheck.result.lines.find(l => l.currency === CURRENCY_CODE);
if (!drpLine) {
  throw new Error("Trust line missing - cannot issue tokens");
}

// If no_ripple_peer is true, we need to modify it
if (drpLine.no_ripple_peer) {
  console.log("⚠️ Disabling no_ripple_peer flag...");
  await modifyTrustLine(client, hotWallet, coldWallet, {
    no_ripple_peer: false
  });
  await new Promise(resolve => setTimeout(resolve, 15000));
}
    
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
