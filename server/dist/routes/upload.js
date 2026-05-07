"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = __importDefault(require("../prisma/client"));
const wsServer_1 = require("../websocket/wsServer");
const router = (0, express_1.Router)();
// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed!'));
        }
    }
});
// POST /api/upload
router.post('/', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const isBulk = files.length > 3;
        let session = null;
        if (isBulk) {
            session = await client_1.default.uploadSession.create({
                data: {
                    fileCount: files.length,
                    status: 'processing'
                }
            });
        }
        const documents = [];
        // Process files
        for (const file of files) {
            const doc = await client_1.default.document.create({
                data: {
                    name: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype,
                    storagePath: file.path,
                    status: 'uploading',
                    sessionId: session?.id
                }
            });
            // Update to complete
            const updatedDoc = await client_1.default.document.update({
                where: { id: doc.id },
                data: { status: 'complete' }
            });
            (0, wsServer_1.broadcast)({
                event: 'file_progress',
                fileId: updatedDoc.id,
                name: updatedDoc.name,
                percent: 100,
                status: 'complete'
            });
            documents.push(updatedDoc);
        }
        if (isBulk && session) {
            // Update session
            await client_1.default.uploadSession.update({
                where: { id: session.id },
                data: {
                    status: 'done',
                    completedAt: new Date()
                }
            });
            // Create notification
            const notification = await client_1.default.notification.create({
                data: {
                    message: `${files.length} files uploaded successfully`,
                    type: 'success',
                    metadata: { sessionId: session.id, fileCount: files.length }
                }
            });
            (0, wsServer_1.broadcast)({
                event: 'bulk_complete',
                sessionId: session.id,
                fileCount: files.length,
                timestamp: new Date().toISOString(),
                notificationId: notification.id
            });
        }
        res.json(documents);
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/documents
router.get('/list', async (req, res) => {
    try {
        const docs = await client_1.default.document.findMany({
            orderBy: { uploadedAt: 'desc' }
        });
        res.json(docs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});
// GET /api/documents/:id/download
router.get('/:id/download', async (req, res) => {
    try {
        const doc = await client_1.default.document.findUnique({
            where: { id: req.params.id }
        });
        if (!doc)
            return res.status(404).json({ error: 'Document not found' });
        res.download(path_1.default.resolve(doc.storagePath), doc.name);
    }
    catch (error) {
        res.status(500).json({ error: 'Download failed' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map