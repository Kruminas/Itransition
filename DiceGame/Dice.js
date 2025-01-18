class Dice {
  constructor(sides) {
    if (sides.length !== 6 || sides.some(isNaN)) {
      throw new Error("Invalid dice sides");
    }
    this.sides = sides;
  }

  roll(index) {
    return this.sides[index];
  }

  
    roll(value) {
      return this.sides[value % this.sides.length];
    }
  
    calculateProbabilityAgainst(otherDice) {
      let userWins = 0;
      let computerWins = 0;
      let ties = 0;
  
      const rolls = 10000;
      for (let i = 0; i < rolls; i++) {
        const userRoll = this.roll(Math.floor(Math.random() * this.sides.length));
        const computerRoll = otherDice.roll(Math.floor(Math.random() * otherDice.sides.length));
  
        if (userRoll > computerRoll) userWins++;
        else if (userRoll < computerRoll) computerWins++;
        else ties++;
      }
  
      const userWinPercentage = (userWins / rolls) * 100;
      const computerWinPercentage = (computerWins / rolls) * 100;
      const tiePercentage = (ties / rolls) * 100;
  
      return { userWinPercentage, computerWinPercentage, tiePercentage };
    }
  }
  
  module.exports = Dice;
  