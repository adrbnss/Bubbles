const listOfEvents = ["theChosenOne", "RollTheDice"];
let previousEvent = "";

function decideEvent() {
  let random = listOfEvents[Math.floor(Math.random() * listOfEvents.length)];
  while (random === previousEvent) {
    random = listOfEvents[Math.floor(Math.random() * listOfEvents.length)];
  }
  previousEvent = random;
  return random;
}
function test() {
  const event = decideEvent();

  if (event === "theChosenOne") {
    console.log("theChosenOne");

    const currentTime = Date.now();
    const desiredTime = Date.now() + 10 * 1000; // 45 minutes
    const remainingTime = Math.max(0, desiredTime - currentTime);

    setTimeout(() => {
      console.log("stopEvent theChosenOne");
    }, remainingTime);

    const desiredTimeRest = desiredTime + 5 * 1000;
    const remainingTimeRest = Math.max(0, desiredTimeRest - currentTime);

    setTimeout(() => {
      test();
    }, remainingTimeRest); // 1 minute rest
  } else if (event === "RollTheDice") {
    console.log("RollTheDice");

    const currentTime = Date.now();
    const desiredTime = Date.now() + 10 * 1000; // 45 minutes
    const remainingTime = Math.max(0, desiredTime - currentTime);

    setTimeout(() => {
      console.log("stopEvent RollTheDice");
    }, remainingTime);

    const desiredTimeRest = desiredTime + 5 * 1000;
    const remainingTimeRest = Math.max(0, desiredTimeRest - currentTime);

    setTimeout(() => {
      test();
    }, remainingTimeRest); // 1 minute rest
  }
}

test();
