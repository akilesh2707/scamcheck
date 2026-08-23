import { Router } from 'express';
import { alternativesController } from '../controllers/alternatives.controller';
import { validate } from '../middleware/validation.middleware';
import { alternativesSchema } from '../validators/analyze.validator';
import { optionalAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/', optionalAuth, rateLimit, validate(alternativesSchema), alternativesController.find);

export default router;