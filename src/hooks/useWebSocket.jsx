/**
 * Файл: useWebSocket.jsx
 * Дата: 2026-09-03
 * Назначение: Хук для управления WebSocket-соединением с бэкендом Ekso
 * Описание: Подключается к wss://ekso.me/ws, обрабатывает события открытия, закрытия, ошибок и сообщений.
 * Автор: Ekso Team
 */

import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url = 'wss://ekso.me/ws') => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket подключён к', url);
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('❌ WebSocket отключён');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('⚠️ WebSocket ошибка:', error);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error('❌ Ошибка парсинга сообщения:', e);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
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