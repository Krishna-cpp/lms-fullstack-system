import { Router } from 'express';
import { listUsers, getUserById, updateUser } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, updateUserSchema } from '../helpers/validation';

const router = Router();

router.get('/', authenticate, requireRole('admin'), listUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, validate(updateUserSchema), updateUser);

export default router;
