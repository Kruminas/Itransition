const Dice = require('./Dice');

function parseDice(args) {
  if (args.length < 3) throw new Error("Provide at least 3 dice, each with 6 integers.");
  return args.map((arg) => {
    const sides = arg.split(",").map(Number);
    if (sides.length !== 6 || sides.some(isNaN)) throw new Error(`Invalid dice: '${arg}'.`);
    
    return new Dice(sides);
  });
}

module.exports = { parseDice };
