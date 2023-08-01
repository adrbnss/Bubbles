// // This is a script to implement with a echoes token contract, it will switch the mode of the contract every 45 minutes for ape and ngmi mode, and every 75 minutes for chill mode.
// It is better to run this script on a server.
// It is wise to secure the private key of the treasury account, and to withdraw ETH from this account regularly.

// Imports
import { ethers } from "ethers";
import tokenABI from "../artifacts/contracts/EchoeToken.sol/Bubbles.json" assert { type: "json" };
import dotenv from "dotenv";
dotenv.config();

// Constants
const tokenAddress = "0xd1D250E0432ea77eA72Fb8D56897Ad2c45330e90"; // To define after token deployment
const BubblesABI = tokenABI.abi; // To define after token compilation

const provider = new ethers.AlchemyProvider(
  "mainnet",
  process.env.ALCHEMY_API_KEY_ETH
);

// Signer
const signer = new ethers.Wallet(process.env.PRIVATE_KEY_TREASURY, provider);

// Instances
const tokenInstanceCall = new ethers.Contract(
  tokenAddress,
  BubblesABI,
  provider
);

const tokenInstanceSend = new ethers.Contract(tokenAddress, BubblesABI, signer);

//---------------------------------------------------------------------------------------------//

// Fetching current and next mode, only next mode is useful here

async function getMode() {
  let currentMode;
  let nextMode;
  try {
    currentMode = await tokenInstanceCall.currentTokenMode();
    nextMode = await tokenInstanceCall.nextTokenMode();
  } catch (error) {
    console.log(error);
  }

  return nextMode;
}

// Calling switchNextMode() to switch to next mode

async function switchMode() {
  await tokenInstanceSend.switchNextMode({ gasLimit: 3000000 });
}

//---------------------------------------------------------------------------------------------//

// Main function

async function main() {
  const mode = await getMode();
  console.log("Next mode :", mode);
  const currentTime = Date.now();
  const desiredTime = Date.now() + 2700 * 1000; // 45 minutes
  const remainingTime = Math.max(0, desiredTime - currentTime);
  const desiredTimeHarmony = Date.now() + 4500 * 1000; // 75 minutes
  const remainingTimeHarmony = Math.max(0, desiredTimeHarmony - currentTime);
  const desiredTimeApe = Date.now() + 30 * 1000;
  const remainingTimeApe = Math.max(0, desiredTimeApe - currentTime);

  if (mode === "ngmi" || mode === "ape") {
    await switchMode();
    console.log("Switched mode to :", mode);
    setTimeout(() => {
      main();
    }, remainingTime);
  } else if (mode === "chill") {
    await switchMode();
    console.log("Switched mode to :", mode);
    setTimeout(() => {
      main();
    }, remainingTimeHarmony);
  } else if (mode === "ape") {
    // Had to add this to avoid ape mode cuz bug in the sc
    await switchMode();
    // setTimeout(() => {
    //   main();
    // }, remainingTimeApe);  //ONLY APE MODE TO AVOID NEW BUYS (CUZ DEAD COIN)
  }
}

main();
