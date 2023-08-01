// This is a script to implement with a echoes token contract, it will start/ stop randomly events and distribute reflections to the winners.
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
const listOfEvents = ["theChosenPeople", "OG", "Newbie", "Pleb"];

// Provider
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

// Variables
let previousEvent = "";
let filteredHolders = [];
let holders = [];

/* -------------------------------------------------------------------------- */

// Function to randomly decide which event to start
// The function will not start the same event twice in a row

function decideEvent() {
  let random = listOfEvents[Math.floor(Math.random() * listOfEvents.length)];
  while (random === previousEvent) {
    random = listOfEvents[Math.floor(Math.random() * listOfEvents.length)];
  }
  previousEvent = random;
  return random;
}

// Function to get the list of holders
// Fetched from the sc on-chain

async function getHolderList() {
  let _holders;
  try {
    _holders = await tokenInstanceSend.getArrayHolder();
  } catch (error) {
    console.log(error);
  }

  return _holders;
}

/* -------------------------------------------------------------------------- */
/*                               Starting Events                              */
/* -------------------------------------------------------------------------- */

async function startEvent(event) {
  if (event === "theChosenPeople") {
    await getAddressesAboveXTokenBalance(100000);
    await tokenInstanceSend.startEventName(event, filteredHolders, {
      gasLimit: 3000000,
    });

    // NOT USED
    // } else if (event === "RollTheDice") {
    //   await get20RandomHolders();
    //   await tokenInstanceSend.startEventName(event, filteredHolders, {
    //     gasLimit: 3000000,
    //   });
    // NOT USED
    // } else if (event === "WhaleHunting") {
    //   await getSmallestHolders();
    //   await tokenInstanceSend.startEventName(event, filteredHolders, {
    //     gasLimit: 3000000,
    //   });
  } else if (event === "OG") {
    await getOGHolders();
    await tokenInstanceSend.startEventName(event, filteredHolders, {
      gasLimit: 3000000,
    });
  } else if (event === "Newbie") {
    await getNewbieHolders();
    await tokenInstanceSend.startEventName(event, filteredHolders, {
      gasLimit: 3000000,
    });
  } else if (event === "Pleb") {
    await getPlebHolders();
    await tokenInstanceSend.startEventName(event, filteredHolders, {
      gasLimit: 3000000,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                                Ending Events                               */
/* -------------------------------------------------------------------------- */

async function stopEvent() {
  await tokenInstanceSend.stopEvent({ gasLimit: 3000000 });
}

/* -------------------------------------------------------------------------- */
/*                            Distributing rewards                            */
/* -------------------------------------------------------------------------- */

async function distributeReflections(addresses) {
  await tokenInstanceSend.shouldDistributeEventReflections(addresses, true, {
    gasLimit: 3000000,
  });
}

/* -------------------------------------------------------------------------- */
/*                                The chosen one                              */
/* -------------------------------------------------------------------------- */

async function getAddressesAboveXTokenBalance(x) {
  let _filteredHolders = [];
  for (let i = 0; i < holders.length; i++) {
    const balance = await tokenInstanceSend.getHolder(holders[i]);
    if (parseFloat(ethers.formatEther(balance[0])) > parseFloat(x)) {
      _filteredHolders.push(holders[i]);
    }
  }
  filteredHolders = _filteredHolders;
}

function theChosenOne(filteredHolders) {
  const numElements = 51;
  if (numElements >= filteredHolders.length) {
    throw new Error("Number of elements to choose cannot exceed array length.");
  }

  const shuffledArray = filteredHolders.slice(); // Make a shallow copy of the array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray.slice(0, numElements);
}

/* -------------------------------------------------------------------------- */
/*                                Roll the Dice                               */ //NOT USED
/* -------------------------------------------------------------------------- */

// async function get20RandomHolders() {
//   let _filteredHolders = [];
//   for (let i = 0; i < 2; i++) {
//     let random = Math.floor(Math.random() * holders.length);
//     while (_filteredHolders.includes(holders[random])) {
//       random = Math.floor(Math.random() * holders.length);
//     }
//     _filteredHolders.push(holders[random]);
//   }
//   filteredHolders = _filteredHolders;
// }

// function RollTheDice(filteredHolders) {
//   const random = Math.random();
//   if (random < 0.5) {
//     // 50% chance
//     return filteredHolders;
//   } else {
//     return [];
//   }
// }

/* -------------------------------------------------------------------------- */
/*                                Whale Hunting                               */ // NOT USED
/* -------------------------------------------------------------------------- */

// async function getSmallestHolders() {
//   let addressBalances = [];
//   const randomPercentage = ((Math.random() * 11 + 10) * 0.01).toFixed(2);
//   for (let i = 0; i < holders.length; i++) {
//     const balance = await tokenInstanceCall.getHolder(holders[i]);
//     addressBalances.push({ address: holders[i], balance: balance[0] });
//   }
//   addressBalances = addressBalances
//     .slice()
//     .sort((a, b) =>
//       a.balance < b.balance ? -1 : a.balance > b.balance ? 1 : 0
//     );
//   const sortedAddresses = addressBalances.map((entry) => entry.address);
//   const _filteredHolders = sortedAddresses.slice(
//     -(randomPercentage * holders.length)
//   );

//   filteredHolders = _filteredHolders;
// }

// function WhaleHunting(filteredHolders) {
//   return filteredHolders;
// }

/* -------------------------------------------------------------------------- */
/*                                     OG                                     */
/* -------------------------------------------------------------------------- */

async function getOGHolders() {
  let addressHolding = [];

  for (let i = 0; i < holders.length; i++) {
    const holding = await tokenInstanceSend.getHolder(holders[i]);
    addressHolding.push({ address: holders[i], holding: holding[3] });
  }
  addressHolding = addressHolding
    .slice()
    .sort((a, b) =>
      a.holding < b.holding ? -1 : a.holding > b.holding ? 1 : 0
    );
  const sortedAddresses = addressHolding.map((entry) => entry.address);

  filteredHolders = sortedAddresses;
}

function OG(filteredHolders) {
  const randomNumber = Math.floor(Math.random() * 41 + 30);
  return filteredHolders.slice(0, randomNumber);
}

/* -------------------------------------------------------------------------- */
/*                                  Newbie                                    */
/* -------------------------------------------------------------------------- */

async function getNewbieHolders() {
  let addressHolding = [];

  for (let i = 0; i < holders.length; i++) {
    const holding = await tokenInstanceSend.getHolder(holders[i]);
    addressHolding.push({ address: holders[i], holding: holding[3] });
  }
  addressHolding = addressHolding
    .slice()
    .sort((a, b) =>
      a.holding < b.holding ? -1 : a.holding > b.holding ? 1 : 0
    );
  const sortedAddresses = addressHolding.map((entry) => entry.address);

  filteredHolders = sortedAddresses;
}

function Newbie(filteredHolders) {
  const randomNumber = Math.floor(Math.random() * 51 + 30);
  return filteredHolders.slice(-randomNumber);
}

/* -------------------------------------------------------------------------- */
/*                                    Pleb                                    */
/* -------------------------------------------------------------------------- */

async function getPlebHolders() {
  let addressBalances = [];

  for (let i = 0; i < holders.length; i++) {
    const balance = await tokenInstanceCall.getHolder(holders[i]);
    addressBalances.push({ address: holders[i], balance: balance[0] });
  }
  addressBalances = addressBalances
    .slice()
    .sort((a, b) =>
      a.balance < b.balance ? -1 : a.balance > b.balance ? 1 : 0
    );
  const sortedAddresses = addressBalances.map((entry) => entry.address);
  const _filteredHolders = sortedAddresses.slice(50, 190);
  filteredHolders = _filteredHolders;
}

function pleb(filteredHolders) {
  const numElements = Math.floor(Math.random() * 31 + 20);
  if (numElements >= filteredHolders.length) {
    throw new Error("Number of elements to choose cannot exceed array length.");
  }

  const shuffledArray = filteredHolders.slice(); // Make a shallow copy of the array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray.slice(0, numElements);
}

/*                           ENTERING BETTING EVENTS                          */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                   Bettor                                   */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                               Betting Beast                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                    Main                                    */
/* -------------------------------------------------------------------------- */

async function main() {
  const event = decideEvent();
  console.log("Event: ", event);
  holders = await getHolderList();
  console.log("Holders: ", holders.length);
  filteredHolders = [];

  if (event === "theChosenPeople" && typeof holders !== "undefined") {
    await startEvent(event);
    console.log("The chosen one started");

    const currentTime = Date.now();
    const desiredTime = Date.now() + 21600 * 1000; // 40 minutes
    const remainingTime = Math.max(0, desiredTime - currentTime);

    const chosenOne = await theChosenOne(filteredHolders);
    console.log("Chosen one: ", chosenOne);

    setTimeout(async () => {
      await stopEvent();
      console.log("Event stopped");
      await distributeReflections(chosenOne);
      console.log("Reflections distributed");
    }, remainingTime);

    const desiredTimeRest = desiredTime + 60 * 1000;
    const remainingTimeRest = Math.max(0, desiredTimeRest - currentTime);

    setTimeout(() => {
      main();
    }, remainingTimeRest); // 1 minute rest

    // NOT USED
    //  else if (event === "RollTheDice" && typeof holders !== "undefined") {
    //   await startEvent(event);
    //   console.log("Roll the dice started");

    //   const currentTime = Date.now();
    //   const desiredTime = Date.now() + 90 * 1000; // 45 minutes
    //   const remainingTime = Math.max(0, desiredTime - currentTime);

    //   const winners = await RollTheDice(filteredHolders);
    //   console.log("Winners: ", winners);

    //   setTimeout(async () => {
    //     await stopEvent();
    //     console.log("Event stopped");
    //     await distributeReflections(winners);
    //     console.log("Reflections distributed");
    //   }, remainingTime);

    //   const desiredTimeRest = desiredTime + 60 * 1000;
    //   const remainingTimeRest = Math.max(0, desiredTimeRest - currentTime);

    //   setTimeout(() => {
    //     main();
    //   }, remainingTimeRest); // 1 minute rest
    // } else if (event === "WhaleHunting" && typeof holders !== "undefined") {
    //   await startEvent(event);
    //   console.log("Whale hunting started");

    //   const currentTime = Date.now();
    //   const desiredTime = Date.now() + 90 * 1000; // 45 minutes
    //   const remainingTime = Math.max(0, desiredTime - currentTime);

    //   const winners = await WhaleHunting(filteredHolders);
    //   console.log("Winners: ", winners);

    //   setTimeout(async () => {
    //     await stopEvent();
    //     console.log("Event stopped");
    //     await distributeReflections(winners);
    //     console.log("Reflections distributed");
    //   }, remainingTime);

    //   const desiredTimeRest = desiredTime + 60 * 1000;
    //   const remainingTimeRest = Math.max(0, desiredTimeRest - currentTime);

    //   setTimeout(() => {
    //     main();
    //   }, remainingTimeRest); // 1 minute rest
  } else if (event === "OG" && typeof holders !== "undefined") {
    await startEvent(event);
    console.log("OG started");

    const currentTime = Date.now();
    const desiredTime = Date.now() + 21600 * 1000; // 40 minutes
    const remainingTime = Math.max(0, desiredTime - currentTime);

    const winners = await OG(filteredHolders);
    console.log("Winners: ", winners);

    setTimeout(async () => {
      await stopEvent();
      console.log("Event stopped");
      await distributeReflections(winners);
      console.log("Reflections distributed");
    }, remainingTime);

    const desiredTimeRest = desiredTime + 60 * 1000;
    const remainingTimeRest = Math.max(0, desiredTimeRest - currentTime);

    setTimeout(() => {
      main();
    }, remainingTimeRest); // 1 minute rest
  } else if (event === "Newbie" && typeof holders !== "undefined") {
    await startEvent(event);
    console.log("Newbie started");

    const currentTime = Date.now();
    const desiredTime = Date.now() + 21600 * 1000; // 60 minutes
    const remainingTime = Math.max(0, desiredTime - currentTime);

    const winners = await Newbie(filteredHolders);
    console.log("Winners: ", winners);

    setTimeout(async () => {
      await stopEvent();
      console.log("Event stopped");
      await distributeReflections(winners);
      console.log("Reflections distributed");
    }, remainingTime);

    const desiredTimeRest = desiredTime + 60 * 1000;
    const remainingTimeRest = Math.max(0, desiredTimeRest - currentTime);

    setTimeout(() => {
      main();
    }, remainingTimeRest); // 1 minute rest
  } else if (event === "Pleb" && typeof holders !== "undefined") {
    await startEvent(event);
    console.log("Pleb started");

    const currentTime = Date.now();
    const desiredTime = Date.now() + 21600 * 1000; // 42 minutes
    const remainingTime = Math.max(0, desiredTime - currentTime);

    const winners = await pleb(filteredHolders);
    console.log("Winners: ", winners);

    setTimeout(async () => {
      await stopEvent();
      console.log("Event stopped");
      await distributeReflections(winners);
      console.log("Reflections distributed");
    }, remainingTime);

    const desiredTimeRest = desiredTime + 60 * 1000;
    const remainingTimeRest = Math.max(0, desiredTimeRest - currentTime);

    setTimeout(() => {
      main();
    }, remainingTimeRest); // 1 minute rest
  } else {
    console.log("No holders");
    main();
  }
}

main();
