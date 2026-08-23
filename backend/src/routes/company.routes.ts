import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { optionalAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/verify', optionalAuth, rateLimit, companyController.verify);

export default router;