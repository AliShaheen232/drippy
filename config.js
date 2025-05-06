import dotenv from "dotenv";
dotenv.config();

// Network Configuration
export const XRPL_ENDPOINT = process.env.XRPL_ENDPOINT || "wss://s.altnet.rippletest.net:51233";
export const NETWORK_TYPE = process.env.NETWORK_TYPE || "testnet"; 

// Token Configuration
export const DOMAIN = process.env.DOMAIN || "example.com";
export const CURRENCY_CODE = process.env.CURRENCY_CODE || "DRP";
export const ISSUED_AMOUNT = process.env.ISSUED_AMOUNT || "1000000000";
export const TOKEN_DECIMALS = process.env.TOKEN_DECIMALS || 6;

// Operational Settings
export const TRANSACTION_TIMEOUT = parseInt(process.env.TRANSACTION_TIMEOUT || "15000");
export const DEFAULT_FEE = "12"; // Slightly higher fee for reliability
export const OPERATION_DELAY = 10000; // 10 seconds
export const MAX_RETRIES = 3;

// Network ID Mapping (for verification)
export const NETWORK_IDS = {
  mainnet: 0,
  testnet: 1,
  devnet: 2
};

// Validation
if (!["mainnet", "testnet", "devnet"].includes(NETWORK_TYPE)) {
  throw new Error(`Invalid NETWORK_TYPE: ${NETWORK_TYPE}. Must be mainnet/testnet/devnet`);
}

if (!CURRENCY_CODE.match(/^[A-Z0-9]{3}$/) && !CURRENCY_CODE.match(/^[A-F0-9]{40}$/)) {
  throw new Error("CURRENCY_CODE must be 3-character ISO or 40-character hex");
}