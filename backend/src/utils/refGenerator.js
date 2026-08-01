const crypto = require('crypto');

function randomDigits(length) {
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(length, '0');
}

function generateReferenceNo() {
  const year = new Date().getFullYear();
  return `SLP-${year}-${randomDigits(6)}`;
}

function generateTransactionRef() {
  return `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

module.exports = { generateReferenceNo, generateTransactionRef };
