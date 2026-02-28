import { Router } from 'express';
import {
    listCourses, getCourseById, createCourse, updateCourse, deleteCourse
} from '../controllers/course.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, createCourseSchema, updateCourseSchema } from '../helpers/validation';

const router = Router();

router.get('/', listCourses);
router.get('/:id', getCourseById);
router.post('/', authenticate, requireRole('instructor', 'admin'), validate(createCourseSchema), createCourse);
router.put('/:id', authenticate, requireRole('instructor', 'admin'), validate(updateCourseSchema), updateCourse);
router.delete('/:id', authenticate, requireRole('instructor', 'admin'), deleteCourse);

export default router;
