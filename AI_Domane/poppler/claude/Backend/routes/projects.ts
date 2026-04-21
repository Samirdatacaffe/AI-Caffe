import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../otp/logger.js';

const router = Router();

// All project routes require authentication
router.use(requireAuth);

// ==================== GET /api/projects — List projects ====================
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const sort = req.query.sort === 'created' ? 'created' : 'activity';

    const where: Record<string, unknown> = {
      userId: req.userId,
      isArchived: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = sort === 'created'
      ? { createdAt: 'desc' as const }
      : { updatedAt: 'desc' as const };

    const projects = await prisma.project.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
});

// ==================== POST /api/projects — Create project ====================
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'Project name is required' });
      return;
    }

    if (name.trim().length > 100) {
      res.status(400).json({ success: false, message: 'Project name must be 100 characters or less' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        userId: req.userId!,
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() || null : null,
        color: typeof color === 'string' ? color.trim() || null : null,
        icon: typeof icon === 'string' ? icon.trim() || null : null,
      },
    });

    logger.info('PROJECTS', `Created project "${project.name}" for user ${req.userId}`);

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
});

// ==================== GET /api/projects/:id — Get project ====================
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const project = await prisma.project.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
});

// ==================== PUT /api/projects/:id — Update project ====================
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, color, icon } = req.body;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      res.status(400).json({ success: false, message: 'Project name cannot be empty' });
      return;
    }

    if (name && name.trim().length > 100) {
      res.status(400).json({ success: false, message: 'Project name must be 100 characters or less' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: typeof description === 'string' ? description.trim() || null : null }),
        ...(color !== undefined && { color: typeof color === 'string' ? color.trim() || null : null }),
        ...(icon !== undefined && { icon: typeof icon === 'string' ? icon.trim() || null : null }),
      },
    });

    logger.info('PROJECTS', `Updated project "${project.name}" for user ${req.userId}`);

    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
});

// ==================== DELETE /api/projects/:id — Delete project ====================
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.project.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id } });

    logger.info('PROJECTS', `Deleted project "${existing.name}" for user ${req.userId}`);

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
