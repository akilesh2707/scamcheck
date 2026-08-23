import { Router } from 'express';
import { suitabilityController } from '../controllers/suitability.controller';
import { validate } from '../middleware/validation.middleware';
import { suitabilitySchema } from '../validators/analyze.validator';
import { optionalAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/', optionalAuth, rateLimit, validate(suitabilitySchema), suitabilityController.analyze);

export default router;