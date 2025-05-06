import fs from "fs";
import path from "path";

const dataDir = "./data";

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

export function saveWallet(wallet, filename) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2));
}

export function loadWallet(filename) {
  const filePath = path.join(dataDir, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }
  return null;
}
