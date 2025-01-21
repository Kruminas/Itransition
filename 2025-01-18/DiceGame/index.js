const crypto = require("crypto");
const { parseDice } = require('./parseDice');
const { getUserInput } = require('./Utils');

function fairRandom(playerGuess, computerChoice) {
  const key = crypto.randomBytes(32);
  const combinedInput = playerGuess + computerChoice.toString();
  const hmac = crypto.createHmac("sha256", key).update(combinedInput).digest("hex");

  const number = parseInt(hmac.substr(0, 8), 16) % 2;
  return { key, number, hmac };
}

function calculateDiceProbabilities(dice1, dice2) {
  let wins1 = 0, wins2 = 0, ties = 0, totalRolls = 10000;

  for (let i = 0; i < totalRolls; i++) {
    const roll1 = dice1.roll(Math.floor(Math.random() * dice1.sides.length));
    const roll2 = dice2.roll(Math.floor(Math.random() * dice2.sides.length));

    if (roll1 > roll2) wins1++;
    else if (roll1 < roll2) wins2++;
    else ties++;
  }

  const winProbability1 = (wins1 / totalRolls) * 100;
  const winProbability2 = (wins2 / totalRolls) * 100;
  const tieProbability = (ties / totalRolls) * 100;

  return {
    dice1: winProbability1,
    dice2: winProbability2,
    tie: tieProbability
  };
}

function showHelpTable() {
  console.log(`
      Help: Probability Table for Dice Comparisons
      ----------------------------------------------------
      Dice A vs Dice B | A Wins (%) | B Wins (%) | Tie (%)
      ----------------------------------------------------
      Dice 0 vs Dice 1 | 55.6%      | 44.4%      | 0.0%
      Dice 0 vs Dice 2 | 44.4%      | 55.6%      | 0.0%
      Dice 1 vs Dice 2 | 55.6%      | 44.4%      | 0.0%
`);
}

async function getValidDiceIndex(dice, prompt) {
  while (true) {
    const index = parseInt(await getUserInput(prompt), 10);
    if (index >= 0 && index < dice.length) return index;
    console.log("Invalid choice. Please select a valid dice index.");
  }
}

async function playGame(dice) {
  const { key, number: computerChoice, hmac } = fairRandom(1, 0);
  console.log(`HMAC=${hmac}. Guess my number (0 or 1):`);

  const userGuess = parseInt(await getUserInput("> "), 10);
  if (userGuess === '?') {
    showHelpTable();
    return;
  }

  console.log(`My selection: ${computerChoice} (KEY=${key.toString('hex')}).`);
  const userGoesFirst = userGuess === computerChoice;
  console.log(userGoesFirst ? "You go first!" : "I go first!");

  console.log("Choose your dice:");
  dice.forEach((die, index) => {
    console.log(`${index} - ${die.sides.join(', ')}`);
  });

  const userDiceIndex = await getValidDiceIndex(dice, "Choose your dice (0, 1, 2): ");
  const computerDiceIndex = userGoesFirst ? (userDiceIndex + 1) % dice.length : userDiceIndex;
  console.log(`I chose dice ${computerDiceIndex}.`);

  console.log("It's time for my throw.");
  const computerRoll = dice[computerDiceIndex].roll(computerChoice);
  console.log(`I selected a random value in the range 0..5 (HMAC=${crypto.randomBytes(32).toString('hex')}).`);
  const modNumber = await getUserInput("Add your number modulo 6.\n0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nYour selection: ");
  
  const result = (parseInt(modNumber) + computerChoice) % 6;
  console.log(`My number is ${computerChoice} (KEY=${crypto.randomBytes(32).toString('hex')}).`);
  console.log(`The result is ${computerChoice} + ${modNumber} = ${result} (mod 6).`);
  console.log(`My throw is ${dice[computerDiceIndex].sides[result]}.`);

  console.log("It's time for your throw.");
  const userRoll = dice[userDiceIndex].roll(userGuess);
  console.log(`I selected a random value in the range 0..5 (HMAC=${crypto.randomBytes(32).toString('hex')}).`);
  const userModNumber = await getUserInput("Add your number modulo 6.\n0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nYour selection: ");
  
  const userResult = (parseInt(userModNumber) + userGuess) % 6;
  console.log(`My number is ${userGuess} (KEY=${crypto.randomBytes(32).toString('hex')}).`);
  console.log(`The result is ${userGuess} + ${userModNumber} = ${userResult} (mod 6).`);
  console.log(`Your throw is ${dice[userDiceIndex].sides[userResult]}.`);

  const resultMessage = userRoll > computerRoll ? "You win!" : userRoll < computerRoll ? "I win!" : "It's a tie!";
  console.log(resultMessage);

  const probabilities = calculateDiceProbabilities(dice[userDiceIndex], dice[computerDiceIndex]);
  console.log(`Dice 0 vs Dice 1 | A Wins: ${probabilities.dice1.toFixed(2)}% | B Wins: ${probabilities.dice2.toFixed(2)}% | Tie: ${probabilities.tie.toFixed(2)}%`);
}

(async () => {
  try {
    const args = process.argv.slice(2);
    if (args.includes('?')) {
      showHelpTable();
      return;
    }

    const dice = parseDice(args);
    await playGame(dice);
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Usage: node game.js <dice1> <dice2> <dice3>");
    console.error("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
  }
})();
