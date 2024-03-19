const crypto = require("crypto");

function generateActivationToken() {
  return crypto.randomBytes(20).toString("hex");
}

module.exports = generateActivationToken;
