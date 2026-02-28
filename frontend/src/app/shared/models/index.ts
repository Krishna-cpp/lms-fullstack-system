// Shared TypeScript interfaces for the Angular frontend

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    avatar_url?: string | null;
    created_at?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string | null;
}

export interface Course {
    id: number;
    title: string;
    description?: string | null;
    thumbnail_url?: string | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration_hours: number;
    category_id: number;
    instructor_id: number;
    is_published: boolean;
    created_at?: string;
    // Joined
    category_name?: string;
    instructor_name?: string;
    instructor_email?: string;
    lessons?: Lesson[];
}

export interface Lesson {
    id: number;
    course_id: number;
    title: string;
    content?: string | null;
    order_index: number;
    duration_min: number;
    created_at?: string;
}

export interface Enrollment {
    id: number;
    student_id: number;
    course_id: number;
    progress: number;
    completed: boolean;
    enrolled_at: string;
    completed_at?: string | null;
    // Joined
    course_title?: string;
    course_thumbnail?: string | null;
    instructor_name?: string;
    level?: string;
    duration_hours?: number;
}

export interface Quiz {
    id: number;
    lesson_id: number;
    title: string;
    created_at?: string;
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
    description?: string | null;
    due_date?: string | null;
    max_score: number;
    created_at?: string;
}

export interface Submission {
    id: number;
    assignment_id: number;
    student_id: number;
    file_url: string;
    score?: number | null;
    feedback?: string | null;
    submitted_at: string;
    student_name?: string;
    student_email?: string;
}

export interface Certificate {
    id: number;
    student_id: number;
    course_id: number;
    score?: number | null;
    issued_at: string;
    course_title?: string;
    course_thumbnail?: string | null;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface JwtPayload {
    id: number;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    name: string;
    exp: number;
    iat: number;
}
