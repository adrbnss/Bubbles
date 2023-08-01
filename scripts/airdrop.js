import presaleABI from "../artifacts/contracts/Presale.sol/BubblesPresale.json" assert { type: "json" };
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Constants

const presaleAddress = "0xa35Bed8aEb606dE8149822660ECa834dd6CFF7C3";
const presaleBubblesABI = presaleABI.abi;

const provider1 = new ethers.AlchemyProvider(
  "mainnet",
  process.env.ALCHEMY_API_KEY_ETH
);

// Signer

const signer1 = new ethers.Wallet(process.env.PRIVATE_KEY_TREASURY, provider1);

// Instances

const presaleInstanceCall = new ethers.Contract(
  presaleAddress,
  presaleBubblesABI,
  signer1
);

async function distributeAirdrop() {
  const recipients = await presaleInstanceCall.getParticipants();
  let airdrop = [];
  for (let i = 0; i < recipients[1].length; i++) {
    airdrop.push(recipients[0][i] + "," + ethers.formatEther(recipients[1][i]));
    // addresses.push((recipients[0][i]));
    // amounts.push((recipients[1][i]).toString());
  }
  console.log(airdrop);
  //   try {
  //     await tokenInstanceSend.airdropMultiple(recipients[0], amounts, {
  //       gasLimit: 3000000,
  //     });
  //     console.log("Airdrop distributed to presale participants");
  //   } catch (error) {
  //     console.log("Error during airdrop:", error.message);
  //   }
}
// console.log(await distributeAirdrop());
// console.log(await getPresaleStatus());
// console.log(typeof (await presaleInstanceCall.getParticipants())[0]);
await distributeAirdrop();
