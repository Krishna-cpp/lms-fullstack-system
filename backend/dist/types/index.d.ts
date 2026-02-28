export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'instructor' | 'admin';
    avatar_url?: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface Category {
    id: number;
    name: string;
    description: string | null;
    created_at: Date;
}
export interface Course {
    id: number;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration_hours: number;
    category_id: number;
    instructor_id: number;
    is_published: boolean;
    created_at: Date;
    updated_at: Date;
    category_name?: string;
    instructor_name?: string;
    instructor_email?: string;
}
export interface Lesson {
    id: number;
    course_id: number;
    title: string;
    content: string | null;
    order_index: number;
    duration_min: number;
    created_at: Date;
    updated_at: Date;
}
export interface Enrollment {
    id: number;
    student_id: number;
    course_id: number;
    progress: number;
    completed: boolean;
    enrolled_at: Date;
    completed_at: Date | null;
    course_title?: string;
    course_thumbnail?: string;
    instructor_name?: string;
}
export interface Quiz {
    id: number;
    lesson_id: number;
    title: string;
    created_at: Date;
    questions?: QuizQuestion[];
}
export interface QuizQuestion {
    id: number;
    quiz_id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'a' | 'b' | 'c' | 'd';
    order_index: number;
}
export interface Assignment {
    id: number;
    lesson_id: number;
    title: string;
    description: string | null;
    due_date: Date | null;
    max_score: number;
    created_at: Date;
}
export interface Submission {
    id: number;
    assignment_id: number;
    student_id: number;
    file_url: string;
    score: number | null;
    feedback: string | null;
    submitted_at: Date;
    student_name?: string;
    student_email?: string;
}
export interface Certificate {
    id: number;
    student_id: number;
    course_id: number;
    score: number | null;
    issued_at: Date;
    course_title?: string;
    course_thumbnail?: string;
}
export interface JwtPayload {
    id: number;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    name: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
//# sourceMappingURL=index.d.ts.map