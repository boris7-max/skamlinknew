// Управление вкладками
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация вкладок
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Обновляем активные кнопки
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Показываем активный контент
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
            
            // Если открываем историю - обновляем ее
            if (tabId === 'history') {
                loadHistory();
            }
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
    
    // Если открыта вкладка истории - обновляем
    if (document.querySelector('#history').classList.contains('active')) {
        loadHistory();
    }
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
            <div class="history-item">
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
    
    if (text) {
        addToHistory(text, 'standoff');
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
});

// Генерация фейковых ссылок
function generateFakeLink(platform) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    
    function randomString(length, alphabet) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        return result;
    }
    
    switch(platform) {
        case 'youtube':
            return `https://youtube.com/watch?v=${randomString(11, chars)}`;
        case 'telegram':
            return `https://t.me/${randomString(8 + Math.floor(Math.random() * 8), lowerChars)}`;
        case 'instagram':
            return `https://instagram.com/p/${randomString(11, chars)}`;
        case 'tiktok':
            return `https://tiktok.com/@user/video/${randomString(19, '0123456789')}`;
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

// MD5 генератор (упрощенный)
function generateMD5(text) {
    if (!text.trim()) {
        // Генерация случайного MD5
        const chars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < 32; i++) {
            hash += chars[Math.floor(Math.random() * 16)];
        }
        return hash;
    }
    
    // Простой хэш для демонстрации
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    // Преобразуем в hex
    let hexHash = Math.abs(hash).toString(16);
    while (hexHash.length < 32) {
        hexHash = '0' + hexHash;
    }
    return hexHash.substring(0, 32);
}

document.getElementById('generate-md5-btn')?.addEventListener('click', () => {
    const text = document.getElementById('md5-text').value;
    const hash = generateMD5(text);
    
    document.getElementById('generated-md5').textContent = hash;
    document.getElementById('md5-result').classList.remove('hidden');
    
    // Сохраняем в историю
    addToHistory(hash, 'md5', text || 'случайный хэш');
});

document.getElementById('copy-md5-btn')?.addEventListener('click', () => {
    const hash = document.getElementById('generated-md5').textContent;
    copyToClipboard(hash);
    showToast('MD5 хэш скопирован!');
});

// Вспомогательные функции
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
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

// Глобальная функция копирования
window.copyToClipboard = copyToClipboard;