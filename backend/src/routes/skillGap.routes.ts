import { Router } from 'express';
import { skillGapController } from '../controllers/skillGap.controller';
import { validate } from '../middleware/validation.middleware';
import { skillGapSchema } from '../validators/analyze.validator';
import { optionalAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/', optionalAuth, rateLimit, validate(skillGapSchema), skillGapController.analyze);

export default router;