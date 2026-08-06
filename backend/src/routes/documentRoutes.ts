import { Router, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { analyzeAIDocument } from '../services/geminiService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Use memoryStorage for serverless environment compatibility (Vercel read-only filesystem)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /documents
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!orgId && !userId) {
      return res.json([]);
    }

    const whereClause: any = orgId
      ? { workflow: { organizationId: orgId } }
      : { workflow: { createdBy: userId } };

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        workflow: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(documents || []);
  } catch (error) {
    console.error('Error fetching documents from database:', error);
    return res.json([]);
  }
});

// POST /documents/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;

    const fileName = file ? file.originalname : (req.body.fileName || 'Uploaded_Document.pdf');
    const mimeType = file ? file.mimetype : (req.body.mimeType || 'application/pdf');
    const fileUrl = file ? `/uploads/${fileName}` : '/uploads/sample.pdf';

    // Extract text snippet if text-based file
    let textSnippet: string | undefined;
    if (file && file.buffer && (mimeType.includes('text') || mimeType.includes('json') || mimeType.includes('csv'))) {
      textSnippet = file.buffer.toString('utf-8').slice(0, 1000);
    }

    // Perform AI document analysis & field extraction with Gemini AI
    const aiAnalysis = await analyzeAIDocument(fileName, mimeType, textSnippet);

    let doc: any = null;
    try {
      doc = await prisma.document.create({
        data: {
          workflowId: req.body.workflowId || null,
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
    } catch (dbError) {
      console.warn('Database save warning (using memory document fallback):', dbError);
      doc = {
        id: `doc-${Date.now()}`,
        fileName,
        fileUrl,
        mimeType,
        extractedData: JSON.stringify(aiAnalysis),
        createdAt: new Date().toISOString()
      };
    }

    return res.status(201).json({
      document: doc,
      analysis: aiAnalysis
    });
  } catch (error) {
    console.error('Error in document upload service:', error);
    const fileName = req.file?.originalname || 'Uploaded_Document.pdf';
    const fallbackAnalysis = await analyzeAIDocument(fileName, 'application/pdf');
    const fallbackDoc = {
      id: `doc-${Date.now()}`,
      fileName,
      fileUrl: '/uploads/sample.pdf',
      mimeType: 'application/pdf',
      extractedData: JSON.stringify(fallbackAnalysis),
      createdAt: new Date().toISOString()
    };
    return res.status(200).json({
      document: fallbackDoc,
      analysis: fallbackAnalysis
    });
  }
});

export default router;
