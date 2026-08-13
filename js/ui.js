const settingsBtn = document.getElementById('settingsToggleBtn');
const settingsModalOverlay = document.getElementById('settingsModalOverlay');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');

settingsBtn.addEventListener('click', () => settingsModalOverlay.classList.add('active'));
settingsCloseBtn.addEventListener('click', () => settingsModalOverlay.classList.remove('active'));
settingsModalOverlay.addEventListener('click', (e) => {
    if (e.target === settingsModalOverlay) settingsModalOverlay.classList.remove('active');
});

// --- УПРАВЛЕНИЕ КУРСОРOM ---
const cursorToggle = document.getElementById('cursorToggle');
const savedCursor = localStorage.getItem('customCursor') !== 'false';
cursorToggle.checked = savedCursor;
if (!savedCursor) document.body.classList.remove('custom-cursor');

cursorToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('custom-cursor');
        localStorage.setItem('customCursor', 'true');
    } else {
        document.body.classList.remove('custom-cursor');
        localStorage.setItem('customCursor', 'false');
    }
});

// --- ВЫБОР И ЗАГРУЗКА ШРИФТА ---
const fontSelect = document.getElementById('fontSelect');
const customFontOption = document.getElementById('customFontOption');
const savedFont = localStorage.getItem('appFont') || "'Poppins', 'Segoe UI', sans-serif";
const savedCustomFontData = localStorage.getItem('customFontData');

function applyFont(font) {
    document.documentElement.style.setProperty('--app-font', font);
    localStorage.setItem('appFont', font);
}

function loadCustomFont(fontDataUrl) {
    const fontFace = new FontFace('CustomUserFont', `url(${fontDataUrl})`);
    fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        customFontOption.style.display = 'block';
        fontSelect.value = "'CustomUserFont', sans-serif";
        applyFont("'CustomUserFont', sans-serif");
    }).catch(err => console.error('Ошибка загрузки шрифта:', err));
}

if (savedCustomFontData) loadCustomFont(savedCustomFontData);
fontSelect.value = savedFont;
applyFont(savedFont);

fontSelect.addEventListener('change', (e) => applyFont(e.target.value));

document.getElementById('fontFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const fontUrl = event.target.result;
            localStorage.setItem('customFontData', fontUrl);
            loadCustomFont(fontUrl);
        };
        reader.readAsDataURL(file);
    }
});

// --- ТЕМЫ И ФОНЫ ---
const savedPlayerTitle = localStorage.getItem('playerTitle');
const savedTheme = localStorage.getItem('appTheme') || 'black';
const savedFastSound = localStorage.getItem('appFastSound') || 'crystal';
const savedMegaSound = localStorage.getItem('appMegaSound') || 'pop';
let customBgImage = localStorage.getItem('customBgImage');

if (savedPlayerTitle) document.getElementById('playerTitle').innerText = savedPlayerTitle;

// --- Данные фонов для красивого выбора ---
const staticThemes = [
    { id: 'black', label: 'Чёрная классика', color: '#1a1a1a' },
    { id: 'static-red', label: 'Красный', color: '#ff4d4d' },
    { id: 'static-yellow', label: 'Жёлтый', color: '#ffe066' },
    { id: 'static-green', label: 'Зелёный', color: '#00e676' },
    { id: 'static-blue', label: 'Синий', color: '#2979ff' },
    { id: 'static-purple', label: 'Фиолетовый', color: '#d500f9' },
    { id: 'static-orange', label: 'Оранжевый', color: '#ff6600' },
    { id: 'static-teal', label: 'Бирюзовый', color: '#00e5cc' },
    { id: 'static-pink', label: 'Розовый', color: '#ff0080' },
    { id: 'static-cyan', label: 'Циан', color: '#00e5ff' },
    { id: 'static-lime', label: 'Лайм', color: '#aeea00' },
    { id: 'static-crimson', label: 'Малиновый', color: '#dc003c' },
    { id: 'static-indigo', label: 'Индиго', color: '#5a3cff' },
    { id: 'static-gold', label: 'Золотой', color: '#ffbe00' },
    { id: 'static-silver', label: 'Серебро', color: '#d2dceb' },
    { id: 'static-mint', label: 'Мятный', color: '#00ffaa' },
    { id: 'static-violet', label: 'Виолет', color: '#a03cff' }
];

