/**
 * Файл: ChatScreen.jsx
 * Дата: 2026-09-08
 * Назначение: Интерфейс чата с WebSocket-интеграцией
 * Описание: Отображает сообщения, отправляет и получает сообщения через WebSocket.
 * Автор: Ekso Team
 */

import { useState, useEffect } from 'react';
import { useWebSocketContext } from '../../../context/WebSocketContext';

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

  const {
    isConnected,
    sendMessage,
    lastChatMessage
  } = useWebSocketContext();

  const displayName = recipientDisplayName || recipient;
  const avatarUrl = getFullAvatarUrl(recipientAvatar);

  const chatId = `chat_${[nickname, recipient].sort().join('_')}`;
  const storageKey = `messages_${chatId}`;

  /*
   * Формируем стабильный ключ сообщения.
   *
   * Если сервер присылает messageId — используем его.
   * Если нет — используем отправителя, получателя,
   * timestamp и текст.
   */
  const getMessageKey = (payload) => {
    if (!payload) return null;

    if (payload.messageId) {
      return `message_${payload.messageId}`;
    }

    return [
      payload.from || '',
      payload.to || '',
      payload.timestamp || '',
      payload.text || ''
    ].join('|');
  };

  /*
   * Загружаем историю чата.
   */
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      setMessages([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setMessages(parsed);

        console.log(
          `📂 Загружено ${parsed.length} сообщений из localStorage`
        );
      }
    } catch (e) {
      console.error('Ошибка загрузки истории:', e);
      setMessages([]);
    }
  }, [storageKey]);

  /*
   * Сохраняем историю.
   */
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(messages)
    );
  }, [messages, storageKey]);

  /*
   * Получение сообщений через WebSocket.
   *
   * ВАЖНО:
   * lastChatMessage хранится в Context.
   * Поэтому при новом входе в ChatScreen он может содержать
   * старое сообщение.
   *
   * Мы НЕ добавляем его, если такое сообщение уже есть
   * в истории этого чата.
   */
  useEffect(() => {
    if (!lastChatMessage) return;

    const payload = lastChatMessage.payload;

    if (!payload) return;

    console.log(
      '📩 ChatScreen получил chat_message:',
      payload
    );

    /*
     * Проверяем, относится ли сообщение к открытому чату.
     */
    const isForThisChat =
      (payload.from === recipient &&
        payload.to === nickname) ||
      (payload.from === nickname &&
        payload.to === recipient);

    if (!isForThisChat) {
      console.log(
        '⚠️ Сообщение не для этого чата, игнорируем'
      );
      return;
    }

    const messageKey = getMessageKey(payload);

    if (!messageKey) {
      return;
    }

    console.log(
      '🔑 Ключ сообщения:',
      messageKey
    );

    setMessages(prev => {

      /*
       * =====================================================
       * ГЛАВНАЯ ЗАЩИТА ОТ ДУБЛИКАТОВ
       * =====================================================
       *
       * Проверяем уже существующие сообщения.
       *
       * Поэтому не имеет значения, сколько раз ChatScreen
       * был открыт заново.
       */
      const alreadyExists = prev.some(msg => {

        /*
         * Основная проверка.
         */
        if (
          msg.messageKey &&
          msg.messageKey === messageKey
        ) {
          return true;
        }

        /*
         * Проверка по messageId.
         */
        if (
          payload.messageId &&
          msg.messageId &&
          msg.messageId === payload.messageId
        ) {
          return true;
        }

        /*
         * Защита старых сообщений,
         * которые были сохранены до появления messageKey.
         */
        if (
          msg.text === payload.text &&
          msg.from === payload.from &&
          msg.to === payload.to &&
          msg.timestampMs &&
          payload.timestamp &&
          Math.abs(
            Number(msg.timestampMs) -
            Number(payload.timestamp)
          ) < 2000
        ) {
          return true;
        }

        return false;
      });

      /*
       * Уже есть — ничего не добавляем.
       */
      if (alreadyExists) {
        console.log(
          '♻️ Сообщение уже есть в истории — пропускаем:',
          messageKey
        );

        return prev;
      }

      /*
       * =====================================================
       * ЗАЩИТА ОТ ECHO НАШЕГО СООБЩЕНИЯ
       * =====================================================
       */
      if (payload.from === nickname) {

        const ownMessageExists = prev.some(msg => {

          if (msg.sender !== 'me') {
            return false;
          }

          if (msg.text !== payload.text) {
            return false;
          }

          if (!payload.timestamp || !msg.timestampMs) {
            return false;
          }

          return (
            Math.abs(
              Number(msg.timestampMs) -
              Number(payload.timestamp)
            ) < 10000
          );
        });

        if (ownMessageExists) {
          console.log(
            '♻️ Сервер вернул наше сообщение — пропускаем'
          );

          return prev;
        }
      }

      /*
       * =====================================================
       * НОВОЕ СООБЩЕНИЕ
       * =====================================================
       */

      const timestamp =
        payload.timestamp || Date.now();

      const newMessage = {
        id: messageKey,
        messageKey,
        messageId: payload.messageId || null,

        from: payload.from || '',
        to: payload.to || '',

        text: payload.text || 'Сообщение',

        sender:
          payload.from === nickname
            ? 'me'
            : 'them',

        time: new Date(timestamp).toLocaleTimeString(
          'ru-RU',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        ),

        timestampMs: timestamp
      };

      console.log(
        '📩 НОВОЕ сообщение добавлено в чат:',
        newMessage
      );

      return [...prev, newMessage];
    });

  }, [lastChatMessage, nickname, recipient]);

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

  /*
   * Отправка сообщения.
   */
  const sendMessageHandler = () => {
    const text = input.trim();

    if (!text || !isConnected) {
      return;
    }

    const now = new Date();
    const timestamp = now.getTime();

    /*
     * Уникальный ID сообщения.
     */
    const messageId =
      `${nickname}_${timestamp}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    const messageKey =
      `message_${messageId}`;

    const time =
      now.getHours().toString().padStart(2, '0') +
      ':' +
      now.getMinutes().toString().padStart(2, '0');

    const newMessage = {
      id: messageKey,
      messageKey,
      messageId,

      from: nickname,
      to: recipient,

      text,
      sender: 'me',
      time,
      timestampMs: timestamp
    };

    /*
     * Сначала показываем сообщение локально.
     */
    setMessages(prev => {

      if (
        prev.some(
          msg => msg.messageKey === messageKey
        )
      ) {
        return prev;
      }

      return [...prev, newMessage];
    });

    /*
     * Отправляем сообщение серверу.
     */
    const sent = sendMessage('chat_message', {
      messageId,
      from: nickname,
      to: recipient,
      text,
      chatId,
      timestamp,
    });

    /*
     * Если отправка не удалась —
     * удаляем оптимистическое сообщение.
     */
    if (!sent) {
      setMessages(prev =>
        prev.filter(
          msg => msg.messageKey !== messageKey
        )
      );

      return;
    }

    setInput('');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--bg-primary)] rounded-xl overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="bg-[var(--bg-secondary)] px-3 sm:px-4 py-3 border-b border-[var(--border-color)] flex items-center gap-3 flex-shrink-0">

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">
            {displayName}
          </div>

          <div
            className={`text-[10px] sm:text-xs ${
              isConnected
                ? 'text-green-500'
                : 'text-gray-400'
            }`}
          >
            ● {isConnected ? t.online : t.offline}
          </div>
        </div>

        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg sm:text-xl">
          📞
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-1">

        {messages.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] text-sm mt-10">
            {isConnected
              ? 'Напишите первое сообщение'
              : 'Подключение к серверу...'}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'me'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2 shadow-sm ${
                msg.sender === 'me'
                  ? 'bg-[var(--bg-chat-mine)] text-[var(--text-primary)] rounded-2xl rounded-br-sm'
                  : 'bg-[var(--bg-chat-theirs)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm'
              }`}
            >
              <p className="text-sm sm:text-base leading-relaxed">
                {msg.text}
              </p>

              <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mt-1">
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="bg-[var(--bg-secondary)] p-2 sm:p-3 flex items-center gap-2 border-t border-[var(--border-color)] flex-shrink-0">

        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg sm:text-xl px-1">
          😊
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 px-3 sm:px-4 py-2 bg-[var(--bg-primary)] rounded-full outline-none text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessageHandler();
            }
          }}
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
