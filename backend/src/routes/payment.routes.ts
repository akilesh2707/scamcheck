import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { validate } from '../middleware/validation.middleware';
import { paymentVerifySchema } from '../validators/analyze.validator';
import { optionalAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/verify', optionalAuth, rateLimit, validate(paymentVerifySchema), paymentController.verify);

export default router;