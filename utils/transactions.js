import { TrustSetFlags, AccountSetAsfFlags, AccountSetTfFlags } from "xrpl";
import { CURRENCY_CODE, DOMAIN, ISSUED_AMOUNT } from "../config.js";

// Transaction flag constants
const tfFullyCanonicalSig = 2147483648 //0x80000000 ;

// Helper to encode domain to hex
const hexEncodeDomain = (domain) =>
  Buffer.from(domain, "utf8").toString("hex").toUpperCase();

// ----------------------------------------------------------------------------------------
// Set flags for the cold wallet (issuer)
export async function setAccountFlags(client, wallet) {
  const tx = {
    TransactionType: "AccountSet",
    Account: wallet.address,
    TransferRate: 0,
    TickSize: 5,
    Domain: hexEncodeDomain(DOMAIN),
    SetFlag: AccountSetAsfFlags.asfRequireAuth,
    Flags: AccountSetTfFlags.tfDisallowXRP,
    LastLedgerSequence: null
  };

  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`✅ Cold wallet flags set: https://testnet.xrpl.org/transactions/${signed.hash}`);
  } else {
    throw `Error setting cold wallet flags: ${result.result.meta.TransactionResult}`;
  }
}

// ----------------------------------------------------------------------------------------
// Set flags for the hot wallet (recipient)
export async function setHotAccountFlags(client, hotWallet) {
  const tx = {
    TransactionType: "AccountSet",
    Account: hotWallet.address,
    SetFlag: AccountSetAsfFlags.asfRequireAuth,
    Flags: AccountSetTfFlags.tfDisallowXRP | AccountSetTfFlags.tfRequireDestTag,
    Domain: hexEncodeDomain(DOMAIN),
    LastLedgerSequence: null
  };

  const prepared = await client.autofill(tx);
  const signed = hotWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`✅ Hot wallet flags set: https://testnet.xrpl.org/transactions/${signed.hash}`);
  } else if (result.result.meta.TransactionResult === "tecOWNERS") {
    console.log("ℹ️ Hot wallet flags already set");
  } else {
    throw `Error setting hot wallet flags: ${result.result.meta.TransactionResult}`;
  }
}

// ----------------------------------------------------------------------------------------
// Check trust line authorization status
export async function checkTrustLineAuthorization(client, hotWallet, coldWallet) {
  const lines = await client.request({
    command: "account_lines",
    account: hotWallet.address,
    peer: coldWallet.address,
    ledger_index: "validated"
  });
  return lines.result.lines.some(l => 
    l.currency === CURRENCY_CODE && l.authorized
  );
}

// ----------------------------------------------------------------------------------------
// Authorize the trust line from hot to cold
export async function authorizeTrustLine(client, hotWallet, coldWallet) {
  // First check current status
  const isAuthorized = await checkTrustLineAuthorization(client, hotWallet, coldWallet);
  if (isAuthorized) {
    console.log("ℹ️ Trust line already authorized - skipping");
    return;
  }

  const tx = {
    TransactionType: "TrustSet",
    Account: hotWallet.address,
    LimitAmount: {
      currency: CURRENCY_CODE,
      issuer: coldWallet.address,
      value: "0"
    },
    Flags: TrustSetFlags.tfSetfAuth, // Use only the auth flag
    LastLedgerSequence: null,
    Fee: "15"
  };

  try {
    const prepared = await client.autofill(tx);
    delete prepared.LastLedgerSequence;
    
    const signed = hotWallet.sign(prepared);
    const prelim = await client.submit(signed.tx_blob);

    if (prelim.result.engine_result === "tesSUCCESS") {
      console.log("✅ Trust line authorization submitted");
      await new Promise(resolve => setTimeout(resolve, 15000));
    } else if (prelim.result.engine_result === "tefNO_AUTH_REQUIRED") {
      console.log("ℹ️ Authorization not required - proceeding");
    } else {
      throw new Error(`Authorization failed: ${prelim.result.engine_result}`);
    }
  } catch (err) {
    console.error("❌ Authorization error:", err.message);
    throw err;
  }
}

// ----------------------------------------------------------------------------------------
// Create trust line from hot to cold
export async function createTrustLine(client, hotWallet, coldWallet) {
  const tx = {
    TransactionType: "TrustSet",
    Account: hotWallet.address,
    LimitAmount: {
      currency: CURRENCY_CODE,
      issuer: coldWallet.address,
      value: (ISSUED_AMOUNT * 2).toString()
    },
    LastLedgerSequence: null
  };

  const prepared = await client.autofill(tx);
  const signed = hotWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`✅ Trust line created: https://testnet.xrpl.org/transactions/${signed.hash}`);
  } else {
    throw `Error creating trust line: ${result.result.meta.TransactionResult}`;
  }
}

// ----------------------------------------------------------------------------------------
// Issue token from cold to hot wallet
export async function issueToken(client, coldWallet, hotWallet) {
  // Verify trust line status one more time
  const lines = await client.request({
    command: "account_lines",
    account: hotWallet.address,
    peer: coldWallet.address,
    ledger_index: "validated"
  });
  
  const line = lines.result.lines.find(l => l.currency === CURRENCY_CODE);
  if (!line) {
    throw new Error("Trust line does not exist");
  }

  console.log("Trust line status:", JSON.stringify(line, null, 2));

  const tx = {
    TransactionType: "Payment",
    Account: coldWallet.address,
    Destination: hotWallet.address,
    Amount: {
      currency: CURRENCY_CODE,
      value: ISSUED_AMOUNT.toString(),
      issuer: coldWallet.address
    },
    Flags: tfFullyCanonicalSig,
    LastLedgerSequence: null,
    Fee: "15"
  };

  const prepared = await client.autofill(tx);
  const signed = coldWallet.sign(prepared);

  console.log(`💸 Attempting to issue ${ISSUED_AMOUNT} ${CURRENCY_CODE}...`);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`✅ Tokens issued: ${signed.hash}`);
  } else {
    throw `Token issuance failed: ${result.result.meta.TransactionResult}`;
  }
}

// ----------------------------------------------------------------------------------------
//Modify trust lines
export async function modifyTrustLine(client, wallet, issuer, modifications) {
  const tx = {
    TransactionType: "TrustSet",
    Account: wallet.address,
    LimitAmount: {
      currency: CURRENCY_CODE,
      issuer: issuer.address,
      value: (ISSUED_AMOUNT * 2).toString()
    },
    Flags: modifications.no_ripple_peer === false ? 0 : TrustSetFlags.tfSetNoRipple
  };

  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`✅ Trust line modified: ${signed.hash}`);
  } else {
    throw `Error modifying trust line: ${result.result.meta.TransactionResult}`;
  }
}

// ----------------------------------------------------------------------------------------
// Get gateway balances (issuer perspective)
export async function getGatewayBalances(client, coldWallet, hotWallet) {
  const [hotBalances, gatewayBalances] = await Promise.all([
    client.request({
      command: "account_lines",
      account: hotWallet.address,
      ledger_index: "validated"
    }),
    client.request({
      command: "gateway_balances",
      account: coldWallet.address,
      hotwallet: [hotWallet.address],
      ledger_index: "validated"
    })
  ]);

  return {
    hotWallet: hotBalances.result,
    coldWallet: gatewayBalances.result
  };
}