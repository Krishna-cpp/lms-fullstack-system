"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enrollment_controller_1 = require("../controllers/enrollment.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('student'), (0, validation_1.validate)(validation_1.enrollSchema), enrollment_controller_1.enroll);
router.get('/my', auth_1.authenticate, (0, auth_1.requireRole)('student'), enrollment_controller_1.myEnrollments);
router.get('/course/:courseId', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), enrollment_controller_1.courseEnrollments);
router.patch('/progress', auth_1.authenticate, (0, auth_1.requireRole)('student'), enrollment_controller_1.updateProgress);
exports.default = router;
//# sourceMappingURL=enrollment.routes.js.map