/**
 * File: WebSocketContext.jsx
 * Date: 2026-09-08
 * Purpose: Единый WebSocket-провайдер для всего приложения
 * Description: Обеспечивает одно соединение для всех компонентов
 * Author: Ekso Team
 */

import { createContext, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, url = 'wss://ekso.me/ws' }) => {
  const wsData = useWebSocket(url);
  
  return (
    <WebSocketContext.Provider value={wsData}>
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