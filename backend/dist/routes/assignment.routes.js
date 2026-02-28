"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("../controllers/assignment.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
router.get('/lesson/:lessonId', auth_1.authenticate, assignment_controller_1.assignmentsByLesson);
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), (0, validation_1.validate)(validation_1.createAssignmentSchema), assignment_controller_1.createAssignment);
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map