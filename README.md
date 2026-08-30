# Azul Dice

## Structure
```
azul-dice/
├── api/                   Serverless functions (Vercel turns each file into a route)
│   ├── roll.js            POST /api/roll
│   ├── match-chances.js   GET  /api/match-chances?n=N
│   └── new-id.js          GET  /api/new-id
├── lib/
│   └── dice.js            Shared dice logic used by all three functions above
├── index.html             The page itself
├── css/style.css
├── js/app.js
└── assets/                Images and audio
```

No Express, no server.js, no `npm install` needed — everything in `/api`
is a plain Node function that Vercel runs on demand. This is the standard
zero-config setup Vercel expects, so deploying is literally "point Vercel
at this folder."

## How the dice/odds work
- Every roll is generated **server-side** in `api/roll.js` using Node's
  cryptographically secure RNG (`crypto.randomInt`) — the browser only
  ever receives the finished result, so nobody can read or edit it via
  devtools/localStorage before it's revealed.
- Every color has an equal, independent 1-in-6 chance on every die —
  plain fair dice, nothing nudges results toward or away from anything.
- The odds shown in the app (`api/match-chances.js`) are the exact
  binomial probability of landing exactly *k* dice on one particular
  color out of *n* rolled, with `p = 1/6` per die: `C(n,k) · (1/6)^k ·
  (5/6)^(n-k)`. That's genuine math, not a hardcoded table, so it can
  never drift out of sync with what `/api/roll` actually produces.

## Deploy to Vercel (so you and others can use it online)

**Option A — from the Vercel dashboard (no command line):**
1. Put this folder in a GitHub repo (create a new repo on github.com,
   upload/push these files to it).
2. Go to https://vercel.com, sign in (GitHub login is easiest), click
   "Add New… → Project", pick that repo, and click **Deploy**. No
   settings need to change — Vercel auto-detects everything.
3. After it finishes you get a URL like `your-project.vercel.app` that
   anyone can open.

**Option B — from the terminal, with the Vercel CLI:**
```
npm i -g vercel
cd azul-dice
vercel        # first run: log in, link/create the project, deploy a preview
vercel --prod # deploy to your real production URL
```

## Running it locally before you deploy
```
npm i -g vercel
cd azul-dice
vercel dev
```
Then open http://localhost:3000 — `vercel dev` runs the exact same
`/api` functions locally that will run in production, so you can test
everything (rolling, odds, IDs) before pushing live.

## Missing assets
These files are referenced by name in the page but weren't embedded in
the original upload, so drop your own copies in:
- `assets/azul-dice-logo.png` (header logo)
- `assets/audio/the-dice-fell.mp3`
- `assets/audio/jet-set-radio-spray-1_4CFwPkb.mp3` (...2, ...3, ...4)
- `assets/audio/universfield-notification-05-140376.mp3`
