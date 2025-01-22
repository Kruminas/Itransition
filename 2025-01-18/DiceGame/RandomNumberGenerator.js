const crypto = require('crypto');

function fairRandom(max) {
  const key = crypto.randomBytes(32);
  const number = crypto.randomInt(max);
  const hmac = crypto.createHmac('sha256', key).update(number.toString()).digest('hex');
  return { key, number, hmac };
}

module.exports = { fairRandom };
