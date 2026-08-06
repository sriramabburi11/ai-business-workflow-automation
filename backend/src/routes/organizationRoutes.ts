import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /organizations/team
router.get('/team', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId;
    const users = await prisma.user.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(users);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST /organizations/invite (Admin / Manager only)
router.post('/invite', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const defaultPassword = await bcrypt.hash('Password123!', 10);
    const orgId = req.user?.organizationId;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: defaultPassword,
        role: role || 'MEMBER',
        organizationId: orgId || null
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'MEMBER_INVITED',
        userId: req.user?.id || 'demo-user-123',
        details: JSON.stringify({ invitedEmail: email, assignedRole: user.role })
      }
    });

    return res.status(201).json({
      message: 'Team member added successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return res.status(500).json({ error: 'Failed to invite team member' });
  }
});

export default router;
