import { Router } from 'express';
import { submitAssignment, submissionsByAssignment } from '../controllers/submission.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, requireRole('student'), upload.single('file'), submitAssignment);
router.get('/assignment/:assignmentId', authenticate, requireRole('instructor', 'admin'), submissionsByAssignment);

export default router;
