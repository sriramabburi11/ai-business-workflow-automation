import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /approvals
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const orgId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!orgId && !userId) {
      return res.json([]);
    }

    const whereClause: any = {};
    if (status) whereClause.decision = String(status);
    if (orgId) {
      whereClause.workflow = { organizationId: orgId };
    } else {
      whereClause.workflow = { createdBy: userId };
    }

    const approvals = await prisma.approval.findMany({
      where: whereClause,
      include: {
        task: {
          include: {
            workflow: { select: { id: true, title: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(approvals);
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return res.status(500).json({ error: 'Failed to fetch approvals' });
  }
});

// POST /approvals (Submit Decision)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { approvalId, taskId, decision, comment } = req.body;
    const userId = req.user?.id || 'unknown-user';

    if (!decision || !['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(decision)) {
      return res.status(400).json({ error: 'Valid decision (APPROVED, REJECTED, CHANGES_REQUESTED) is required' });
    }

    let updatedApproval;

    if (approvalId) {
      updatedApproval = await prisma.approval.update({
        where: { id: approvalId },
        data: {
          decision,
          comment: comment || null
        },
        include: { task: true }
      });
    } else if (taskId) {
      const existing = await prisma.approval.findFirst({ where: { taskId } });
      if (existing) {
        updatedApproval = await prisma.approval.update({
          where: { id: existing.id },
          data: { decision, comment: comment || null },
          include: { task: true }
        });
      } else {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        updatedApproval = await prisma.approval.create({
          data: {
            taskId: task.id,
            workflowId: task.workflowId,
            approver: req.user?.name || 'MANAGER',
            decision,
            comment: comment || null,
            aiRiskScore: 10,
            aiRecommendation: decision
          },
          include: { task: true }
        });
      }
    } else {
      return res.status(400).json({ error: 'Either approvalId or taskId must be provided' });
    }

    // Update associated task status
    if (updatedApproval.taskId) {
      await prisma.task.update({
        where: { id: updatedApproval.taskId },
        data: {
          status: decision === 'APPROVED' ? 'COMPLETED' : 'REJECTED'
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        action: `APPROVAL_${decision}`,
        userId,
        details: JSON.stringify({
          approvalId: updatedApproval.id,
          taskId: updatedApproval.taskId,
          decision,
          comment
        })
      }
    });

    return res.json(updatedApproval);
  } catch (error) {
    console.error('Error recording approval decision:', error);
    return res.status(500).json({ error: 'Failed to record approval decision' });
  }
});

export default router;
