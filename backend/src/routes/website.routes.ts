import { Router } from 'express';
import { websiteController } from '../controllers/website.controller';
import { validate } from '../middleware/validation.middleware';
import { urlSchema } from '../validators/url.validator';
import { optionalAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/analyze', optionalAuth, rateLimit, validate(urlSchema), websiteController.analyze);

export default router;