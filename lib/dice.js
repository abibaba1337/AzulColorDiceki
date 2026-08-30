// Shared dice logic for the Vercel serverless functions in /api.
//
// Dice are fair and independent: every one of the 6 colors has exactly a
// 1/6 chance on every die, drawn with Node's cryptographically secure RNG
// (crypto.randomInt), same guarantee as before — nobody can read or edit
// a result via devtools/localStorage before it's revealed.
//
// "Matching" chances are the plain binomial probability of landing EXACTLY
// k dice on one particular color out of n dice rolled, with p = 1/6 per
// die. This is real, un-tampered math — /api/match-chances computes it
// with the exact same formula every time, so what's displayed always
// matches what /api/roll can actually produce.

const crypto = require('crypto');

const DICE_COLORS = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Green', hex: '#008000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Purple', hex: '#800080' }
];

function randomColorIndex() {
  return crypto.randomInt(0, DICE_COLORS.length);
}

/** Rolls `n` independent, fair dice. */
function rollFairDice(n) {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(DICE_COLORS[randomColorIndex()]);
  }
  return result;
}

function binomialCoeff(n, k) {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}

/**
 * Exact probability of landing exactly k out of n dice on one particular
 * color, for k = 1..n, with p = 1/colorsCount per die (standard binomial
 * distribution — no artificial suppression or boosting).
 */
function computeMatchChances(n, colorsCount) {
  const p = 1 / colorsCount;
  const result = [];
  for (let k = 1; k <= n; k++) {
    const prob = binomialCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    result.push({ k, prob: prob * 100 });
  }
  return result;
}

function generateGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return result;
}

module.exports = { DICE_COLORS, rollFairDice, computeMatchChances, generateGameId };
