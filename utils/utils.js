// utils.js
import { AccountSetAsfFlags, AccountSetTfFlags } from "xrpl";

export const hexEncodeDomain = (domain) => Buffer.from(domain).toString("hex");

export async function submitTransaction(client, tx, wallet, description) {
  try {
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    console.log(`\u2705 ${description} transaction result:`, result.result.meta.TransactionResult);

    return {
      ...result.result,
      fakeSuccess: result.result.meta.TransactionResult === "tesSUCCESS"
    };
  } catch (err) {
    console.error(`\u274c Error in ${description}:`, err.message);
    throw err;
  }
}

export { AccountSetAsfFlags, AccountSetTfFlags };
