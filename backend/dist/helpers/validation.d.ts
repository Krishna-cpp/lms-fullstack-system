import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
export declare function validate<T>(schema: ZodSchema<T>): (req: Request, res: Response, next: NextFunction) => void;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["student", "instructor"]>>;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    email: string;
    role: "student" | "instructor";
}, {
    password: string;
    name: string;
    email: string;
    role?: "student" | "instructor" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatar_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    avatar_url?: string | null | undefined;
}, {
    name?: string | undefined;
    avatar_url?: string | null | undefined;
}>;
export declare const createCourseSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    thumbnail_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    level: z.ZodDefault<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    duration_hours: z.ZodDefault<z.ZodNumber>;
    category_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    title: string;
    level: "beginner" | "intermediate" | "advanced";
    duration_hours: number;
    category_id: number;
    description?: string | undefined;
    thumbnail_url?: string | null | undefined;
}, {
    title: string;
    category_id: number;
    description?: string | undefined;
    thumbnail_url?: string | null | undefined;
    level?: "beginner" | "intermediate" | "advanced" | undefined;
    duration_hours?: number | undefined;
}>;
export declare const updateCourseSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    thumbnail_url: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    level: z.ZodOptional<z.ZodDefault<z.ZodEnum<["beginner", "intermediate", "advanced"]>>>;
    duration_hours: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    category_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    thumbnail_url?: string | null | undefined;
    level?: "beginner" | "intermediate" | "advanced" | undefined;
    duration_hours?: number | undefined;
    category_id?: number | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    thumbnail_url?: string | null | undefined;
    level?: "beginner" | "intermediate" | "advanced" | undefined;
    duration_hours?: number | undefined;
    category_id?: number | undefined;
}>;
export declare const createLessonSchema: z.ZodObject<{
    course_id: z.ZodNumber;
    title: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    order_index: z.ZodDefault<z.ZodNumber>;
    duration_min: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    course_id: number;
    order_index: number;
    duration_min: number;
    content?: string | undefined;
}, {
    title: string;
    course_id: number;
    content?: string | undefined;
    order_index?: number | undefined;
    duration_min?: number | undefined;
}>;
export declare const updateLessonSchema: z.ZodObject<Omit<{
    course_id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    order_index: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    duration_min: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "course_id">, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    content?: string | undefined;
    order_index?: number | undefined;
    duration_min?: number | undefined;
}, {
    title?: string | undefined;
    content?: string | undefined;
    order_index?: number | undefined;
    duration_min?: number | undefined;
}>;
export declare const quizQuestionSchema: z.ZodObject<{
    question_text: z.ZodString;
    option_a: z.ZodString;
    option_b: z.ZodString;
    option_c: z.ZodString;
    option_d: z.ZodString;
    correct_option: z.ZodEnum<["a", "b", "c", "d"]>;
    order_index: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    order_index: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: "a" | "b" | "c" | "d";
}, {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: "a" | "b" | "c" | "d";
    order_index?: number | undefined;
}>;
export declare const createQuizSchema: z.ZodObject<{
    lesson_id: z.ZodNumber;
    title: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        question_text: z.ZodString;
        option_a: z.ZodString;
        option_b: z.ZodString;
        option_c: z.ZodString;
        option_d: z.ZodString;
        correct_option: z.ZodEnum<["a", "b", "c", "d"]>;
        order_index: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        order_index: number;
        question_text: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        correct_option: "a" | "b" | "c" | "d";
    }, {
        question_text: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        correct_option: "a" | "b" | "c" | "d";
        order_index?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    lesson_id: number;
    questions: {
        order_index: number;
        question_text: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        correct_option: "a" | "b" | "c" | "d";
    }[];
}, {
    title: string;
    lesson_id: number;
    questions: {
        question_text: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        correct_option: "a" | "b" | "c" | "d";
        order_index?: number | undefined;
    }[];
}>;
export declare const createAssignmentSchema: z.ZodObject<{
    lesson_id: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    due_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    max_score: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    lesson_id: number;
    max_score: number;
    description?: string | undefined;
    due_date?: string | null | undefined;
}, {
    title: string;
    lesson_id: number;
    description?: string | undefined;
    due_date?: string | null | undefined;
    max_score?: number | undefined;
}>;
export declare const enrollSchema: z.ZodObject<{
    course_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    course_id: number;
}, {
    course_id: number;
}>;
export declare const issueCertSchema: z.ZodObject<{
    course_id: z.ZodNumber;
    score: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    course_id: number;
    score?: number | undefined;
}, {
    course_id: number;
    score?: number | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map