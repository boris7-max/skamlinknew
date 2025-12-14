// Управление навигацией
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация навигации
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pageId = button.getAttribute('data-page');
            
            // Обновляем активные кнопки
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Показываем активную страницу
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === pageId) {
                    page.classList.add('active');
                }
            });
            
            // Если открываем историю - обновляем ее
            if (pageId === 'history-page') {
                loadHistory();
            }
            
            // Прокручиваем вверх
            window.scrollTo(0, 0);
        });
    });
    
    // Загружаем историю при загрузке
    loadHistory();
});

// Управление историей
let history = JSON.parse(localStorage.getItem('multitool_history') || '[]');

function saveHistory() {
    localStorage.setItem('multitool_history', JSON.stringify(history));
}

function addToHistory(text, type, extra = '') {
    const historyItem = {
        id: Date.now(),
        text: text,
        type: type,
        extra: extra,
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    history.unshift(historyItem);
    if (history.length > 50) history = history.slice(0, 50);
    saveHistory();
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    history = JSON.parse(localStorage.getItem('multitool_history') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">История пуста</p>';
        return;
    }
    
    let html = '';
    history.forEach(item => {
        let icon = '📝';
        let color = 'var(--accent-purple)';
        
        switch(item.type) {
            case 'standoff': icon = '🎮'; color = 'var(--accent-orange)'; break;
            case 'link': icon = '🔗'; color = 'var(--accent-purple)'; break;
            case 'md5': icon = '🔐'; color = 'var(--accent-green)'; break;
        }
        
        html += `
            <div class="history-item" style="border-left-color: ${color}">
                <div style="flex: 1;">
                    <div class="history-text">${icon} ${item.text}</div>
                    <div class="history-meta">${item.timestamp} ${item.extra ? ' • ' + item.extra : ''}</div>
                </div>
                <div class="history-actions">
                    <button class="history-btn copy-history" data-text="${item.text}">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="history-btn delete-history" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
    
    // Вешаем обработчики на кнопки истории
    document.querySelectorAll('.copy-history').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-text');
            copyToClipboard(text);
            showToast('Скопировано в буфер обмена!');
        });
    });
    
    document.querySelectorAll('.delete-history').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            history = history.filter(item => item.id !== id);
            saveHistory();
            loadHistory();
            showToast('Запись удалена из истории');
        });
    });
}

// Кнопки управления историей
document.getElementById('clear-history-btn')?.addEventListener('click', () => {
    if (confirm('Очистить всю историю?')) {
        history = [];
        saveHistory();
        loadHistory();
        showToast('История очищена');
    }
});

document.getElementById('refresh-history-btn')?.addEventListener('click', () => {
    loadHistory();
    showToast('История обновлена');
});

// Standoff функция
document.getElementById('standoff-btn')?.addEventListener('click', () => {
    const text = document.getElementById('standoff-text').value.trim();
    const displayText = text || 'Запуск Standoff 2';
    
    if (text) {
        addToHistory(text, 'standoff');
    } else {
        addToHistory('Запуск Standoff 2', 'standoff');
    }
    
    // Пытаемся открыть игру
    const deepLink = 'standoff2://';
    const storeLink = 'https://play.google.com/store/apps/details?id=com.axlebolt.standoff2';
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(storeLink, '_blank');
    }, 1000);
    
    showToast('Пытаемся открыть Standoff 2...');
    
    // Очищаем поле
    document.getElementById('standoff-text').value = '';
});

// Генерация фейковых ссылок
function generateFakeLink(platform) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    
    function randomString(length, alphabet) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        return result;
    }
    
    const platformNames = {
        youtube: ['gaming', 'music', 'vlog', 'tutorial', 'review', 'live'],
        telegram: ['channel', 'chat', 'bot', 'group', 'news'],
        instagram: ['photo', 'reel', 'story', 'post', 'carousel'],
        tiktok: ['dance', 'comedy', 'lifehack', 'tutorial', 'trend']
    };
    
    const randomName = platformNames[platform][Math.floor(Math.random() * platformNames[platform].length)];
    
    switch(platform) {
        case 'youtube':
            return `https://youtube.com/watch?v=${randomString(11, chars)}&t=${Math.floor(Math.random() * 300)}s`;
        case 'telegram':
            return `https://t.me/${randomName}_${randomString(6, lowerChars)}`;
        case 'instagram':
            return `https://instagram.com/p/${randomString(11, chars)}/`;
        case 'tiktok':
            return `https://tiktok.com/@${randomName}_user/video/${Math.floor(Math.random() * 10000000000000000000)}`;
        default:
            return '';
    }
}

document.getElementById('generate-link-btn')?.addEventListener('click', () => {
    const platform = document.getElementById('platform-select').value;
    const link = generateFakeLink(platform);
    
    document.getElementById('generated-link').textContent = link;
    document.getElementById('link-result').classList.remove('hidden');
    
    // Сохраняем в историю
    addToHistory(link, 'link', platform);
});

document.getElementById('copy-link-btn')?.addEventListener('click', () => {
    const link = document.getElementById('generated-link').textContent;
    copyToClipboard(link);
    showToast('Ссылка скопирована!');
});

// ИСПРАВЛЕННАЯ генерация MD5 (меньше нулей)
function generateMD5(text) {
    if (!text || !text.trim()) {
        // Генерация случайного MD5 с минимумом нулей
        const chars = '123456789abcdef'; // исключаем '0'
        let hash = '';
        
        // Первые 4 символа - буквы
        for (let i = 0; i < 4; i++) {
            hash += 'abcdef'[Math.floor(Math.random() * 6)];
        }
        
        // Остальные - смесь букв и цифр (но не 0)
        for (let i = 0; i < 28; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return hash;
    }
    
    // Реализация простого хэша для текста
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    
    // Создаем хэш из текста
    let hash1 = simpleHash(text);
    let hash2 = simpleHash(text + 'salt' + Date.now());
    
    // Преобразуем в hex и комбинируем
    let hexHash = (hash1.toString(16) + hash2.toString(16));
    
    // Убираем нули в начале
    hexHash = hexHash.replace(/^0+/, '');
    
    // Добавляем случайные буквы если нужно
    const letters = 'abcdef';
    if (hexHash.length < 32) {
        const needed = 32 - hexHash.length;
        for (let i = 0; i < needed; i++) {
            hexHash = letters[Math.floor(Math.random() * 6)] + hexHash;
        }
    }
    
    // Обрезаем до 32 символов
    return hexHash.substring(0, 32);
}

document.getElementById('generate-md5-btn')?.addEventListener('click', () => {
    const text = document.getElementById('md5-text').value;
    const hash = generateMD5(text);
    
    document.getElementById('generated-md5').textContent = hash;
    document.getElementById('md5-result').classList.remove('hidden');
    
    // Сохраняем в историю
    const displayText = text ? `${text.substring(0, 20)}${text.length > 20 ? '...' : ''}` : 'случайный хэш';
    addToHistory(hash, 'md5', displayText);
    
    // Очищаем поле
    document.getElementById('md5-text').value = '';
});

document.getElementById('copy-md5-btn')?.addEventListener('click', () => {
    const hash = document.getElementById('generated-md5').textContent;
    copyToClipboard(hash);
    showToast('MD5 хэш скопирован!');
});

// Вспомогательные функции
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Не удалось скопировать текст:', err);
        }
        document.body.removeChild(textArea);
        return Promise.resolve();
    }
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Глобальные функции
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;
