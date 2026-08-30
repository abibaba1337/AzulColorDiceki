// A lightweight "who's online" counter.
// Clients send a heartbeat every few seconds; anyone whose last heartbeat
// is older than PRESENCE_WINDOW_MS is considered gone. No database needed —
// state lives in the function's memory for as long as the instance stays warm,
// which is enough to give a real, live count for a small site like this.

const PRESENCE_WINDOW_MS = 20000; // consider a client "online" if seen in the last 20s

if (!global.__azulPresence) {
  global.__azulPresence = new Map(); // clientId -> lastSeen timestamp
}
const presence = global.__azulPresence;

function countActive() {
  const now = Date.now();
  for (const [id, lastSeen] of presence) {
    if (now - lastSeen > PRESENCE_WINDOW_MS) presence.delete(id);
  }
  return Math.max(presence.size, 1); // never show 0 to the person currently viewing
}

module.exports = (req, res) => {
  if (req.method === 'POST') {
    const id = (req.body && req.body.id) || req.headers['x-client-id'];
    if (id) presence.set(String(id), Date.now());
    res.status(200).json({ players: countActive() });
    return;
  }
  if (req.method === 'GET') {
    res.status(200).json({ players: countActive() });
    return;
  }
  res.status(405).json({ error: 'Method not allowed' });
};
