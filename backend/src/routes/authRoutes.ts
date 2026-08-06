import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// POST /auth/register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, organizationName, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization first
    const org = await prisma.organization.create({
      data: {
        name: organizationName || `${name}'s Organization`,
        ownerId: 'pending'
      }
    });

    // Create user linked to org
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'ADMIN',
        organizationId: org.id
      }
    });

    // Update org owner
    await prisma.organization.update({
      where: { id: org.id },
      data: { ownerId: user.id }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        userId: user.id,
        details: JSON.stringify({ email: user.email, orgId: org.id })
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: org.id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: org.id
      },
      organization: org
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGIN',
        userId: user.id,
        details: JSON.stringify({ loginTime: new Date() })
      }
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// GET /auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { organization: true }
    });

    if (!user) {
      // Fallback for demo user token
      return res.json({
        user: req.user,
        organization: { id: req.user.organizationId || 'demo-org', name: 'Smart Automation Enterprise' }
      });
    }

    const { password, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, organization: user.organization });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
