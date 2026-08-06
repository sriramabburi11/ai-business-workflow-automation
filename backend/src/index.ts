import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';

import authRoutes from './routes/authRoutes';
import workflowRoutes from './routes/workflowRoutes';
import aiRoutes from './routes/aiRoutes';
import taskRoutes from './routes/taskRoutes';
import approvalRoutes from './routes/approvalRoutes';
import documentRoutes from './routes/documentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import organizationRoutes from './routes/organizationRoutes';

const app = express();

// Security headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

// Rate limiting security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max requests per window
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded static files safely
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Dual Route Mounts (Support both local /api prefix and Vercel serverless function rewrites)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/workflows', workflowRoutes);
app.use('/workflows', workflowRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

app.use('/api/approvals', approvalRoutes);
app.use('/approvals', approvalRoutes);

app.use('/api/documents', documentRoutes);
app.use('/documents', documentRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api/organizations', organizationRoutes);
app.use('/organizations', organizationRoutes);

// Health Check Endpoint
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AI Business Workflow Automation Platform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root route handler
app.get(['/api', '/'], (_req, res) => {
  res.json({
    message: 'Welcome to AI Business Workflow Automation Platform Backend API',
    docs: '/api/health'
  });
});

// Global 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = parseInt(env.PORT, 10) || 5050;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Workflow Automation Backend API running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
