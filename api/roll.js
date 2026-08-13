// Эта функция выполняется на сервере Vercel, а не в браузере пользователя.
// Игрок никогда не видит и не может подменить логику ниже — он лишь
// получает готовый результат в JSON-ответе.

const COLORS = ['#ffe600', '#ff6600', '#00e676', '#2979ff', '#d500f9', '#ff0044'];
const REPEAT_PENALTY = 0.156;
const MAX_DICE = 4; // жёсткий предел — клиент не может запросить больше

function getIndependentRandomColors(count) {
    const usedCounts = {};
    COLORS.forEach((c) => { usedCounts[c] = 0; });

    const result = [];
    for (let i = 0; i < count; i++) {
        const weights = COLORS.map((c) => Math.pow(REPEAT_PENALTY, usedCounts[c]));
        const totalWeight = weights.reduce((a, b) => a + b, 0);

        let r = Math.random() * totalWeight; // серверный Math.random() — недоступен клиенту
        let chosenIndex = weights.length - 1;
        for (let j = 0; j < weights.length; j++) {
            if (r < weights[j]) {
                chosenIndex = j;
                break;
            }
            r -= weights[j];
        }

        const chosenColor = COLORS[chosenIndex];
        usedCounts[chosenColor]++;
        result.push(chosenColor);
    }
    return result;
}

export default function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Клиент может прислать желаемое число кубиков, но сервер жёстко
    // ограничивает его диапазоном 1..MAX_DICE — так нельзя ни "сломать"
    // ответ, ни запросить что-то за пределами того, что рисует UI.
    const requestedCount = Number(req.body && req.body.count);
    const count = Number.isInteger(requestedCount) && requestedCount > 0
        ? Math.min(requestedCount, MAX_DICE)
        : MAX_DICE;

    const colors = getIndependentRandomColors(count);

    // Не кэшировать — каждый запрос должен давать новый честный бросок
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ colors });
}