const animatedThemes = [
    { id: 'grad-aurora', label: 'Кибер-аврора', gradient: 'linear-gradient(-45deg, #022b28, #00ffaa, #7000ff, #00141f)' },
    { id: 'grad-neon-dusk', label: 'Неоновый закат', gradient: 'linear-gradient(-45deg, #330033, #ff0055, #ffcc00, #10002b)' },
    { id: 'grad-ultraviolet', label: 'Ультрафиолет', gradient: 'linear-gradient(-45deg, #15003b, #4d0099, #00d4ff, #050014)' },
    { id: 'grad-ocean', label: 'Глубокий океан', gradient: 'linear-gradient(-45deg, #000c1a, #004e92, #000000, #002d42)' },
    { id: 'grad-toxic', label: 'Токсичный', gradient: 'linear-gradient(-45deg, #081200, #418700, #a8ff00, #020800)' },
    { id: 'grad-cyber', label: 'Киберпанк', gradient: 'linear-gradient(-45deg, #032b2e, #008085, #ff007f, #001214)' },
    { id: 'grad-nebula', label: 'Небула', gradient: 'linear-gradient(-45deg, #0e032e, #3a0085, #aa00ff, #020014)' },
    { id: 'grad-emerald', label: 'Изумруд', gradient: 'linear-gradient(-45deg, #022e1f, #006644, #00ffd5, #00120b)' },
    { id: 'grad-gold', label: 'Золото', gradient: 'linear-gradient(-45deg, #2b2003, #664d00, #ffd700, #140f00)' },
    { id: 'grad-red', label: 'Красный рубин', gradient: 'linear-gradient(-45deg, #2b0408, #8a0c1e, #ff0044, #120204)' },
    { id: 'grad-yellow', label: 'Жёлто-оранж', gradient: 'linear-gradient(-45deg, #2e1c03, #852200, #ffaa00, #5e3c08)' },
    { id: 'grad-green', label: 'Зелёно-изумруд', gradient: 'linear-gradient(-45deg, #042412, #0c4d29, #00e676, #021a24)' },
    { id: 'grad-blue', label: 'Голубой кобальт', gradient: 'linear-gradient(-45deg, #03182e, #083b66, #00b7ff, #130836)' },
    { id: 'grad-sunset', label: 'Закат', gradient: 'linear-gradient(-45deg, #2e0322, #85004b, #ff5500, #40002b)' },
    { id: 'grad-galaxy', label: '🌌 Галактика', gradient: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25), transparent 22%), radial-gradient(circle at 75% 65%, rgba(180,120,255,0.25), transparent 25%), radial-gradient(circle at 50% 85%, rgba(0,200,255,0.2), transparent 20%), linear-gradient(-45deg, #04010f, #1b0038, #4b0082, #0a0020)' },
    { id: 'grad-holograph', label: '🌈 Голограмма', gradient: 'conic-gradient(from 180deg at 50% 50%, #ff00cc, #7000ff, #00d4ff, #00ffcc, #ffee00, #ff00cc)' },
    { id: 'grad-fire', label: '🔥 Пламя', gradient: 'linear-gradient(-45deg, #1a0500, #7a1900, #ff5500, #ffcc00, #330900)' },
    { id: 'grad-candy', label: '🍬 Сладкая вата', gradient: 'linear-gradient(-45deg, #ff9ecb, #a78bfa, #7dd3fc, #fecdd3)' },
    { id: 'grad-matrix', label: '💾 Матрица', gradient: 'linear-gradient(-45deg, #000800, #001f00, #00ff41, #000f00)' },
    { id: 'grad-royal', label: '👑 Роял', gradient: 'linear-gradient(-45deg, #1a0030, #4b0082, #ffd700, #1a0030)' },
    { id: 'grad-aqua-glass', label: '💠 Аква-стекло', gradient: 'linear-gradient(-45deg, #012430, #0077b6, #90e0ef, #012430)' },
    { id: 'grad-cosmic-rift', label: '🌀 Космический разлом', gradient: 'radial-gradient(circle at 50% 40%, rgba(0,229,255,0.35), transparent 30%), radial-gradient(circle at 30% 80%, rgba(170,0,255,0.25), transparent 25%), linear-gradient(-45deg, #050014, #16003d, #000000)' },
    { id: 'grad-lava', label: '🌋 Лава', gradient: 'linear-gradient(-45deg, #0a0300, #3d0a00, #ff3300, #0a0300)' },
    { id: 'grad-cherry-blossom', label: '🌸 Сакура', gradient: 'linear-gradient(-45deg, #ffd1dc, #ffe8f0, #c9b6ff, #ffd1dc)' },
    { id: 'grad-frost', label: '❄️ Иней', gradient: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3), transparent 25%), linear-gradient(-45deg, #021824, #0b4f6c, #a8dadc, #021824)' },
    { id: 'grad-vortex', label: '🌪️ Вихрь', gradient: 'conic-gradient(from 90deg at 50% 50%, #2b0057, #7000ff, #00d4ff, #ff00aa, #2b0057)' },
    { id: 'grad-mint-dream', label: '🌿 Мятная греза', gradient: 'linear-gradient(-45deg, #002420, #00695c, #1de9b6, #002420)' },
    { id: 'grad-northern-lights', label: '🌠 Северное сияние', gradient: 'radial-gradient(circle at 30% 20%, rgba(0,255,170,0.3), transparent 30%), radial-gradient(circle at 70% 60%, rgba(120,0,255,0.25), transparent 30%), linear-gradient(-45deg, #001a12, #003b2b, #00ffb3, #0a0026)' },
    { id: 'grad-volcanic', label: '🌋 Вулкан', gradient: 'linear-gradient(-45deg, #0d0000, #4a0000, #ff2200, #1a0a00)' },
    { id: 'grad-tropical', label: '🌴 Тропики', gradient: 'linear-gradient(-45deg, #003c3c, #00c9a7, #ffdd00, #ff5c8a)' },
    { id: 'grad-deep-space', label: '🌌 Глубокий космос', gradient: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.35), transparent 1%), radial-gradient(circle at 60% 70%, rgba(255,255,255,0.25), transparent 1%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2), transparent 1%), linear-gradient(-45deg, #000005, #05002e, #1a005c, #000005)' },
    { id: 'grad-cotton-clouds', label: '☁️ Облака', gradient: 'linear-gradient(-45deg, #a1c4fd, #c2e9fb, #fbc2eb, #a1c4fd)' },
    { id: 'grad-electric-storm', label: '⚡ Электрошторм', gradient: 'linear-gradient(-45deg, #10002b, #3d008f, #00eaff, #10002b)' },
    { id: 'grad-desert-dusk', label: '🏜️ Пустынный закат', gradient: 'linear-gradient(-45deg, #2b0d12, #7a1e3d, #ff7a3d, #ffcf5c)' },
    { id: 'grad-emerald-forest', label: '🌲 Изумрудный лес', gradient: 'linear-gradient(-45deg, #021a08, #0c3d1a, #35d97a, #021a08)' },
    { id: 'grad-crimson-tide', label: '🩸 Багровый прилив', gradient: 'linear-gradient(-45deg, #14000a, #4d001f, #b3002d, #14000a)' },
    { id: 'grad-honey-glow', label: '🍯 Медовое сияние', gradient: 'linear-gradient(-45deg, #2b1e00, #7a5200, #ffb700, #3d2900)' },
    { id: 'grad-arctic-wave', label: '🧊 Арктическая волна', gradient: 'linear-gradient(-45deg, #001a2b, #00588f, #48e5ff, #00121a)' }
];

