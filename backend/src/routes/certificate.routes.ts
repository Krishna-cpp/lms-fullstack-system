import { Router } from 'express';
import { myCertificates, issueCertificate } from '../controllers/certificate.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, issueCertSchema } from '../helpers/validation';

const router = Router();

router.get('/my', authenticate, requireRole('student'), myCertificates);
router.post('/', authenticate, requireRole('student'), validate(issueCertSchema), issueCertificate);

export default router;
