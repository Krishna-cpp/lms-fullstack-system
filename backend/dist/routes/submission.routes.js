"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_controller_1 = require("../controllers/submission.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('student'), upload_1.upload.single('file'), submission_controller_1.submitAssignment);
router.get('/assignment/:assignmentId', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), submission_controller_1.submissionsByAssignment);
exports.default = router;
//# sourceMappingURL=submission.routes.js.map