const bgSwatchStatic = document.getElementById('bgSwatchStatic');
const bgSwatchAnimated = document.getElementById('bgSwatchAnimated');
const bgCustomPreview = document.getElementById('bgCustomPreview');
const bgRemoveCustomBtn = document.getElementById('bgRemoveCustomBtn');
let currentTheme = savedTheme;

function renderBgSwatches() {
    bgSwatchStatic.innerHTML = '';
    staticThemes.forEach(function(t) {
        const el = document.createElement('div');
        el.className = 'bg-swatch' + (currentTheme === t.id ? ' selected' : '');
        el.style.background = t.color;
        el.title = t.label;
        el.innerHTML = '<span>' + t.label + '</span>';
        el.addEventListener('click', function() { applyTheme(t.id); });
        bgSwatchStatic.appendChild(el);
    });

    bgSwatchAnimated.innerHTML = '';
    animatedThemes.forEach(function(t) {
        const el = document.createElement('div');
        el.className = 'bg-swatch animated-swatch' + (currentTheme === t.id ? ' selected' : '');
        el.style.backgroundImage = t.gradient;
        el.title = t.label;
        el.innerHTML = '<span>' + t.label + '</span>';
        el.addEventListener('click', function() { applyTheme(t.id); });
        bgSwatchAnimated.appendChild(el);
    });
}

function updateCustomBgPreview() {
    if (customBgImage) {
        bgCustomPreview.style.display = 'block';
        bgCustomPreview.style.backgroundImage = `url('${customBgImage}')`;
        bgRemoveCustomBtn.style.display = 'block';
    } else {
        bgCustomPreview.style.display = 'none';
        bgRemoveCustomBtn.style.display = 'none';
    }
}

