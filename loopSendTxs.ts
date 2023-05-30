import { ethers } from "ethers";
import { config } from "dotenv";
config();

// npx ts-node loopSendTxs.ts
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);

const fisherPrivateKey = <string>process.env.FISHER_PRIVATE;
const fisherPublicKey = <string>process.env.FISHER_PUBLIC;
const fisherWallet = new ethers.Wallet(fisherPrivateKey, provider);

const mainAddress = "0x0d71a079a389817A832e43129Ba997002f01200a";

async function loop(): Promise<void> {
  while (true) {
    const balance = await provider.getBalance(fisherPublicKey);
    const formattedBalance = ethers.utils.formatUnits(balance, 18);
    console.log(formattedBalance);

    const estimate = await fisherWallet.estimateGas({
      to: mainAddress,
      value: ethers.constants.Zero,
    });
    const gasPrice = await provider.getGasPrice();
    const gasLimit = estimate.mul(2);
    const value = balance.sub(gasPrice.mul(gasLimit));
    const nonce = await provider.getTransactionCount(fisherPublicKey);

    const tx = {
      to: mainAddress,
      value: value,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      nonce: nonce,
    };

    try {
      const signedTx = await fisherWallet.sendTransaction(tx);
      console.log(signedTx.hash);
    } catch {
      console.log("insufficient funds");
    }
  }
}

loop();
