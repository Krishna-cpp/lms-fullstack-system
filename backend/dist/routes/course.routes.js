"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
router.get('/', course_controller_1.listCourses);
router.get('/:id', course_controller_1.getCourseById);
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), (0, validation_1.validate)(validation_1.createCourseSchema), course_controller_1.createCourse);
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), (0, validation_1.validate)(validation_1.updateCourseSchema), course_controller_1.updateCourse);
router.delete('/:id', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), course_controller_1.deleteCourse);
exports.default = router;
//# sourceMappingURL=course.routes.js.map