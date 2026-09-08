/**
 * File: WebSocketContext.jsx
 * Date: 2026-09-08
 * Purpose: Единый WebSocket-провайдер для всего приложения
 * Description: Обеспечивает одно соединение для всех компонентов
 * Author: Ekso Team
 * Updated: Хранит все входящие сообщения в очереди
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, url = 'wss://ekso.me/ws' }) => {
  const { isConnected, sendMessage, lastMessage, ws } = useWebSocket(url);
  const [messageQueue, setMessageQueue] = useState([]);

  // Добавляем каждое новое сообщение в очередь
  useEffect(() => {
    if (lastMessage) {
      setMessageQueue(prev => [...prev, lastMessage]);
    }
  }, [lastMessage]);

  // Очищаем очередь после обработки (опционально)
  const clearQueue = () => {
    setMessageQueue([]);
  };

  return (
    <WebSocketContext.Provider value={{ 
      isConnected, 
      sendMessage, 
      lastMessage, 
      ws,
      messageQueue,
      clearQueue
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};
