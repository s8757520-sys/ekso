/**
 * Файл: useWebSocket.jsx
 * Дата: 2026-09-07
 * Назначение: Хук для управления WebSocket-соединением с бэкендом Ekso
 * Описание: Подключается к wss://ekso.me/ws, обрабатывает события открытия, закрытия, ошибок и сообщений.
 * Добавлено: автоматическое переподключение (reconnect) при обрыве связи.
 * Добавлено: window.lastMessage для отладки.
 * Добавлено: lastChatMessage для отдельного потока чатов.
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

  const connect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    console.log(`🔄 Подключение к WebSocket (попытка ${reconnectAttemptsRef.current + 1})...`);
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
      console.log('❌ WebSocket отключён. Код:', event.code, 'Причина:', event.reason);
      setIsConnected(false);
      if (event.code !== 1000) {
        attemptReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('⚠️ WebSocket ошибка:', error);
      if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
        attemptReconnect();
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        window.lastMessage = data;
        console.log('📩 WebSocket raw message:', data);
        setLastMessage(data);

        // Отдельно сохраняем chat_message, чтобы не потерять его
        if (data.type === 'chat_message') {
          setLastChatMessage(data);
        }
      } catch (e) {
        console.error('❌ Ошибка парсинга сообщения:', e);
      }
    };
  };

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Достигнуто максимальное количество попыток переподключения.');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 30000);
    console.log(`⏳ Переподключение через ${delay}мс (попытка ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

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
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Компонент размонтирован');
      }
    };
  }, [url]);

  const sendMessage = (type, payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
      return true;
    } else {
      console.warn('⚠️ WebSocket не открыт, сообщение не отправлено');
      return false;
    }
  };

  return {
    isConnected,
    lastMessage,
    lastChatMessage,
    sendMessage,
    ws: wsRef.current
  };
};
