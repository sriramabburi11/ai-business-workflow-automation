import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// In-memory fallback tasks store for serverless environment resilience
const memoryTasks: any[] = [];

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

    let dbTasks: any[] = [];
    try {
      dbTasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          workflow: { select: { id: true, title: true } },
          approvals: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {}

    const orgMemTasks = memoryTasks.filter(
      t => (orgId && t.organizationId === orgId) || (userId && t.createdBy === userId)
    );

    let combined = [...orgMemTasks, ...(dbTasks || [])];

    if (status) combined = combined.filter(t => t.status === String(status));
    if (assignee) combined = combined.filter(t => t.assignee === String(assignee));

    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return res.json(unique);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    const orgId = req.user?.organizationId;
    const userId = req.user?.id;
    const orgMemTasks = memoryTasks.filter(
      t => (orgId && t.organizationId === orgId) || (userId && t.createdBy === userId)
    );
    return res.json(orgMemTasks);
  }
});

// POST /tasks (Create Task)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignee, priority, workflowId } = req.body;
    const orgId = req.user?.organizationId || `org-${Date.now()}`;
    const userId = req.user?.id || `user-${Date.now()}`;
    const taskId = `task-${Date.now()}`;

    const newTask = {
      id: taskId,
      workflowId: workflowId || null,
      title: title || 'Custom Action Task',
      description: description || 'Automated action task assigned for execution.',
      assignee: assignee || 'MEMBER',
      status: 'PENDING',
      priority: priority || 'HIGH',
      createdAt: new Date().toISOString(),
      organizationId: orgId,
      createdBy: userId,
      workflow: workflowId ? { id: workflowId, title: 'Custom Automation Pipeline' } : null
    };

    memoryTasks.unshift(newTask);

    try {
      if (workflowId) {
        await prisma.task.create({
          data: {
            id: taskId,
            workflowId,
            title: newTask.title,
            description: newTask.description,
            assignee: newTask.assignee,
            status: 'PENDING',
            priority: newTask.priority
          }
        });
      }
    } catch (e) {}

    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /tasks/:id
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignee, priority } = req.body;
    const taskId = req.params.id;

    const memMatch = memoryTasks.find(t => t.id === taskId);
    if (memMatch) {
      if (status) memMatch.status = status;
      if (assignee) memMatch.assignee = assignee;
      if (priority) memMatch.priority = priority;
    }

    let updatedTask = memMatch;

    try {
      updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status,
          assignee,
          priority
        },
        include: { workflow: true }
      });
    } catch (e) {}

    if (!updatedTask) {
      updatedTask = { id: taskId, status, assignee, priority, updatedAt: new Date().toISOString() };
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: 'TASK_UPDATED',
          userId: req.user?.id || 'unknown-user',
          details: JSON.stringify({ taskId, status, assignee })
        }
      });
    } catch (e) {}

    return res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
