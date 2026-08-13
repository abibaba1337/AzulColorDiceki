(function () {
    const overlay = document.getElementById('devtoolsBlockOverlay');

    function showBlockScreen() {
        overlay.classList.add('active');
        document.documentElement.style.overflow = 'hidden';
    }

    // Блокировка правой кнопки мыши (контекстное меню)
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // Блокировка горячих клавиш: F12, Ctrl+Shift+I/J/C, Ctrl+U
    document.addEventListener('keydown', function (e) {
        const key = e.key ? e.key.toUpperCase() : '';

        // F12
        if (e.keyCode === 123 || key === 'F12') {
            e.preventDefault();
            showBlockScreen();
            return;
        }

        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools, консоль, инспектор элемента)
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key)) {
            e.preventDefault();
            showBlockScreen();
            return;
        }

        // Cmd+Opt+I / Cmd+Opt+J / Cmd+Opt+C (macOS)
        if (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(key)) {
            e.preventDefault();
            showBlockScreen();
            return;
        }

        // Ctrl+U (просмотр исходного кода страницы)
        if (e.ctrlKey && key === 'U') {
            e.preventDefault();
            return;
        }
    });

    // Дополнительная эвристика: определение открытых DevTools по разнице размеров окна
    // (срабатывает, если DevTools открыты как отдельная панель внутри окна браузера)
    const threshold = 160;
    setInterval(function () {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        if (widthDiff > threshold || heightDiff > threshold) {
            showBlockScreen();
        }
    }, 500);
})();
