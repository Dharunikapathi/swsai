import { useEffect, useCallback } from 'react';

export function useWebSocket(onMessage: (data: any) => void) {
  const connect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WS message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server. Retrying in 3s...');
      setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    return ws;
  }, [onMessage]);

  useEffect(() => {
    const ws = connect();
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [connect]);
}
