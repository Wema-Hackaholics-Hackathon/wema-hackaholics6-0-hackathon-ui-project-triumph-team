const crypto = require("crypto");

function shortHash(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 8);
}

module.exports = { shortHash };
