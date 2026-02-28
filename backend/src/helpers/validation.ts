import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
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
export const registerSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    role: z.enum(['student', 'instructor']).default('student'),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

// ── User schemas ─────────────────────────────────────────────
export const updateUserSchema = z.object({
    name: z.string().min(2).max(120).optional(),
    avatar_url: z.string().url().optional().nullable(),
});

// ── Course schemas ───────────────────────────────────────────
export const createCourseSchema = z.object({
    title: z.string().min(3).max(255),
    description: z.string().optional(),
    thumbnail_url: z.string().url().optional().nullable(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    duration_hours: z.coerce.number().min(0).default(0),
    category_id: z.coerce.number().int().positive(),
});

export const updateCourseSchema = createCourseSchema.partial();

// ── Lesson schemas ───────────────────────────────────────────
export const createLessonSchema = z.object({
    course_id: z.coerce.number().int().positive(),
    title: z.string().min(2).max(255),
    content: z.string().optional(),
    order_index: z.coerce.number().int().min(0).default(0),
    duration_min: z.coerce.number().int().min(0).default(0),
});

export const updateLessonSchema = createLessonSchema.partial().omit({ course_id: true });

// ── Quiz schemas ─────────────────────────────────────────────
export const quizQuestionSchema = z.object({
    question_text: z.string().min(5),
    option_a: z.string().min(1),
    option_b: z.string().min(1),
    option_c: z.string().min(1),
    option_d: z.string().min(1),
    correct_option: z.enum(['a', 'b', 'c', 'd']),
    order_index: z.coerce.number().int().min(0).default(0),
});

export const createQuizSchema = z.object({
    lesson_id: z.coerce.number().int().positive(),
    title: z.string().min(2).max(255),
    questions: z.array(quizQuestionSchema).min(1),
});

// ── Assignment schemas ────────────────────────────────────────
export const createAssignmentSchema = z.object({
    lesson_id: z.coerce.number().int().positive(),
    title: z.string().min(2).max(255),
    description: z.string().optional(),
    due_date: z.string().datetime().optional().nullable(),
    max_score: z.coerce.number().int().min(1).default(100),
});

// ── Enrollment schemas ────────────────────────────────────────
export const enrollSchema = z.object({
    course_id: z.coerce.number().int().positive(),
});

// ── Certificate schemas ───────────────────────────────────────
export const issueCertSchema = z.object({
    course_id: z.coerce.number().int().positive(),
    score: z.coerce.number().int().min(0).max(100).optional(),
});
