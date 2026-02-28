"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueCertSchema = exports.enrollSchema = exports.createAssignmentSchema = exports.createQuizSchema = exports.quizQuestionSchema = exports.updateLessonSchema = exports.createLessonSchema = exports.updateCourseSchema = exports.createCourseSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = void 0;
exports.validate = validate;
const zod_1 = require("zod");
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors,
            });
            return;
        }
        req.body = result.data;
        next();
    };
}
// ── Auth schemas ─────────────────────────────────────────────
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(120),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(100),
    role: zod_1.z.enum(['student', 'instructor']).default('student'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
// ── User schemas ─────────────────────────────────────────────
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(120).optional(),
    avatar_url: zod_1.z.string().url().optional().nullable(),
});
// ── Course schemas ───────────────────────────────────────────
exports.createCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(255),
    description: zod_1.z.string().optional(),
    thumbnail_url: zod_1.z.string().url().optional().nullable(),
    level: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    duration_hours: zod_1.z.coerce.number().min(0).default(0),
    category_id: zod_1.z.coerce.number().int().positive(),
});
exports.updateCourseSchema = exports.createCourseSchema.partial();
// ── Lesson schemas ───────────────────────────────────────────
exports.createLessonSchema = zod_1.z.object({
    course_id: zod_1.z.coerce.number().int().positive(),
    title: zod_1.z.string().min(2).max(255),
    content: zod_1.z.string().optional(),
    order_index: zod_1.z.coerce.number().int().min(0).default(0),
    duration_min: zod_1.z.coerce.number().int().min(0).default(0),
});
exports.updateLessonSchema = exports.createLessonSchema.partial().omit({ course_id: true });
// ── Quiz schemas ─────────────────────────────────────────────
exports.quizQuestionSchema = zod_1.z.object({
    question_text: zod_1.z.string().min(5),
    option_a: zod_1.z.string().min(1),
    option_b: zod_1.z.string().min(1),
    option_c: zod_1.z.string().min(1),
    option_d: zod_1.z.string().min(1),
    correct_option: zod_1.z.enum(['a', 'b', 'c', 'd']),
    order_index: zod_1.z.coerce.number().int().min(0).default(0),
});
exports.createQuizSchema = zod_1.z.object({
    lesson_id: zod_1.z.coerce.number().int().positive(),
    title: zod_1.z.string().min(2).max(255),
    questions: zod_1.z.array(exports.quizQuestionSchema).min(1),
});
// ── Assignment schemas ────────────────────────────────────────
exports.createAssignmentSchema = zod_1.z.object({
    lesson_id: zod_1.z.coerce.number().int().positive(),
    title: zod_1.z.string().min(2).max(255),
    description: zod_1.z.string().optional(),
    due_date: zod_1.z.string().datetime().optional().nullable(),
    max_score: zod_1.z.coerce.number().int().min(1).default(100),
});
// ── Enrollment schemas ────────────────────────────────────────
exports.enrollSchema = zod_1.z.object({
    course_id: zod_1.z.coerce.number().int().positive(),
});
// ── Certificate schemas ───────────────────────────────────────
exports.issueCertSchema = zod_1.z.object({
    course_id: zod_1.z.coerce.number().int().positive(),
    score: zod_1.z.coerce.number().int().min(0).max(100).optional(),
});
//# sourceMappingURL=validation.js.map