const DICE_COLORS = [
      { name: 'Red', hex: '#FF0000' },
      { name: 'Orange', hex: '#FFA500' },
      { name: 'Yellow', hex: '#FFD700' },
      { name: 'Green', hex: '#008000' },
      { name: 'Blue', hex: '#0000FF' },
      { name: 'Purple', hex: '#800080' }
    ];

    let rollsToday = 0;
    const counterState = {
      garam: { value: 0, plusClicks: 0, minusClicks: 0 },
      dragon: { value: 0, plusClicks: 0, minusClicks: 0 }
    };
    let isRolling = false;
    let isBlurMode = false;
    let historyData = [];
    let colorStats = { Red: 0, Orange: 0, Yellow: 0, Green: 0, Blue: 0, Purple: 0 };
    let isAnonMode = false;
    const NORMAL_LOGO_SRC = 'assets/azul-dice-logo.png';
    const ANON_LOGO_SRC = 'assets/anon-logo.webp';

    // ── SOUND SYSTEM ──
    let soundVolume = 0.8;

    // Normal "Roll Again" landing sound.
    const diceRollSound = new Audio('assets/audio/the-dice-fell.mp3');
    diceRollSound.preload = 'auto';
    diceRollSound.volume = soundVolume;

    function playDiceRollSound() {
      if (soundVolume <= 0) return;
      diceRollSound.currentTime = 0;
      diceRollSound.play().catch(e => console.log('Audio play blocked:', e));
    }

    // Fast Roll: pool of the 4 spray sounds, one picked at random per roll.
    const spraySoundFiles = [
      'assets/audio/jet-set-radio-spray-1_4CFwPkb.mp3',
      'assets/audio/jet-set-radio-spray-2_pITyzB4.mp3',
      'assets/audio/jet-set-radio-spray-3_c3UntD1.mp3',
      'assets/audio/jet-set-radio-spray-4_gni8YkP.mp3'
    ];
    const spraySounds = spraySoundFiles.map(src => {
      const a = new Audio(src);
      a.preload = 'auto';
      return a;
    });

    function playRandomSpraySound() {
      if (soundVolume <= 0) return;
      const sound = spraySounds[Math.floor(Math.random() * spraySounds.length)];
      sound.currentTime = 0;
      sound.volume = soundVolume;
      sound.play().catch(e => console.log('Audio play blocked:', e));
    }

    // Ultra Roll: die 1 -> spray-1, die 2 -> spray-2, die 3 -> spray-3,
    // die 4 -> spray-4, then it cycles back to spray-1 for die 5, etc.
    const ultraDieSounds = spraySoundFiles.map(src => {
      const a = new Audio(src);
      a.preload = 'auto';
      return a;
    });

    function playUltraDieSound(dieIndex) {
      if (soundVolume <= 0) return;
      const sound = ultraDieSounds[dieIndex % ultraDieSounds.length];
      sound.currentTime = 0;
      sound.volume = soundVolume;
      sound.play().catch(e => console.log('Audio play blocked:', e));
    }

    // Notification chime: plays at the end of an Ultra Roll sequence, and
    // also after a regular Roll Again that lands exactly 4 dice.
    const ultraFinishSound = new Audio('assets/audio/universfield-notification-05-140376.mp3');
    ultraFinishSound.preload = 'auto';

    function playUltraFinishSound() {
      if (soundVolume <= 0) return;
      ultraFinishSound.currentTime = 0;
      ultraFinishSound.volume = soundVolume;
      ultraFinishSound.play().catch(e => console.log('Audio play blocked:', e));
    }

    // ── FAST ROLL MODE TOGGLE ──
    function toggleRollMode() {
      const isFast = document.getElementById('rollModeToggle').checked;
      const rollBtn = document.getElementById('rollBtn');
      if (rollBtn) rollBtn.innerText = isFast ? 'FAST ROLL!' : 'ROLL AGAIN !';
    }

    function getRandomColor() {
      return DICE_COLORS[Math.floor(Math.random() * DICE_COLORS.length)];
    }

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    // Dice are no longer generated in the browser. rollFromServer() below
    // calls the server's /api/roll endpoint, which uses a cryptographically
    // secure RNG and returns the finished result. This means:
    //   - the outcome can't be read or altered via devtools/localStorage
    //     before it's revealed, and
    //   - every color is equally likely on every die (true fair odds),
    //     not artificially suppressed.
    async function rollFromServer(count) {
      const res = await fetch('/api/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      if (!res.ok) throw new Error('Server roll failed: ' + res.status);
      const data = await res.json();
      return data.results;
    }

    // Fetches the true combinatorial match odds for the given dice count
    // from the server (same math as before, just computed server-side so
    // it always matches what the server will actually roll).
    const matchChanceCache = {};
    async function fetchMatchChances(n) {
      if (matchChanceCache[n]) return matchChanceCache[n];
      const res = await fetch('/api/match-chances?n=' + encodeURIComponent(n));
      if (!res.ok) throw new Error('Failed to load match chances: ' + res.status);
      const data = await res.json();
      matchChanceCache[n] = data.chances;
      return data.chances;
    }

    function generateGameId() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    function createDieElement(colorObj, isRollingState = false) {
      const wrapper = document.createElement('div');
      wrapper.className = 'die-wrapper';

      const die = document.createElement('div');
      die.className = 'die';
      
      if (isRollingState) {
        die.classList.add('die-rolling');
      } else {
        die.style.backgroundColor = colorObj.hex;
      }

      const dot = document.createElement('div');
      dot.className = 'die-dot';

      die.appendChild(dot);
      wrapper.appendChild(die);

      const label = document.createElement('div');
      label.className = 'die-label';
      label.innerText = colorObj ? colorObj.name : '?';
      label.style.color = colorObj ? colorObj.hex : '#cccccc';
      wrapper.appendChild(label);

      return wrapper;
    }

    function renderInitialDice(gray = false) {
      const count = parseInt(document.getElementById('diceCount').value);
      const container = document.getElementById('diceContainer');
      container.innerHTML = '';
      for (let i = 0; i < count; i++) {
        if (gray) {
          container.appendChild(createDieElement(null, true));
        } else {
          const color = getRandomColor();
          container.appendChild(createDieElement(color));
        }
      }
    }

    function formatChance(p) {
      let decimals = 3;
      if (p > 0 && p < 0.01) decimals = 5;
      let s = p.toFixed(decimals);
      if (s.includes('.')) {
        s = s.replace(/0+$/, '');
        if (s.endsWith('.')) s = s.slice(0, -1);
      }
      return s;
    }

    // Renders the real odds for the currently-selected dice count, fetched
    // from the server (see fetchMatchChances above). These always match
    // what /api/roll can actually produce — there's no separate "display"
    // table that disagrees with the real generator.
    async function updateMatchChances() {
      const n = parseInt(document.getElementById('diceCount').value);
      const container = document.getElementById('chanceSection');

      let chances;
      try {
        chances = await fetchMatchChances(n);
      } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="chance-pill">Could not load odds from server</div>';
        return;
      }

      container.innerHTML = '';
      chances.forEach(({ k, prob }) => {
        const row = document.createElement('div');
        row.className = 'chance-row';

        const squares = document.createElement('div');
        squares.className = 'chance-squares';
        const squareCount = Math.max(n, k);
        for (let i = 0; i < squareCount; i++) {
          const sq = document.createElement('div');
          sq.className = 'chance-square' + (i < k ? ' filled' : '');
          squares.appendChild(sq);
        }
        row.appendChild(squares);

        const pill = document.createElement('div');
        pill.className = 'chance-pill';
        pill.innerText = k + ' DICE MATCHING: ' + formatChance(prob) + '%';
        row.appendChild(pill);

        container.appendChild(row);
      });
    }

    async function rollDice() {
      if (isRolling) return;
      
      const count = parseInt(document.getElementById('diceCount').value);
      const isFast = document.getElementById('rollModeToggle').checked;

      let rolledResults;
      try {
        rolledResults = await rollFromServer(count);
      } catch (e) {
        console.error(e);
        alert('Could not reach the dice server. Please try again.');
        return;
      }
      if (isFast) {
        const container = document.getElementById('diceContainer');
        container.innerHTML = '';
        rolledResults.forEach(color => {
          container.appendChild(createDieElement(color, false));
        });

        playRandomSpraySound();
        updateRollStats(rolledResults);
        recordRoll(playerId, rolledResults);
        
        rollsToday++;
        document.getElementById('rollsTodayCount').innerText = rollsToday;
        return;
      }

      // Обычный режим с анимацией
      isRolling = true;

      const overlay = document.getElementById('rollOverlay');
      const overlayContainer = document.getElementById('overlayDiceContainer');
      const rollBtn = document.getElementById('rollBtn');

      rollBtn.disabled = true;
      overlayContainer.innerHTML = '';
      
      rolledResults.forEach(rolledColor => {
        const dieEl = createDieElement(rolledColor, true);
        dieEl.classList.add('initial-shake');
        overlayContainer.appendChild(dieEl);
      });

      overlay.classList.remove('hidden');

      // Звук проигрывается сразу в момент нажатия, а не после анимации.
      playDiceRollSound();

      setTimeout(() => {
        overlay.classList.add('hidden');
        
        const container = document.getElementById('diceContainer');
        container.innerHTML = '';
        rolledResults.forEach(color => {
          container.appendChild(createDieElement(color, false));
        });

        updateRollStats(rolledResults);
        recordRoll(playerId, rolledResults);

        // Если выпало ровно 4 кубика — дополнительно проигрываем уведомление.
        if (count === 4) {
          playUltraFinishSound();
        }
        
        rollsToday++;
        document.getElementById('rollsTodayCount').innerText = rollsToday;

        isRolling = false;
        rollBtn.disabled = false;
      }, 1200);
    }

    async function rollDiceUltra() {
      if (isRolling) return;
      
      const count = parseInt(document.getElementById('diceCount').value);
      const isFast = document.getElementById('rollModeToggle').checked;

      let rolledResults;
      try {
        rolledResults = await rollFromServer(count);
      } catch (e) {
        console.error(e);
        alert('Could not reach the dice server. Please try again.');
        return;
      }
      if (isFast) {
        const container = document.getElementById('diceContainer');
        container.innerHTML = '';
        rolledResults.forEach(color => {
          container.appendChild(createDieElement(color, false));
        });

        playRandomSpraySound();
        updateRollStats(rolledResults);
        recordRoll(playerId, rolledResults);

        rollsToday += 2;
        document.getElementById('rollsTodayCount').innerText = rollsToday;
        return;
      }

      // Обычный режим Ультра — кости появляются по одной, каждые 1-2 секунды,
      // каждая со своим звуком приземления (jet-set-radio-spray-1).
      isRolling = true;

      const overlay = document.getElementById('rollOverlay');
      const overlayContainer = document.getElementById('overlayDiceContainer');
      const megaBtn = document.getElementById('megaBtn');

      megaBtn.disabled = true;
      overlayContainer.innerHTML = '';
      overlay.classList.remove('hidden');

      // Все кости появляются сразу в "ожидающем" сером/трясущемся состоянии...
      const pendingEls = rolledResults.map(() => {
        const dieEl = createDieElement({ name: '', hex: '#555555' }, true);
        dieEl.style.transform = 'scale(1.2)';
        dieEl.classList.add('initial-shake');
        dieEl.style.visibility = 'hidden';
        overlayContainer.appendChild(dieEl);
        return dieEl;
      });
      // ...но раскрываются одна за другой.
      pendingEls.forEach(el => { el.style.visibility = 'visible'; });

      function revealDie(index) {
        if (index >= rolledResults.length) {
          // Все кости показаны — короткая пауза, затем финальное уведомление.
          setTimeout(() => {
            overlay.classList.add('hidden');

            const container = document.getElementById('diceContainer');
            container.innerHTML = '';
            rolledResults.forEach(color => {
              container.appendChild(createDieElement(color, false));
            });

            playUltraFinishSound();
            updateRollStats(rolledResults);
            recordRoll(playerId, rolledResults);

            rollsToday += 2;
            document.getElementById('rollsTodayCount').innerText = rollsToday;

            isRolling = false;
            megaBtn.disabled = false;
          }, 500);
          return;
        }

        const dieEl = pendingEls[index];
        const color = rolledResults[index];
        const dieBox = dieEl.querySelector('.die');
        const label = dieEl.querySelector('.die-label');

        dieBox.classList.remove('die-rolling');
        dieBox.style.backgroundColor = color.hex;
        dieEl.classList.remove('initial-shake');
        if (label) {
          label.innerText = color.name;
          label.style.color = color.hex;
        }

        // Кубик 1 -> spray-1, кубик 2 -> spray-2, кубик 3 -> spray-3,
        // кубик 4 -> spray-4, дальше звуки идут по кругу.
        playUltraDieSound(index);

        // Следующая кость появится через 2-3 секунды.
        const gap = 2000 + Math.random() * 1000;
        setTimeout(() => revealDie(index + 1), gap);
      }

      setTimeout(() => revealDie(0), 600);
    }

    function updateRollStats(results) {
      results.forEach(color => {
        colorStats[color.name]++;
      });

      historyData.unshift(results);
      if (historyData.length > 25) historyData.pop();

      const statsRow = document.getElementById('rollStatsRow');
      statsRow.innerHTML = '';
      DICE_COLORS.forEach(c => {
        const chip = document.createElement('div');
        chip.className = 'stat-chip';
        chip.innerHTML = `<div class="stat-chip-dot" style="background:${c.hex}"></div> ${c.name}: ${colorStats[c.name]}`;
        statsRow.appendChild(chip);
      });

      const historyList = document.getElementById('inlineHistoryList');
      historyList.innerHTML = '';
      historyData.forEach((rollGroup, idx) => {
        const row = document.createElement('div');
        row.className = 'history-row';
        row.innerHTML = `<span style="font-size:12px; opacity:0.6;">#${idx+1}</span>`;
        rollGroup.forEach(c => {
          const mini = document.createElement('div');
          mini.className = 'mini-die';
          mini.style.backgroundColor = c.hex;
          mini.innerHTML = `<div class="mini-die-dot"></div>`;
          row.appendChild(mini);
        });
        historyList.appendChild(row);
      });
    }

    // ── PLAYER ID (persistent) & ROLL LOG BY ID ──
    // The "ID: XXXXXXXX" no longer changes every roll — one ID is generated
    // once per browser and kept in localStorage. Every roll made under that
    // ID is stored (last 25 per ID), so typing an ID into the search box
    // pulls up that player's last 25 rolls, even after a page refresh.
    let playerId = null;
    let rollHistoryByPlayer = {};
    const PLAYER_ID_KEY = 'azulDicePlayerId';
    const ROLL_LOG_KEY = 'azulDiceRollLog';
    const ROLL_LOG_MAX_PER_ID = 25;

    function getOrCreatePlayerId() {
      let id = null;
      try {
        id = localStorage.getItem(PLAYER_ID_KEY);
      } catch (e) {}
      if (!id) {
        id = generateGameId();
        try { localStorage.setItem(PLAYER_ID_KEY, id); } catch (e) {}
      }
      return id;
    }

    function loadRollLog() {
      try {
        const raw = localStorage.getItem(ROLL_LOG_KEY);
        rollHistoryByPlayer = raw ? JSON.parse(raw) : {};
      } catch (e) {
        rollHistoryByPlayer = {};
      }
    }

    function saveRollLog() {
      try {
        localStorage.setItem(ROLL_LOG_KEY, JSON.stringify(rollHistoryByPlayer));
      } catch (e) {
        // Storage unavailable/full — the log just won't persist across reloads.
      }
    }

    function recordRoll(id, colors) {
      if (!rollHistoryByPlayer[id]) rollHistoryByPlayer[id] = [];
      rollHistoryByPlayer[id].unshift({ colors: colors, time: Date.now() });
      if (rollHistoryByPlayer[id].length > ROLL_LOG_MAX_PER_ID) {
        rollHistoryByPlayer[id].length = ROLL_LOG_MAX_PER_ID;
      }
      saveRollLog();
    }

    function toggleSearchIdBox() {
      const box = document.getElementById('searchIdBox');
      const resultBox = document.getElementById('searchIdResult');
      box.classList.toggle('hidden');
      if (!box.classList.contains('hidden')) {
        document.getElementById('searchIdInput').focus();
      } else {
        resultBox.innerHTML = '';
      }
    }

    function searchRollById() {
      const input = document.getElementById('searchIdInput');
      const resultBox = document.getElementById('searchIdResult');
      const query = (input.value || '').trim().toUpperCase();
      resultBox.innerHTML = '';
      if (!query) return;

      const found = rollHistoryByPlayer[query];
      if (!found || found.length === 0) {
        const notFound = document.createElement('div');
        notFound.className = 'search-id-not-found';
        notFound.innerText = `No roll found for ID "${query}"`;
        resultBox.appendChild(notFound);
        return;
      }

      const header = document.createElement('div');
      header.style.opacity = '0.7';
      header.style.fontSize = '12px';
      header.style.marginBottom = '4px';
      header.innerText = `Last ${found.length} roll(s) for ID "${query}":`;
      resultBox.appendChild(header);

      found.forEach((entry, idx) => {
        const card = document.createElement('div');
        card.className = 'search-id-result-card';

        const label = document.createElement('span');
        label.style.opacity = '0.7';
        label.innerText = `#${idx + 1}:`;
        card.appendChild(label);

        entry.colors.forEach(c => {
          const mini = document.createElement('div');
          mini.className = 'mini-die';
          mini.style.backgroundColor = c.hex;
          mini.innerHTML = `<div class="mini-die-dot"></div>`;
          card.appendChild(mini);
        });

        resultBox.appendChild(card);
      });
    }

    function adjustCounter(key, val) {
      const state = counterState[key];
      state.value += val;
      const display = document.getElementById('mainCounter_' + key);
      display.innerText = (state.value >= 0 ? '+' : '') + state.value;
    }

    // The two icon buttons per counter work like +1 / -1 but also leave
    // their picture as a faint watermark behind the number, and keep their
    // own tally (per counter) of how many times each one was pressed.
    function adjustCounterIcon(key, type) {
      const state = counterState[key];
      if (type === 'plus') {
        state.plusClicks++;
        adjustCounter(key, 1);
        document.getElementById('plusIconCount_' + key).innerText = state.plusClicks;
        pulseCounterBg('counterBgPlus_' + key);
      } else {
        state.minusClicks++;
        adjustCounter(key, -1);
        document.getElementById('minusIconCount_' + key).innerText = state.minusClicks;
        pulseCounterBg('counterBgMinus_' + key);
      }
    }

    function pulseCounterBg(id) {
      const el = document.getElementById(id);
      el.classList.add('show', 'pulse');
      setTimeout(() => el.classList.remove('pulse'), 250);
    }

    function toggleBlurMode() {
      isBlurMode = !isBlurMode;
      const btn = document.getElementById('blurToggleBtn');
      const container = document.getElementById('diceContainer');
      if (isBlurMode) {
        btn.innerText = 'BLUR ON';
        btn.style.background = '#27ae60';
        container.classList.add('blur-mode');
      } else {
        btn.innerText = 'BLUR OFF';
        btn.style.background = '#e74c3c';
        container.classList.remove('blur-mode');
      }
    }

    function openSettings() {
      document.getElementById('settingsModal').classList.add('active');
    }

    function closeSettings() {
      document.getElementById('settingsModal').classList.remove('active');
    }

    // Builds a rich, "shimmering" background: two soft moving highlight
    // layers stacked on top of the theme's own multi-color gradient. All
    // three layers share the same animGradient keyframes, so the glints
    // sweep across the gradient as it flows.
    function buildShimmerBackground(gradientCss) {
      return [
        'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.28), transparent 40%)',
        'radial-gradient(circle at 78% 75%, rgba(255,255,255,0.18), transparent 45%)',
        gradientCss
      ].join(', ');
    }

    const THEME_KEY = 'azulDiceTheme';

    function saveTheme(type, val) {
      try {
        localStorage.setItem(THEME_KEY, JSON.stringify({ type, val }));
      } catch (e) {
        // Storage unavailable — theme just won't persist across reloads.
      }
    }

    function loadSavedTheme() {
      try {
        const raw = localStorage.getItem(THEME_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    // Default accent palette (matches the inline style on <html>). Used to
    // reset the site-wide look when switching away from an Immersive Theme
    // back to a regular background.
    const DEFAULT_ACCENT = {
      accent: '#FFD700',
      accentDark: '#D4AF37',
      panelBorder: 'rgba(255, 255, 255, 0.6)',
      panelBg: 'rgba(15, 15, 15, 0.85)'
    };

    function setAccentVars(a) {
      const root = document.documentElement;
      root.style.setProperty('--theme-accent', a.accent);
      root.style.setProperty('--theme-accent-dark', a.accentDark);
      root.style.setProperty('--theme-panel-border', a.panelBorder);
      root.style.setProperty('--theme-panel-bg', a.panelBg);
    }

    // Immersive Themes are a separate category from the regular background
    // cards: picking one re-skins accent colors, panel borders, and panel
    // backgrounds across the ENTIRE site, not just the page background.
    const IMMERSIVE_THEMES = {
      'imm-neon-inferno': {
        gradient: 'linear-gradient(135deg, #1a0033, #ff0059, #ff8c00, #1a0033)',
        accent: '#ff2f6d', accentDark: '#6a0022', panelBorder: '#ff2f6d', panelBg: 'rgba(26,0,20,0.88)',
        emojis: ['🔥', '⚡', '🌋', '💥']
      },
      'imm-cyber-grid': {
        gradient: 'linear-gradient(135deg, #00050f, #0033ff, #00e5ff, #7b2fff)',
        accent: '#00e5ff', accentDark: '#002b6a', panelBorder: '#00e5ff', panelBg: 'rgba(0,7,20,0.88)',
        emojis: ['🤖', '💻', '⚡', '🛰️']
      },
      'imm-toxic-jungle': {
        gradient: 'linear-gradient(135deg, #041a05, #1e8c1e, #d4ff00, #041a05)',
        accent: '#d4ff00', accentDark: '#1e5e1e', panelBorder: '#a6ff00', panelBg: 'rgba(3,15,3,0.88)',
        emojis: ['🍃', '☠️', '🐍', '🧪']
      },
      'imm-royal-eclipse': {
        gradient: 'linear-gradient(135deg, #0d0015, #3a0d5e, #b8860b, #ffd700)',
        accent: '#ffd700', accentDark: '#3a0d5e', panelBorder: '#ffd700', panelBg: 'rgba(13,0,21,0.88)',
        emojis: ['👑', '✨', '🌙', '💎']
      },
      'imm-arctic-pulse': {
        gradient: 'linear-gradient(135deg, #00131a, #0083b0, #90e0ef, #ffffff)',
        accent: '#90e0ef', accentDark: '#005f73', panelBorder: '#90e0ef', panelBg: 'rgba(0,15,20,0.88)',
        emojis: ['❄️', '🧊', '✨', '⛄']
      },
      'imm-void-walker': {
        gradient: 'linear-gradient(135deg, #000000, #2b0033, #ff00e5, #000000)',
        accent: '#ff00e5', accentDark: '#2b0033', panelBorder: '#ff00e5', panelBg: 'rgba(0,0,0,0.9)',
        emojis: ['👻', '💀', '🌌', '🦇']
      }
    };

    // Populates the floating emoji layer with the given theme's motif and
    // turns on the neon-pulse effects (immersive-active class). Called only
    // when an Immersive Theme is selected.
    function renderImmersiveDecor(emojis) {
      const el = document.getElementById('immersiveDecor');
      if (!el) return;
      el.innerHTML = '';
      const count = 16;
      for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.className = 'immersive-emoji';
        span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        span.style.left = Math.random() * 96 + '%';
        span.style.top = Math.random() * 92 + '%';
        span.style.fontSize = (16 + Math.random() * 22) + 'px';
        span.style.animationDuration = (7 + Math.random() * 8) + 's';
        span.style.animationDelay = (Math.random() * -8) + 's';
        el.appendChild(span);
      }
      document.body.classList.add('immersive-active');
    }

    // Clears the emoji layer and turns off the neon-pulse effects. Called
    // whenever a regular (non-Immersive) theme is picked.
    function clearImmersiveDecor() {
      const el = document.getElementById('immersiveDecor');
      if (el) el.innerHTML = '';
      document.body.classList.remove('immersive-active');
    }

    function applyImmersiveTheme(key, cardEl, persist = true) {
      const t = IMMERSIVE_THEMES[key];
      if (!t) return;

      document.querySelectorAll('.bg-card').forEach(c => c.classList.remove('active-bg'));
      if (cardEl) cardEl.classList.add('active-bg');

      const body = document.getElementById('bodyTag');
      body.classList.add('bg-animated');
      body.style.backgroundImage = buildShimmerBackground(t.gradient);

      setAccentVars(t);
      renderImmersiveDecor(t.emojis);

      if (persist) saveTheme('immersive', key);
    }

    function applyTheme(type, val, cardEl, persist = true) {
      const body = document.getElementById('bodyTag');

      document.querySelectorAll('.bg-card').forEach(c => c.classList.remove('active-bg'));
      if (cardEl) cardEl.classList.add('active-bg');

      if (type === 'static') {
        body.classList.remove('bg-animated');
        body.style.backgroundColor = val;
        body.style.backgroundImage = 'none';
      } else if (type === 'animated') {
        body.classList.add('bg-animated');
        body.style.backgroundImage = buildShimmerBackground(val);
      }

      // Regular themes always use the default site-wide accent look —
      // only Immersive Themes change accent colors, panel borders, etc.
      setAccentVars(DEFAULT_ACCENT);
      clearImmersiveDecor();

      if (persist) saveTheme(type, val);
    }

    function changeFont(fontCss) {
      document.body.style.fontFamily = fontCss;
    }

    function changeVolume(val) {
      soundVolume = parseFloat(val) / 100;
      diceRollSound.volume = soundVolume;
      document.getElementById('volumeVal').innerText = val;
    }

    function toggleAnonMode() {
      isAnonMode = !isAnonMode;
      const logo = document.getElementById('headerLogo');
      const btn = document.getElementById('anonModeBtn');
      const title = document.getElementById('rollTitle');
      if (isAnonMode) {
        logo.src = ANON_LOGO_SRC;
        btn.classList.add('active');
        if (title) title.textContent = 'Protected';
      } else {
        logo.src = NORMAL_LOGO_SRC;
        btn.classList.remove('active');
        if (title) title.textContent = 'Roll Color Dice';
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      loadRollLog();
      playerId = getOrCreatePlayerId();
      document.getElementById('gameIdDisplay').innerText = playerId;

      // Restore the previously chosen background instead of always resetting
      // to the default gradient.
      const savedTheme = loadSavedTheme();
      if (savedTheme && savedTheme.type === 'immersive' && savedTheme.val) {
        const matchingCard = document.querySelector('[data-theme-key="' + savedTheme.val + '"]');
        applyImmersiveTheme(savedTheme.val, matchingCard, false);
      } else if (savedTheme && savedTheme.type && savedTheme.val) {
        const matchingCard = Array.from(document.querySelectorAll('.bg-card'))
          .find(c => (c.getAttribute('onclick') || '').includes(savedTheme.val));
        applyTheme(savedTheme.type, savedTheme.val, matchingCard, false);
      }

      // On first load the dice show as plain gray until the player rolls.
      renderInitialDice(true);
      updateMatchChances();
      updateRollStats([]);
    });

    // ── INTRO GATE ──
    // Simple splash screen shown before the game. Dismissing it just hides
    // the overlay — it doesn't gate any functionality.
    function dismissIntroGate() {
      const gate = document.getElementById('introGate');
      if (gate) gate.classList.add('hidden');
    }
