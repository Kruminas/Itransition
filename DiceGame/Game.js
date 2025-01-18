const { fairRandom } = require('./RandomNumberGenerator');
const { getUserInput } = require('./Utils');

class Game {
  constructor(dice) {
    this.dice = dice;
  }

  async play() {
    const { number: computerChoice, hmac } = fairRandom(2);
    console.log(`HMAC=${hmac}. Guess my number (0 or 1):`);

    const userGuess = parseInt(await getUserInput("> "), 10);

    const userGoesFirst = userGuess === computerChoice;
    console.log(userGoesFirst ? "You go first!" : "I go first!");

    const userDiceIndex = await this.getValidDiceIndex("Choose your dice (0, 1, 2): ");
    const computerDiceIndex = (userDiceIndex + 1) % this.dice.length;
    console.log(`I chose dice ${computerDiceIndex}.`);

    const userRoll = this.dice[userDiceIndex].roll(userGuess);
    const computerRoll = this.dice[computerDiceIndex].roll(computerChoice);
    console.log(`Your roll: ${userRoll}, My roll: ${computerRoll}`);

    const result = userRoll > computerRoll ? "You win!" : userRoll < computerRoll ? "I win!" : "It's a tie!";
    console.log(result);
  }

  async getValidDiceIndex(prompt) {
    while (true) {
      const index = parseInt(await getUserInput(prompt), 10);
      if (index >= 0 && index < this.dice.length) return index;
      console.log("Invalid choice. Please select a valid dice index.");
    }
  }
}

module.exports = Game;
