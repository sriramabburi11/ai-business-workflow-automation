import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { analyzeAIDocument } from '../services/geminiService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Configure storage for file upload
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /documents
router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        workflow: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /documents/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { workflowId, autoProcess } = req.body;
    const file = req.file;

    const fileName = file ? file.originalname : (req.body.fileName || 'Sample_Invoice.pdf');
    const mimeType = file ? file.mimetype : (req.body.mimeType || 'application/pdf');
    const fileUrl = file ? `/uploads/${file.filename}` : '/uploads/sample.pdf';

    // Perform AI document analysis & field extraction
    const aiAnalysis = await analyzeAIDocument(fileName, mimeType);

    const doc = await prisma.document.create({
      data: {
        workflowId: workflowId || null,
        fileName,
        fileUrl,
        mimeType,
        extractedData: JSON.stringify(aiAnalysis)
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'DOCUMENT_UPLOADED',
        userId: req.user?.id || 'demo-user-123',
        details: JSON.stringify({ documentId: doc.id, fileName: doc.fileName })
      }
    });

    return res.status(201).json({
      document: doc,
      analysis: aiAnalysis
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ error: 'Failed to process document upload' });
  }
});

export default router;
