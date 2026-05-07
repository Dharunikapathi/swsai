import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }
});

// Multer error handler middleware
function handleMulterError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large',
        message: 'Maximum file size is 10 MB. Please upload a smaller file.'
      });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}

// POST /api/documents
router.post('/', upload.array('files'), handleMulterError, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const isBulk = files.length > 3;
    let session = null;

    if (isBulk) {
      session = await prisma.uploadSession.create({
        data: {
          fileCount: files.length,
          status: 'processing'
        }
      });
    }

    const documents = [];

    // Process files
    for (const file of files) {
      const doc = await prisma.document.create({
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

    if (isBulk && session) {
      // Update session
      await prisma.uploadSession.update({
        where: { id: session.id },
        data: { 
          status: 'done',
          completedAt: new Date()
        }
      });

      // Create notification
      const notification = await prisma.notification.create({
        data: {
          message: `${files.length} files uploaded successfully`,
          type: 'success',
          metadata: { sessionId: session.id, fileCount: files.length }
        }
      });

      broadcast({
        event: 'bulk_complete',
        sessionId: session.id,
        fileCount: files.length,
        timestamp: new Date().toISOString(),
        notificationId: notification.id
      });
    }

    res.json(documents);
  } catch (error) {
    console.error('Upload error:', error);

    // Persist failure notification to DB and broadcast via WS
    try {
      const notification = await prisma.notification.create({
        data: {
          message: `Upload failed: ${error instanceof Error ? error.message : 'Internal server error'}`,
          type: 'error',
          metadata: { error: String(error) }
        }
      });
      broadcast({
        event: 'notification',
        notification: {
          id: notification.id,
          message: notification.message,
          type: notification.type,
          createdAt: notification.createdAt.toISOString()
        }
      });
    } catch (notifErr) {
      console.error('Failed to create failure notification:', notifErr);
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/documents/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalDocs = await prisma.document.count();
    const storageResult = await prisma.document.aggregate({
      _sum: { size: true }
    });
    const totalStorage = storageResult._sum.size || 0;
    res.json({ totalDocs, totalStorage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/documents/list
router.get('/list', async (req: Request, res: Response) => {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET /api/documents/:id/analyze
router.get('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id as string }
    });

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(path.resolve(doc.storagePath));
    const data = await pdfParse(dataBuffer);

    res.json({
      pageCount: data.numpages,
      wordCount: data.text.split(/\s+/).filter(Boolean).length,
      charCount: data.text.length,
      textPreview: data.text.slice(0, 500),
      headings: data.text
        .split('\n')
        .filter((l: string) => l.trim().length > 3 && l.trim() === l.trim().toUpperCase())
        .slice(0, 20)
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// GET /api/documents/:id/download
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id as string }
    });

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    res.download(path.resolve(doc.storagePath), doc.name);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// GET /api/documents/:id/file — serve raw PDF for viewer
router.get('/:id/file', async (req: Request, res: Response) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id as string }
    });

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const filePath = path.resolve(doc.storagePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

export default router;
