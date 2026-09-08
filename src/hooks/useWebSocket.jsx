/**
 * Файл: useWebSocket.jsx
 * Дата: 2026-09-08
 * Назначение: Хук для управления WebSocket-соединением с бэкендом Ekso
 * Описание: Подключается к wss://ekso.me/ws, обрабатывает события открытия,
 * закрытия, ошибок и сообщений.
 * Добавлено: автоматическое переподключение (reconnect) при обрыве связи.
 * Добавлено: window.lastMessage для отладки.
 * Добавлено: lastChatMessage для отдельного потока чатов.
 * Добавлено: защита от повторной обработки одного и того же chat_message.
 * Автор: Ekso Team
 */

import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url = 'wss://ekso.me/ws') => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [lastChatMessage, setLastChatMessage] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  // Последний chat_message получает уникальный eventId.
  // Это позволяет ChatScreen отличать новое событие от старого.
  const chatMessageCounterRef = useRef(0);

  const connect = () => {
    if (
      wsRef.current &&
      (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      )
    ) {
      return;
    }

    console.log(
      `🔄 Подключение к WebSocket (попытка ${reconnectAttemptsRef.current + 1})...`
    );

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket подключён к', url);

      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onclose = (event) => {
      console.log(
        '❌ WebSocket отключён. Код:',
        event.code,
        'Причина:',
        event.reason
      );

      // Не меняем состояние от старого сокета,
      // если уже существует новое соединение.
      if (wsRef.current === ws) {
        wsRef.current = null;
        setIsConnected(false);
      }

      if (event.code !== 1000) {
        attemptReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('⚠️ WebSocket ошибка:', error);

      if (
        wsRef.current === ws &&
        ws.readyState !== WebSocket.OPEN &&
        ws.readyState !== WebSocket.CLOSING &&
        ws.readyState !== WebSocket.CLOSED
      ) {
        attemptReconnect();
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        window.lastMessage = data;

        console.log('📩 WebSocket raw message:', data);

        setLastMessage(data);

        if (data.type === 'chat_message') {
          chatMessageCounterRef.current += 1;

          /*
           * Создаём новый объект, а не просто сохраняем data.
           * eventId существует только внутри клиента и обозначает
           * именно факт получения этого WebSocket-события.
           */
          const chatEvent = {
            ...data,
            _eventId: `${Date.now()}_${chatMessageCounterRef.current}`,
          };

          setLastChatMessage(chatEvent);
        }
      } catch (e) {
        console.error('❌ Ошибка парсинга сообщения:', e);
      }
    };
  };

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error(
        '❌ Достигнуто максимальное количество попыток переподключения.'
      );
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(
      1000 * Math.pow(1.5, reconnectAttemptsRef.current),
      30000
    );

    console.log(
      `⏳ Переподключение через ${delay}мс ` +
      `(попытка ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connect();
    }, delay);
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const ws = wsRef.current;

      if (ws) {
        // Убираем обработчики перед закрытием,
        // чтобы старый сокет не влиял на новое состояние.
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;

        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close(1000, 'Компонент размонтирован');
        }

        wsRef.current = null;
      }

      setIsConnected(false);
    };
  }, [url]);

  const sendMessage = (type, payload) => {
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          type,
          payload,
        })
      );

      return true;
    }

    console.warn('⚠️ WebSocket не открыт, сообщение не отправлено');
    return false;
  };

  return {
    isConnected,
    lastMessage,
    lastChatMessage,
    sendMessage,
    ws: wsRef.current,
  };
};
