"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const enrollment_routes_1 = __importDefault(require("./routes/enrollment.routes"));
const lesson_routes_1 = __importDefault(require("./routes/lesson.routes"));
const quiz_routes_1 = __importDefault(require("./routes/quiz.routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const submission_routes_1 = __importDefault(require("./routes/submission.routes"));
const certificate_routes_1 = __importDefault(require("./routes/certificate.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3000;
// ── Middleware ──────────────────────────────────────────────
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/courses', course_routes_1.default);
app.use('/api/enrollments', enrollment_routes_1.default);
app.use('/api/lessons', lesson_routes_1.default);
app.use('/api/quizzes', quiz_routes_1.default);
app.use('/api/assignments', assignment_routes_1.default);
app.use('/api/submissions', submission_routes_1.default);
app.use('/api/certificates', certificate_routes_1.default);
// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: err.message ?? 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`🚀 LMS API running on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map