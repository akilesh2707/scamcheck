import { Router } from 'express';
import multer from 'multer';
import { analyzeController } from '../controllers/analyze.controller';
import { validate } from '../middleware/validation.middleware';
import { analyzeSchema } from '../validators/analyze.validator';
import { optionalAuth, optionalAuthAllowExtension } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf formats allowed!'));
    }
  },
});

const router = Router();

router.post('/', optionalAuthAllowExtension, rateLimit, upload.single('file'), validate(analyzeSchema), analyzeController.analyze);
router.get('/history', optionalAuth, rateLimit, analyzeController.getHistory);
router.get('/:id', optionalAuthAllowExtension, rateLimit, analyzeController.getReport);

export default router;