function switchBgTab(tab) {
    document.querySelectorAll('.bg-tab-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-bgtab') === tab);
    });
    document.getElementById('bgTabStatic').style.display = tab === 'static' ? 'block' : 'none';
    document.getElementById('bgTabAnimated').style.display = tab === 'animated' ? 'block' : 'none';
    document.getElementById('bgTabCustom').style.display = tab === 'custom' ? 'block' : 'none';
}

function applyTheme(theme) {
    currentTheme = theme;
    document.body.className = cursorToggle.checked ? 'custom-cursor' : '';
    if (theme === 'custom' && customBgImage) {
        document.body.style.backgroundImage = `url('${customBgImage}')`;
    } else {
        document.body.style.backgroundImage = '';
        document.body.classList.add(`theme-${theme}`);
        if (theme.startsWith('grad-')) {
            document.body.classList.add('animated-gradient');
        }
    }
    localStorage.setItem('appTheme', theme);
    renderBgSwatches();
}

function removeCustomBg() {
    customBgImage = null;
    try { localStorage.removeItem('customBgImage'); } catch (err) {}
    updateCustomBgPreview();
    if (currentTheme === 'custom') {
        applyTheme('black');
        switchBgTab('static');
    }
}

renderBgSwatches();
updateCustomBgPreview();

if (customBgImage && savedTheme === 'custom') {
    applyTheme('custom');
    switchBgTab('custom');
} else {
    applyTheme(savedTheme);
    switchBgTab(savedTheme.startsWith('grad-') ? 'animated' : (savedTheme === 'custom' ? 'custom' : 'static'));
}

document.getElementById('bgFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const bgUrl = event.target.result;
            customBgImage = bgUrl;
            try {
                localStorage.setItem('customBgImage', bgUrl);
            } catch (err) {
                console.error('Не удалось сохранить фон (возможно, слишком большой файл):', err);
            }
            updateCustomBgPreview();
            applyTheme('custom');
        };
        reader.readAsDataURL(file);
    }
});
const soundFastSelect = document.getElementById('soundFastSelect');
const soundMegaSelect = document.getElementById('soundMegaSelect');

soundFastSelect.value = savedFastSound;
soundMegaSelect.value = savedMegaSound;

soundFastSelect.addEventListener('change', (e) => {
    localStorage.setItem('appFastSound', e.target.value);
    playSound(e.target.value);
});

soundMegaSelect.addEventListener('change', (e) => {
    localStorage.setItem('appMegaSound', e.target.value);
    playSound(e.target.value);
});

document.querySelectorAll('.editable').forEach(elem => {
    elem.addEventListener('blur', () => {
        localStorage.setItem(elem.id, elem.innerText.trim());
    });
    elem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            elem.blur();
        }
    });
});

// --- ДИНАМИЧЕСКИЕ ПРАВИЛА ---
let rulesData = JSON.parse(localStorage.getItem('appRules')) || [
    "Правило 1", "Правило 2", "Правило 3"
];

function renderRules() {
    const container = document.getElementById('ruleList');
    container.innerHTML = '';
    rulesData.forEach((ruleText, index) => {
        const item = document.createElement('div');
        item.className = 'rule-item';
        item.innerHTML = `
            <span class="rule-num">${index + 1}.</span>
            <span class="rule-text" contenteditable="true" onblur="updateRule(${index}, this.innerText)">${ruleText}</span>
            <button class="btn-remove-rule" onclick="deleteRule(${index})" data-tooltip="Удалить" aria-label="Удалить">✕</button>
        `;
        container.appendChild(item);
    });
}

function addRule() {
    rulesData.push("Новое правило");
    saveRules();
    renderRules();
}

function updateRule(index, newText) {
    rulesData[index] = newText.trim();
    saveRules();
}

function deleteRule(index) {
    rulesData.splice(index, 1);
    saveRules();
    renderRules();
}

function saveRules() {
    localStorage.setItem('appRules', JSON.stringify(rulesData));
}

renderRules();

// --- ДИНАМИЧЕСКИЕ ВОПРОСЫ И ОТВЕТЫ (Q&A) ---
let qaData = JSON.parse(localStorage.getItem('appQA')) || [
    { q: "How Color Dices work?", a: "Данные дайсы работают на сервере, подделать их через утилиты невозможно." },
    { q: "About us", a: "Лучшие колор дайсы от азулбека;) (Со временем будут обновления и добавления новых приколюх)" },
    { q: "Шансы выпадения", a: "При броске 4 кубиков цвета выбираются не полностью равновероятно: уже выпавший в этом броске цвет получает пониженный шанс появиться снова, поэтому совпадения — редкость.<br><br>Все 4 кубика разных цветов: <span style=\"color:#ffffff;\">≈ 78%</span><br>Ровно 2 кубика одного цвета: <span style=\"color:#ffffff;\">≈ 22%</span><br>Ровно 3 кубика одного цвета: <span style=\"color:#ffffff;\">≈ 0.07%</span><br>Все 4 кубика одного цвета: <span style=\"color:#ffffff;\">&lt; 0.01%</span><br><br>Значения приблизительные и могут немного отличаться от броска к броску." }
];

