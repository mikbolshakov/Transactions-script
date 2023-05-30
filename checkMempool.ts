import { ethers } from "ethers";
import { config } from "dotenv";
config();
// npx ts-node checkMempool.ts
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
const providerWs = new ethers.providers.WebSocketProvider(<string>process.env.PROVIDER_WS);
const account = "0x0d71a079a389817A832e43129Ba997002f01200a".toLowerCase();

function watchTransactions() {
  console.log("Watching all pending transactions...");

  providerWs.on("pending", async (txHash: string) => {
    // console.log(`New pending transaction: ${txHash}`);
    try {
      let tx: any = await provider.getTransaction(txHash);

      if (tx !== null && tx.to !== undefined) {
        if (account === tx.to.toLowerCase()) {

          console.log({
            address: tx.from,
            value: ethers.utils.formatEther(tx.value),
            gasPrice: parseFloat(ethers.utils.formatUnits(tx.gasPrice, "gwei")).toFixed(2),
            gas: tx.gas,
            input: tx.input,
            timestamp: new Date(),
          });

        }
      }
    } catch (err) {
      console.error(err);
    }
  });
}

watchTransactions();
