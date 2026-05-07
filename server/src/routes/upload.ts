import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma/client';
import { broadcast } from '../websocket/wsServer';

const router = Router();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }
});

// POST /api/upload
router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const sessionId = req.body.sessionId || null;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const documents = [];

    for (const file of files) {
      // 1. Create record with "uploading" status (even if already written, per requirement)
      const doc = await prisma.document.create({
        data: {
          name: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          storagePath: file.path,
          status: 'uploading',
          sessionId: sessionId
        }
      });

      // 2. Update to "complete" and broadcast
      const updatedDoc = await prisma.document.update({
        where: { id: doc.id },
        data: { status: 'complete' }
      });

      broadcast({
        event: 'file_progress',
        fileId: updatedDoc.id,
        name: updatedDoc.name,
        percent: 100,
        status: 'complete'
      });

      documents.push(updatedDoc);
    }

    res.json(documents);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/documents
router.get('/list', async (req, res) => {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET /api/documents/:id/download
router.get('/:id/download', async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    res.download(path.resolve(doc.storagePath), doc.name);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

export default router;
