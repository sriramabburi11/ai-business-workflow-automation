import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /tasks
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignee } = req.query;
    const orgId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!orgId && !userId) {
      return res.json([]);
    }

    const whereClause: any = {};
    if (status) whereClause.status = String(status);
    if (assignee) whereClause.assignee = String(assignee);
    if (orgId) {
      whereClause.workflow = { organizationId: orgId };
    } else {
      whereClause.workflow = { createdBy: userId };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        workflow: { select: { id: true, title: true } },
        approvals: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// PUT /tasks/:id
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignee, priority } = req.body;
    const taskId = req.params.id;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        assignee,
        priority
      },
      include: { workflow: true }
    });

    await prisma.auditLog.create({
      data: {
        action: 'TASK_UPDATED',
        userId: req.user?.id || 'unknown-user',
        details: JSON.stringify({ taskId, status: updatedTask.status, assignee: updatedTask.assignee })
      }
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
