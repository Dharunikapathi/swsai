"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const wsServer_1 = require("./websocket/wsServer");
const upload_1 = __importDefault(require("./routes/upload"));
const notifications_1 = __importDefault(require("./routes/notifications"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 4000;
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
}));
app.use(express_1.default.json());
// Serve uploads folder
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', uploadDir)));
// Routes
app.use('/api/documents', upload_1.default);
app.use('/api/notifications', notifications_1.default);
// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Initialize WebSocket
(0, wsServer_1.initWS)(server);
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map