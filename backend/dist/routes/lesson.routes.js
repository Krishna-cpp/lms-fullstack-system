"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lesson_controller_1 = require("../controllers/lesson.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
router.get('/course/:courseId', auth_1.authenticate, lesson_controller_1.lessonsByCourse);
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), (0, validation_1.validate)(validation_1.createLessonSchema), lesson_controller_1.createLesson);
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), (0, validation_1.validate)(validation_1.updateLessonSchema), lesson_controller_1.updateLesson);
router.delete('/:id', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), lesson_controller_1.deleteLesson);
exports.default = router;
//# sourceMappingURL=lesson.routes.js.map