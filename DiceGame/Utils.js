function getUserInput(prompt) {
  process.stdout.write(prompt);
  return new Promise((resolve) => process.stdin.once('data', (data) => resolve(data.toString().trim())));
}

module.exports = { getUserInput };
