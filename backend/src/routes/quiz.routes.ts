import { Router } from 'express';
import { quizzesByLesson, createQuiz, submitQuiz } from '../controllers/quiz.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, createQuizSchema } from '../helpers/validation';

const router = Router();

router.get('/lesson/:lessonId', authenticate, quizzesByLesson);
router.post('/', authenticate, requireRole('instructor', 'admin'), validate(createQuizSchema), createQuiz);
router.post('/submit', authenticate, submitQuiz);

export default router;
