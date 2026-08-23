import { Router } from 'express';
import { analyzeController } from '../controllers/analyze.controller';
import { validate } from '../middleware/validation.middleware';
import { analyzeSchema } from '../validators/analyze.validator';
import { optionalAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/', optionalAuth, rateLimit, validate(analyzeSchema), analyzeController.analyze);
router.get('/history', optionalAuth, rateLimit, analyzeController.getHistory);
router.get('/:id', optionalAuth, rateLimit, analyzeController.getReport);

export default router;