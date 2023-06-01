import { ethers } from "ethers";
import ArbTokenDist from "./ABI/ArbitrumFoundationTokenDistributor.json"
import ArbToken from "./ABI/ArbitrumToken.json"
import ArbMulticall from "./ABI/ArbitrumL2Multicall.json"
import { config } from "dotenv";
config();
// npx ts-node checkMempool.ts
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);

let privateKeysArray = [
    // your private keys here
    "your_private_key",
    "and_another_private_key"
]
let destinationAddressesArray = [
    // destination addresses here
    // must be same length as private keys array
    "your_destination_address",
    "and_antoher_one",
]


let amountToClaim: any[] = [];
let currentNonce: any[] = [];

let claimContract = new ethers.Contract("0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9", ArbTokenDist);
let token = new ethers.Contract("0x912CE59144191C1204E64559FE8253a0e49E6548", ArbToken);
let multicall = new ethers.Contract("0x842eC2c7D803033Edf55E478F461FC547Bc54EB2", ArbMulticall, provider);

async function prepareToClaim() {
    for (let i = 0; i < privateKeysArray.length; i++) {
        let wallet = new ethers.Wallet(privateKeysArray[i], provider);  

        let current_nonce = await provider.getTransactionCount(wallet.address);
        let claimableAmount = await claimContract.connect(wallet).claimableTokens(wallet.address);
        amountToClaim.push(claimableAmount);
        currentNonce.push(current_nonce);
    }
}
async function sendClaim(prv_key, current_nonce, to_addr, claimableAmount) {
    let wallet = new ethers.Wallet(prv_key, provider);
    
    try {
        let claimTx = claimContract.connect(wallet).claim()
        console.log(await claimTx)
    } catch(error) {
        console.log("Error on claim occured. Wallet: ", wallet.address, error);
    }
    await new Promise(r => setTimeout(r, 30));
    try {
        let transferTx = token.connect(wallet).transfer(to_addr, claimableAmount);
        console.log(await transferTx)
    }  catch(error) {
        console.log("Error on transfer occured. Wallet: ", wallet.address, error);
    }
}

async function sendTransfer(prv_key, to_addr, claimableAmount) {
    let wallet = new ethers.Wallet(prv_key, provider);

    try {
        let transferTx = token.connect(wallet).transfer(to_addr, claimableAmount, {
            gasLimit: "2000000",// 5kk in case gas on L1 is expensive.. Read about arbitrums 2D fees to learn more
            gasPrice: "6000000000", // 1kkk = 1 gwei in case network is  overloaded
        // MAX GAS USED TO CLAIM = 0.005 eth ~= 9$
        });
        console.log(await transferTx)
    }  catch(error) {
        console.log("Error on transfer occured. Wallet: ", wallet.address, error);
    }
    
    
}
async function sendMeMoneyBitch() {
    for (let i = 0; i < privateKeysArray.length; i++) {
        if (amountToClaim[i] == 0) {
            let claimableAmount = await token.connect(wallet).balanceOf(wallet.address);
                console.log("tokens have been already claimed, transferring now")
            await sendTransfer(rpcArray[i % rpcArray.length], privateKeysArray[i], currentNonce[i], destinationAddressesArray[i % destinationAddressesArray.length], claimableAmount);
        } else {
        await sendClaim(rpcArray[i % rpcArray.length], privateKeysArray[i], currentNonce[i], destinationAddressesArray[i % destinationAddressesArray.length], amountToClaim[i]);
        console.log("tokens are not claimed yet, need to claim and transfer")
    }
    }
}
async function waitTs() {
    for (let i = 0; i >= 0; i++) {
        if(Date.now() >= 1679574000000) { // some time before claiming peroid
            for (let j = 0; j >= 0; j++) {
                let BN = await multicall.getL1BlockNumber();
                if ((BN).gte("16890400")) { // get L1BlockNumber from arbi
                    await sendMeMoneyBitch();
                    console.log("job's done. If no error was printed, everything completed");
                } else {
                    console.log(BN.toString())
                    console.log("block not synced");
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        }
    }
}

prepareToClaim();
waitTs();