const { generateGameId } = require('../lib/dice');

// GET /api/new-id  ->  { id: 'ABCD1234' }
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.status(200).json({ id: generateGameId() });
};
