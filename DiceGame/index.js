const crypto = require("crypto");
const { parseDice } = require('./parseDice');

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

async function getUserInput(prompt) {
  process.stdout.write(prompt);
  return new Promise((resolve) => process.stdin.once("data", (data) => resolve(data.toString().trim())));
}

async function playGame(dice) {
  const { key, number: computerChoice, hmac } = fairRandom(1, 0);
  console.log(`HMAC=${hmac}. Guess my number (0 or 1):`);

  const userGuess = parseInt(await getUserInput("> "), 10);
  if (userGuess === '?') {
    showHelpTable();
    return;
  }

  const userGoesFirst = userGuess === computerChoice;
  console.log(userGoesFirst ? "You go first!" : "I go first!");

  const userDiceIndex = await getValidDiceIndex(dice, "Choose your dice (0, 1, 2): ");
  const computerDiceIndex = userGoesFirst ? (userDiceIndex + 1) % dice.length : userDiceIndex;
  console.log(`I chose dice ${computerDiceIndex}.`);

  const userRoll = dice[userDiceIndex].roll(userGuess);
  const computerRoll = dice[computerDiceIndex].roll(computerChoice);
  console.log(`Your roll: ${userRoll}, My roll: ${computerRoll}`);

  const result = userRoll > computerRoll ? "You win!" : userRoll < computerRoll ? "I win!" : "It's a tie!";
  console.log(result);

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
