"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("../controllers/quiz.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
router.get('/lesson/:lessonId', auth_1.authenticate, quiz_controller_1.quizzesByLesson);
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('instructor', 'admin'), (0, validation_1.validate)(validation_1.createQuizSchema), quiz_controller_1.createQuiz);
router.post('/submit', auth_1.authenticate, quiz_controller_1.submitQuiz);
exports.default = router;
//# sourceMappingURL=quiz.routes.js.map