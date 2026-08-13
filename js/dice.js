// ВАЖНО: раньше цвет выбирался прямо в браузере через Math.random() —
// это можно было подделать через консоль (переопределить Math.random
// или вызывать функцию генерации в цикле, пока не выпадет нужный цвет).
// Теперь браузер только ПРОСИТ сервер бросить кубики (/api/roll) и
// получает уже готовый результат. Сам цвет клиенту недоступен и
// подделать его через DevTools нельзя.

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Сравнивает два броска (массивы цветов) на полное совпадение по порядку
function isSameRoll(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    return a.every((color, i) => color === b[i]);
}

// Запрашивает у сервера результат броска для count кубиков.
// Вся логика взвешивания и сам Math.random() теперь выполняются на
// сервере (см. api/roll.js) — клиент лишь получает готовый массив цветов.
async function requestRollFromServer(count) {
    const res = await fetch('/api/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
    });

    if (!res.ok) {
        throw new Error('Сервер не смог сгенерировать бросок');
    }

    const data = await res.json();
    return data.colors;
}

// Просит сервер бросить кубики; если результат случайно совпал с
// предыдущим броском в истории — переспрашивает ещё раз (не больше
// нескольких попыток), чтобы визуально не повторяться подряд.
// Это чисто косметическая проверка: honesty броска обеспечивается тем,
// что цвет уже выбран сервером, а не тем, что здесь происходит дальше.
async function getRollDifferentFromLast(count) {
    const lastRoll = rollHistory.length > 0 ? rollHistory[0] : null;
    let result = await requestRollFromServer(count);
    let attempts = 0;
    while (isSameRoll(result, lastRoll) && attempts < 3) {
        result = await requestRollFromServer(count);
        attempts++;
    }
    return result;
}

function registerNewRoll(randomizedColors) {
    rollHistory.unshift(randomizedColors);
    if (rollHistory.length > 5) {
        rollHistory.pop();
    }
    updateHistoryUI();
}

async function rollDice() {
    if (isRolling) return;
    playSound(soundFastSelect.value);

    const diceElements = document.querySelectorAll('.dice');
    let randomizedColors;
    try {
        randomizedColors = await getRollDifferentFromLast(diceElements.length);
    } catch (err) {
        console.error('Не удалось получить бросок с сервера:', err);
        return;
    }

    diceElements.forEach((dice, index) => {
        dice.style.transform = 'scale(0.9)';
        setTimeout(() => {
            dice.style.backgroundColor = randomizedColors[index];
            dice.style.transform = 'scale(1)';
        }, 80);
    });

    streak++;
    document.getElementById('streakCount').innerText = streak;
    registerNewRoll(randomizedColors);
}

async function rollMega() {
    if (isRolling) return;
    isRolling = true;

    const overlay = document.getElementById('megaOverlay');
    const diceElements = document.querySelectorAll('.dice');

    let randomizedColors;
    try {
        randomizedColors = await getRollDifferentFromLast(diceElements.length);
    } catch (err) {
        console.error('Не удалось получить бросок с сервера:', err);
        isRolling = false;
        return;
    }

    overlay.classList.add('active');

    // Увеличили задержку и время покачивания, чтобы кубики крутились медленнее
    const stepDelay = 1100;
    const shakeDuration = 700;

    diceElements.forEach((dice, index) => {
        setTimeout(() => {
            dice.classList.add('shake');
        }, index * stepDelay);

        setTimeout(() => {
            dice.classList.remove('shake');
            dice.style.backgroundColor = randomizedColors[index];
            dice.classList.add('pop');
            playSound(soundMegaSelect.value);

            setTimeout(() => {
                dice.classList.remove('pop');
                dice.style.transform = 'scale(1) rotate(0deg)';
            }, 400);

        }, index * stepDelay + shakeDuration);
    });

    const totalTime = (diceElements.length * stepDelay) + 400;
    setTimeout(() => {
        overlay.classList.remove('active');
        streak++;
        document.getElementById('streakCount').innerText = streak;
        isRolling = false;
        registerNewRoll(randomizedColors);
    }, totalTime);
}
