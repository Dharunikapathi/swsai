import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';

type WSListener = (data: any) => void;

interface WSContextValue {
  subscribe: (listener: WSListener) => () => void;
  isConnected: boolean;
}

const WSContext = createContext<WSContextValue | null>(null);

export const WSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<WSListener>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected (single context)');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        listenersRef.current.forEach(listener => listener(data));
      } catch (error) {
        console.error('Failed to parse WS message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting in 3s...');
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    wsRef.current = ws;
  }, []); // Removed connect from deps to avoid circular ref

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribe = useCallback((listener: WSListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  return (
    <WSContext.Provider value={{ subscribe, isConnected }}>
      {children}
    </WSContext.Provider>
  );
};

export function useWS(onMessage: (data: any) => void) {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error('useWS must be used within WSProvider');

  useEffect(() => {
    const unsub = ctx.subscribe(onMessage);
    return unsub;
  }, [ctx, onMessage]);

  return { isConnected: ctx.isConnected };
}
