import { Router } from 'express';
import { lessonsByCourse, createLesson, updateLesson, deleteLesson } from '../controllers/lesson.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, createLessonSchema, updateLessonSchema } from '../helpers/validation';

const router = Router();

router.get('/course/:courseId', authenticate, lessonsByCourse);
router.post('/', authenticate, requireRole('instructor', 'admin'), validate(createLessonSchema), createLesson);
router.put('/:id', authenticate, requireRole('instructor', 'admin'), validate(updateLessonSchema), updateLesson);
router.delete('/:id', authenticate, requireRole('instructor', 'admin'), deleteLesson);

export default router;
