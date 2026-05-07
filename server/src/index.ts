import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { initWS } from './websocket/wsServer';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Serve uploads folder
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// Routes
app.use('/api/upload', uploadRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize WebSocket
initWS(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
