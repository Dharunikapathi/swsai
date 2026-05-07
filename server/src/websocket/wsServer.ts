import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

const clients = new Set<WebSocket>();

export function initWS(server: Server) {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.add(ws);
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

export function broadcast(payload: object) {
  const msg = JSON.stringify(payload);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
