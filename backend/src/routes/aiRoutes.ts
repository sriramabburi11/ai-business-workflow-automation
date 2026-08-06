import { Router, Response } from 'express';
import { generateAIWorkflow, analyzeAIDocument, evaluateAIApproval } from '../services/geminiService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /ai/generate-workflow
router.post('/generate-workflow', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Natural language prompt is required' });
    }

    const aiResult = await generateAIWorkflow(prompt);
    return res.json(aiResult);
  } catch (error) {
    console.error('Error generating AI workflow:', error);
    return res.status(500).json({ error: 'AI Workflow Generation service error' });
  }
});

// POST /ai/document-analysis
router.post('/document-analysis', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, mimeType, textSnippet } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    const analysis = await analyzeAIDocument(fileName, mimeType || 'application/pdf', textSnippet);
    return res.json(analysis);
  } catch (error) {
    console.error('Error analyzing document with AI:', error);
    return res.status(500).json({ error: 'AI Document Analysis service error' });
  }
});

// POST /ai/decision-engine
router.post('/decision-engine', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { taskTitle, description, amount } = req.body;
    const assessment = await evaluateAIApproval(taskTitle || 'Generic Task', description || '', amount);
    return res.json(assessment);
  } catch (error) {
    console.error('Error executing AI decision engine:', error);
    return res.status(500).json({ error: 'AI Decision Engine error' });
  }
});

// POST /ai/suggest-improvements
router.post('/suggest-improvements', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { workflowTitle, stepsCount, avgExecutionTime } = req.body;
    return res.json({
      recommendations: [
        'Automate initial document OCR step to eliminate 15 minutes of manual verification delay.',
        'Set up auto-approval threshold for expenses < $250 to reduce manager queue volume by 35%.',
        'Add Slack webhook notification trigger to speed up approval turnarounds by 2.4x.'
      ],
      estimatedTimeSaved: '4.5 hours / week',
      bottleneckDetected: 'Manager approval queue (Step 3)'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
