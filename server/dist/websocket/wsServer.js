"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWS = initWS;
exports.broadcast = broadcast;
const ws_1 = require("ws");
const clients = new Set();
function initWS(server) {
    const wss = new ws_1.WebSocketServer({ server });
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
function broadcast(payload) {
    const msg = JSON.stringify(payload);
    clients.forEach(client => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(msg);
        }
    });
}
//# sourceMappingURL=wsServer.js.map