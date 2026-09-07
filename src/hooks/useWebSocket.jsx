/**
 * Файл: useWebSocket.jsx
 * Дата: 2026-09-07
 * Назначение: Хук для управления WebSocket-соединением с бэкендом Ekso
 * Описание: Подключается к wss://ekso.me/ws, обрабатывает события открытия, закрытия, ошибок и сообщений.
 * Добавлено: автоматическое переподключение (reconnect) при обрыве связи.
 * Автор: Ekso Team
 */

import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url = 'wss://ekso.me/ws') => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  const connect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Уже подключены
    }

    console.log(`🔄 Подключение к WebSocket (попытка ${reconnectAttemptsRef.current + 1})...`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket подключён к', url);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Сброс попыток при успешном подключении
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onclose = (event) => {
      console.log('❌ WebSocket отключён. Код:', event.code, 'Причина:', event.reason);
      setIsConnected(false);

      // Автоматическое переподключение, если не было явного закрытия (код 1000)
      if (event.code !== 1000) {
        attemptReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('⚠️ WebSocket ошибка:', error);
      // При ошибке тоже пробуем переподключиться
      if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
        attemptReconnect();
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
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

  return { isConnected, lastMessage, sendMessage, ws: wsRef.current };
};
