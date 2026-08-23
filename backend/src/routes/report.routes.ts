import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/:id', optionalAuth, rateLimit, reportController.getReport);
router.get('/', authenticate, rateLimit, reportController.getHistory);

export default router;