// transactions.js
import { TrustSetFlags, AccountSetAsfFlags, AccountSetTfFlags } from "xrpl";
import { CURRENCY_CODE, DOMAIN, ISSUED_AMOUNT } from "../config.js";

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
    SetFlag: AccountSetAsfFlags.asfRequireAuth,  // Require trust line authorization
    Flags: AccountSetTfFlags.tfDisallowXRP,      // Don't receive XRP
  };

  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`Cold wallet AccountSet succeeded: https://testnet.xrpl.org/transactions/${signed.hash}`);
  } else {
    throw `Error sending AccountSet transaction: ${result.result.meta.TransactionResult}`;
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
  };

  const prepared = await client.autofill(tx);
  const signed = hotWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`Hot wallet AccountSet succeeded: https://testnet.xrpl.org/transactions/${signed.hash}`);
  } else {
    throw `Error sending hot AccountSet transaction: ${result.result.meta.TransactionResult}`;
  }
}

// ----------------------------------------------------------------------------------------
// Authorize the trust line from hot to cold
export async function authorizeTrustLine(client, hotWallet, coldWallet) {
  const tx = {
    TransactionType: "TrustSet",
    Account: hotWallet.address,
    LimitAmount: {
      currency: CURRENCY_CODE,
      issuer: coldWallet.address,
      value: "0"
    },
    Flags: 2147483648
  };

  const prepared = await client.autofill(tx);
  const signed = hotWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`Trust line authorization succeeded: https://testnet.xrpl.org/transactions/${signed.hash}`);
  } else {
    throw `Error authorizing trust line: ${result.result.meta.TransactionResult}`;
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
      value: (ISSUED_AMOUNT * 2).toString(),
    },
  };

  const prepared = await client.autofill(tx);
  const signed = hotWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`Trust line created: https://testnet.xrpl.org/transactions/${signed.hash}`);
  } else {
    throw `Error creating trust line: ${result.result.meta.TransactionResult}`;
  }
}

// ----------------------------------------------------------------------------------------
// Issue token from cold to hot wallet
export async function issueToken(client, coldWallet, hotWallet) {
  const tx = {
    TransactionType: "Payment",
    Account: coldWallet.address,
    Destination: hotWallet.address,
    Amount: {
      currency: CURRENCY_CODE,
      value: ISSUED_AMOUNT.toString(), // Use ISSUED_AMOUNT directly as a string
      issuer: coldWallet.address
    },
     DestinationTag: 1, //hotWallet requires a DestinationTag
  };

  const prepared = await client.autofill(tx);
  const signed = coldWallet.sign(prepared);

  console.log(`Issuing ${ISSUED_AMOUNT} ${CURRENCY_CODE} to hot wallet...`);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`Token issued: https://testnet.xrpl.org/transactions/${signed.hash}`);
  } else {
    throw `Error issuing token: ${result.result.meta.TransactionResult}`;
  }
}

// ----------------------------------------------------------------------------------------
// Get gateway balances (issuer perspective)
export async function getGatewayBalances(client, coldWallet, hotWallet) {
  console.log("Fetching trust lines for hot wallet...");
  const hot_balances = await client.request({
    command: "account_lines",
    account: hotWallet.address,
    ledger_index: "validated"
  });
  console.log("Hot Wallet Trust Lines:", hot_balances.result);

  console.log("Fetching issued balances from cold wallet...");
  const response = await client.request({
    command: "gateway_balances",
    account: coldWallet.address,
    hotwallet: [hotWallet.address],
    ledger_index: "validated"
  });
  console.log("Cold Wallet Gateway Balances:", JSON.stringify(response.result, null, 2));

  return response.result;
}
