import { Router } from 'express';
import { assignmentsByLesson, createAssignment } from '../controllers/assignment.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, createAssignmentSchema } from '../helpers/validation';

const router = Router();

router.get('/lesson/:lessonId', authenticate, assignmentsByLesson);
router.post('/', authenticate, requireRole('instructor', 'admin'), validate(createAssignmentSchema), createAssignment);

export default router;
