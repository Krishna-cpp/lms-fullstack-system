import { Router } from 'express';
import { enroll, myEnrollments, courseEnrollments, updateProgress } from '../controllers/enrollment.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, enrollSchema } from '../helpers/validation';

const router = Router();

router.post('/', authenticate, requireRole('student'), validate(enrollSchema), enroll);
router.get('/my', authenticate, requireRole('student'), myEnrollments);
router.get('/course/:courseId', authenticate, requireRole('instructor', 'admin'), courseEnrollments);
router.patch('/progress', authenticate, requireRole('student'), updateProgress);

export default router;