let qaOpenState = {};

function renderQA() {
    const container = document.getElementById('qaList');
    if (!container) return;
    container.innerHTML = '';
    qaData.forEach((item, index) => {
        const isOpen = !!qaOpenState[index];
        const el = document.createElement('div');
        el.className = 'qa-item' + (isOpen ? ' qa-open' : '');
        el.innerHTML = `
            <div class="qa-question-row" onclick="toggleQAOpen(${index})">
                <span class="qa-q-mark">Q:</span>
                <span class="qa-question">${item.q}</span>
                <span class="qa-toggle-arrow">▾</span>
            </div>
            <div class="qa-answer-wrap">
                <div class="qa-answer-row">
                    <span class="qa-a-mark">A:</span>
                    <span class="qa-answer">${item.a}</span>
                </div>
            </div>
        `;
        container.appendChild(el);
    });
}

function toggleQAOpen(index) {
    qaOpenState[index] = !qaOpenState[index];
    renderQA();
}

function saveQA() {
    localStorage.setItem('appQA', JSON.stringify(qaData));
}

renderQA();

function toggleMinimize(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.toggle('minimized');

    const isMin = panel.classList.contains('minimized');
    const arrowId = panelId.replace('Panel', 'Arrow');
    const arrow = document.getElementById(arrowId);
    if (arrow) arrow.innerText = isMin ? '▸' : '▾';
}

function hidePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('hidden');
}

function showAllPanels() {
    ['rulesPanel', 'colorsPanel'].forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.classList.remove('hidden');
    });
}

function switchSettingsTab(tab) {
    const isVisual = tab === 'visual';
    document.getElementById('tabVisual').classList.toggle('active', isVisual);
    document.getElementById('tabTechnical').classList.toggle('active', !isVisual);
    document.getElementById('tabBtnVisual').classList.toggle('active', isVisual);
    document.getElementById('tabBtnTechnical').classList.toggle('active', !isVisual);
}

function resetPanels() {
    ['rulesPanel', 'colorsPanel'].forEach(id => {
        const panel = document.getElementById(id);
        if (!panel) return;
        panel.classList.remove('hidden', 'minimized', 'draggable');
        panel.style.left = '';
        panel.style.top = '';

        const arrowId = id.replace('Panel', 'Arrow');
        const arrow = document.getElementById(arrowId);
        if (arrow) arrow.innerText = '▾';
    });
}

function makeDraggable(panelId, headerId) {
    const panel = document.getElementById(panelId);
    const header = document.getElementById(headerId);

    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        const rect = panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        if (!panel.classList.contains('draggable')) {
            panel.classList.add('draggable');
            panel.style.left = rect.left + 'px';
            panel.style.top = rect.top + 'px';
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        x = Math.max(10, Math.min(window.innerWidth - panel.offsetWidth - 10, x));
        y = Math.max(10, Math.min(window.innerHeight - panel.offsetHeight - 10, y));
        panel.style.left = x + 'px';
        panel.style.top = y + 'px';
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
}

makeDraggable('rulesPanel', 'rulesHeader');
makeDraggable('colorsPanel', 'colorsHeader');

// --- ОБНОВЛЕНИЕ ИСТОРИИ БРОСКОВ В ИНТЕРФЕЙСЕ ---
function updateHistoryUI() {
    const thisRollContainer = document.getElementById('historyThisRoll');
    const prevListContainer = document.getElementById('historyPreviousList');

    if (rollHistory.length > 0) {
        thisRollContainer.innerHTML = rollHistory[0].map(c => `<div class="mini-dice" style="background: ${c};"></div>`).join('');
    }

    let prevHtml = '';
    for (let i = 1; i < rollHistory.length; i++) {
        const dicesHtml = rollHistory[i].map(c => `<div class="mini-dice" style="background: ${c};"></div>`).join('');
        prevHtml += `
            <div class="history-row">
                <span class="history-index">${i + 1}.</span>
                <div class="history-dices">${dicesHtml}</div>
            </div>
        `;
    }
    prevListContainer.innerHTML = prevHtml;
}
