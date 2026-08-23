import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', rateLimit, validate(registerSchema), authController.register);
router.post('/login', rateLimit, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put('/user-profile', authenticate, authController.updateUserProfile);
router.get('/user-profile', authenticate, authController.getUserProfile);

export default router;