const { rollFairDice } = require('../lib/dice');

// POST /api/roll  { count: 1-6 }  ->  { results: [{name,hex}, ...] }
module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const count = parseInt(req.body && req.body.count, 10);
  if (!Number.isInteger(count) || count < 1 || count > 6) {
    res.status(400).json({ error: 'count must be an integer between 1 and 6' });
    return;
  }
  const results = rollFairDice(count);
  res.status(200).json({ results });
};
