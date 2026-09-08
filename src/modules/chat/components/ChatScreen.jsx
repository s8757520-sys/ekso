/**
 * File: ChatScreen.jsx
 * Date: 2026-09-08
 * Purpose: Chat interface with WebSocket integration — с загрузкой истории
 * Description: Displays messages, sends/receives via WebSocket, loads history from server
 * Author: Ekso Team
 */

import { useState, useEffect } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';

const getFullAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('/avatars/')) return `https://ekso.me${avatar}`;
  return avatar;
};

const ChatScreen = ({ 
  lang = 'ru', 
  nickname = 'Гость', 
  recipient = 'alex',
  recipientDisplayName,
  recipientAvatar 
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const { isConnected, sendMessage, lastMessage } = useWebSocket();

  const displayName = recipientDisplayName || recipient;
  const avatarUrl = getFullAvatarUrl(recipientAvatar);
  
  // Формируем chatId
  const chatId = `chat_${[nickname, recipient].sort().join('_')}`;

  // ========== ЗАГРУЗКА ИСТОРИИ ПРИ ОТКРЫТИИ ЧАТА ==========
  useEffect(() => {
    if (isConnected && recipient && !historyLoaded) {
      console.log(`📤 Requesting history for ${chatId}`);
      sendMessage('get_history', { chatId });
      setHistoryLoaded(true);
    }
  }, [isConnected, recipient, chatId, historyLoaded]);

  // ========== ОБРАБОТКА ИСТОРИИ ОТ СЕРВЕРА ==========
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'get_history_result') {
      const payload = lastMessage.payload;
      if (payload.chatId === chatId && payload.history) {
        const historyMessages = payload.history.map((item, index) => ({
          id: index,
          text: item.text || 'Сообщение',
          sender: item.from === nickname ? 'me' : 'them',
          time: new Date(item.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(historyMessages);
        console.log(`📂 Загружено ${historyMessages.length} сообщений из истории`);
      }
    }
  }, [lastMessage, chatId, nickname]);

  // ========== ОБРАБОТКА ВХОДЯЩИХ СООБЩЕНИЙ ==========
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'chat_message') {
      const payload = lastMessage.payload;
      
      if (payload.to === nickname || payload.from === recipient) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: payload.text || 'Сообщение',
            sender: payload.from === nickname ? 'me' : 'them',
            time: new Date(payload.timestamp || Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [lastMessage, nickname, recipient]);

  const texts = {
    ru: {
      placeholder: 'Сообщение...',
      online: 'онлайн',
      offline: 'офлайн',
      back: '← Назад к чатам',
      title: 'Чат',
    },
    en: {
      placeholder: 'Message...',
      online: 'online',
      offline: 'offline',
      back: '← Back to chats',
      title: 'Chat',
    },
  };

  const t = texts[lang] || texts.ru;

  const sendMessageHandler = () => {
    if (!input.trim() || !isConnected) return;

    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: input,
        sender: 'me',
        time,
      },
    ]);

    sendMessage('chat_message', {
      from: nickname,
      to: recipient,
      text: input,
      chatId: chatId,
      timestamp: now.getTime(),
    });

    setInput('');
  };

  return (
    <div className="flex flex-col h-[400px] sm:h-[500px] md:h-[550px] bg-[var(--bg-primary)] rounded-xl overflow-hidden shadow-sm">
      {/* ШАПКА ЧАТА */}
      <div className="bg-[var(--bg-secondary)] px-3 sm:px-4 py-3 border-b border-[var(--border-color)] flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">
            {displayName}
          </div>
          <div className={`text-[10px] sm:text-xs ${isConnected ? 'text-green-500' : 'text-gray-400'}`}>
            ● {isConnected ? t.online : t.offline}
          </div>
        </div>
        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg sm:text-xl">📞</button>
      </div>

      {/* СООБЩЕНИЯ */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] text-sm mt-10">
            {isConnected ? 'Напишите первое сообщение' : 'Подключение к серверу...'}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2 shadow-sm ${
                msg.sender === 'me'
                  ? 'bg-[var(--bg-chat-mine)] text-[var(--text-primary)] rounded-2xl rounded-br-sm'
                  : 'bg-[var(--bg-chat-theirs)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm'
              }`}
            >
              <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>
              <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ПОЛЕ ВВОДА */}
      <div className="bg-[var(--bg-secondary)] p-2 sm:p-3 flex items-center gap-2 border-t border-[var(--border-color)] flex-shrink-0">
        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg sm:text-xl px-1">😊</button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 px-3 sm:px-4 py-2 bg-[var(--bg-primary)] rounded-full outline-none text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
          onKeyDown={(e) => e.key === 'Enter' && sendMessageHandler()}
        />
        <button
          onClick={sendMessageHandler}
          disabled={!isConnected || !input.trim()}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition text-sm sm:text-base ${
            isConnected && input.trim()
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
