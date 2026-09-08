```jsx
/**
 * Файл: ChatScreen.jsx
 * Дата: 2026-09-08
 * Назначение: Интерфейс чата с WebSocket-интеграцией
 * Описание: Отображает сообщения, отправляет и получает сообщения через WebSocket.
 * Добавлено: защита от повторного добавления сообщений.
 * Добавлено: защита от повторной обработки старого lastChatMessage.
 * Автор: Ekso Team
 */

import { useState, useEffect, useRef } from 'react';
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
   * Здесь храним ID WebSocket-событий, которые уже обработали
   * в текущем экземпляре ChatScreen.
   */
  const processedEventIdsRef = useRef(new Set());

  /*
   * Формируем стабильный ключ сообщения.
   *
   * Если сервер присылает messageId — используем его.
   * Если нет — строим ключ из отправителя, получателя,
   * timestamp и текста.
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

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);

          console.log(
            `📂 Загружено ${parsed.length} сообщений из localStorage`
          );
        }
      } catch (e) {
        console.error('Ошибка загрузки истории:', e);
      }
    }
  }, [storageKey]);

  /*
   * Сохраняем историю.
   */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        storageKey,
        JSON.stringify(messages)
      );
    }
  }, [messages, storageKey]);

  /*
   * Получение сообщений через WebSocket.
   */
  useEffect(() => {
    if (!lastChatMessage) return;

    const payload = lastChatMessage.payload;

    if (!payload) return;

    /*
     * Очень важно:
     * если ChatScreen размонтировался и потом открылся снова,
     * Context может содержать старое lastChatMessage.
     *
     * Поэтому событие с таким _eventId обрабатываем только один раз.
     */
    const eventId = lastChatMessage._eventId;

    if (eventId && processedEventIdsRef.current.has(eventId)) {
      console.log(
        '♻️ WebSocket-событие уже обработано, пропускаем:',
        eventId
      );
      return;
    }

    if (eventId) {
      processedEventIdsRef.current.add(eventId);
    }

    console.log(
      '📩 ChatScreen получил chat_message:',
      payload
    );

    const messageKey = getMessageKey(payload);

    console.log('🔍 CHAT FILTER:', {
      nickname: JSON.stringify(nickname),
      recipient: JSON.stringify(recipient),
      from: JSON.stringify(payload.from),
      to: JSON.stringify(payload.to),
      toMatch: payload.to === nickname,
      fromMatch: payload.from === recipient,
      messageKey
    });

    /*
     * Сообщение должно относиться к этому чату.
     */
    const isForThisChat =
      payload.to === nickname ||
      payload.from === recipient;

    if (!isForThisChat) {
      console.log(
        '⚠️ Сообщение не для этого чата, игнорируем'
      );
      return;
    }

    /*
     * Если сообщение уже есть в текущем массиве,
     * повторно его не добавляем.
     *
     * Проверяем messageKey.
     */
    setMessages(prev => {
      if (
        messageKey &&
        prev.some(msg => msg.messageKey === messageKey)
      ) {
        console.log(
          '♻️ Сообщение уже существует в истории, пропускаем:',
          messageKey
        );

        return prev;
      }

      /*
       * Дополнительная защита для серверного echo
       * собственного сообщения.
       *
       * Если мы уже добавили такое сообщение локально,
       * серверное echo не должно создавать второй экземпляр.
       */
      if (
        payload.from === nickname &&
        prev.some(
          msg =>
            msg.sender === 'me' &&
            msg.text === payload.text &&
            (
              !payload.timestamp ||
              Math.abs(
                Number(msg.timestampMs || 0) -
                Number(payload.timestamp)
              ) < 10000
            )
        )
      ) {
        console.log(
          '♻️ Сервер вернул наше сообщение, дубль пропускаем'
        );

        return prev;
      }

      const timestamp =
        payload.timestamp || Date.now();

      const newMessage = {
        id: messageKey || `${Date.now()}_${Math.random()}`,
        messageKey,
        text: payload.text || 'Сообщение',
        sender: payload.from === nickname ? 'me' : 'them',
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
        '📩 Сообщение добавлено в чат:',
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
     * Создаём уникальный ID сообщения.
     *
     * Если сервер сохранит messageId и вернёт его обратно,
     * это даст идеальную дедупликацию.
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
      text,
      sender: 'me',
      time,
      timestampMs: timestamp
    };

    /*
     * Сначала показываем сообщение локально,
     * чтобы интерфейс не ждал сервер.
     */
    setMessages(prev => {
      if (
        prev.some(msg => msg.messageKey === messageKey)
      ) {
        return prev;
      }

      return [...prev, newMessage];
    });

    /*
     * Отправляем тот же messageId серверу.
     *
     * Если сервер его возвращает в payload,
     * ChatScreen сможет однозначно определить echo.
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
     * Если WebSocket внезапно оказался закрыт,
     * локально добавленное сообщение лучше удалить,
     * поскольку сервер его не получил.
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
```
