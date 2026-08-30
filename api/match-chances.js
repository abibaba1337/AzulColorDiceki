const { computeMatchChances, DICE_COLORS } = require('../lib/dice');

// GET /api/match-chances?n=4  ->  { chances: [{k, prob}, ...] }
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const n = parseInt(req.query.n, 10);
  if (!Number.isInteger(n) || n < 1 || n > 6) {
    res.status(400).json({ error: 'n must be an integer between 1 and 6' });
    return;
  }
  const chances = computeMatchChances(n, DICE_COLORS.length);
  res.status(200).json({ chances });
};
