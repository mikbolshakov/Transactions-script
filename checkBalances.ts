import { ethers } from "ethers";
import { config } from "dotenv";
config();

// npx ts-node checkBalances.ts
const provider = new ethers.providers.JsonRpcProvider(
  process.env.PROVIDER_ETH_MAINNET
);

async function loop(): Promise<void> {
//   console.log("LFG!!!");
//   for (let i = 1000; i < 9998; i++) {
//     if (i % 1000 === 0) {
//       console.log(i);
//     }
    const privateKey = ``;
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    if (!balance.isZero()) {
      console.log("I FOUND IT! %s", privateKey);
    }
//   }
}

loop();