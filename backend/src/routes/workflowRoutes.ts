import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /workflows
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workflows = await prisma.workflow.findMany({
      include: {
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { tasks: true, executions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// GET /workflows/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: {
        steps: { orderBy: { order: 'asc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        executions: { orderBy: { startedAt: 'desc' }, take: 10 }
      }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    return res.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return res.status(500).json({ error: 'Failed to fetch workflow details' });
  }
});

// POST /workflows
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, trigger, status, steps } = req.body;
    const userId = req.user?.id || 'demo-user-123';
    const orgId = req.user?.organizationId || 'demo-org-123';

    if (!title) {
      return res.status(400).json({ error: 'Workflow title is required' });
    }

    const workflow = await prisma.workflow.create({
      data: {
        title,
        description: description || '',
        trigger: trigger || 'MANUAL',
        status: status || 'ACTIVE',
        organizationId: orgId,
        createdBy: userId,
        steps: steps && Array.isArray(steps) ? {
          create: steps.map((step: any, index: number) => ({
            name: step.name,
            type: step.type || 'TASK_ASSIGNMENT',
            config: typeof step.config === 'object' ? JSON.stringify(step.config) : (step.config || '{}'),
            order: index + 1,
            assignedRole: step.assignedRole || 'MANAGER'
          }))
        } : undefined
      },
      include: { steps: true }
    });

    await prisma.auditLog.create({
      data: {
        action: 'WORKFLOW_CREATED',
        userId,
        details: JSON.stringify({ workflowId: workflow.id, title: workflow.title })
      }
    });

    return res.status(201).json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    return res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// PUT /workflows/:id
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, trigger, status, steps } = req.body;
    const workflowId = req.params.id;

    // Delete existing steps if new ones provided
    if (steps && Array.isArray(steps)) {
      await prisma.workflowStep.deleteMany({ where: { workflowId } });
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        title,
        description,
        trigger,
        status,
        steps: steps && Array.isArray(steps) ? {
          create: steps.map((step: any, index: number) => ({
            name: step.name,
            type: step.type || 'TASK_ASSIGNMENT',
            config: typeof step.config === 'object' ? JSON.stringify(step.config) : (step.config || '{}'),
            order: index + 1,
            assignedRole: step.assignedRole || 'MANAGER'
          }))
        } : undefined
      },
      include: { steps: { orderBy: { order: 'asc' } } }
    });

    await prisma.auditLog.create({
      data: {
        action: 'WORKFLOW_UPDATED',
        userId: req.user?.id || 'demo-user-123',
        details: JSON.stringify({ workflowId, title: updatedWorkflow.title })
      }
    });

    return res.json(updatedWorkflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// DELETE /workflows/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workflowId = req.params.id;
    await prisma.workflow.delete({ where: { id: workflowId } });

    await prisma.auditLog.create({
      data: {
        action: 'WORKFLOW_DELETED',
        userId: req.user?.id || 'demo-user-123',
        details: JSON.stringify({ workflowId })
      }
    });

    return res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// POST /workflows/:id/execute
router.post('/:id/execute', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workflowId = req.params.id;
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { order: 'asc' } } }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Record execution start
    const logs = [
      { timestamp: new Date().toISOString(), message: `Workflow execution started: "${workflow.title}"` }
    ];

    let createdTask = null;
    let createdApproval = null;

    // Simulate dynamic step execution logic
    for (const step of workflow.steps) {
      logs.push({
        timestamp: new Date().toISOString(),
        message: `Executing Step ${step.order}: [${step.type}] ${step.name}`
      });

      if (step.type === 'APPROVAL' || step.type === 'TASK_ASSIGNMENT') {
        createdTask = await prisma.task.create({
          data: {
            workflowId: workflow.id,
            title: step.name,
            description: `Automated task created by workflow execution engine for role: ${step.assignedRole || 'MANAGER'}`,
            assignee: step.assignedRole || 'MANAGER',
            status: step.type === 'APPROVAL' ? 'PENDING' : 'IN_PROGRESS',
            priority: 'HIGH'
          }
        });

        if (step.type === 'APPROVAL') {
          createdApproval = await prisma.approval.create({
            data: {
              taskId: createdTask.id,
              workflowId: workflow.id,
              approver: step.assignedRole || 'MANAGER',
              decision: 'PENDING',
              aiRiskScore: Math.floor(Math.random() * 25) + 5, // Low risk baseline
              aiRecommendation: 'APPROVE',
              comment: 'AI baseline check passed; routed for approval.'
            }
          });
        }
      }
    }

    logs.push({
      timestamp: new Date().toISOString(),
      message: `Workflow steps finished processing successfully.`
    });

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: 'COMPLETED',
        logs: JSON.stringify(logs),
        completedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'WORKFLOW_EXECUTED',
        userId: req.user?.id || 'demo-user-123',
        details: JSON.stringify({ workflowId: workflow.id, executionId: execution.id })
      }
    });

    return res.json({
      executionId: execution.id,
      status: 'COMPLETED',
      logs,
      task: createdTask,
      approval: createdApproval
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    return res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

export default router;
