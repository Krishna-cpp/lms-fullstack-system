/**
 * Seed script — run with: npx ts-node database/seed.ts
 * Populates: 2 categories, 1 instructor, 3 courses, 5 lessons, 2 quizzes, 2 assignments, 3 students enrolled
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Load .env from backend directory
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function seed() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASS ?? '',
        database: process.env.DB_NAME ?? 'lms_db',
        multipleStatements: true,
    });

    const conn = await pool.getConnection();

    try {
        console.log('🌱 Starting seed...');

        // ── Categories ───────────────────────────────────────────
        const [cat1] = await conn.execute<any>(
            `INSERT IGNORE INTO categories (name, description) VALUES (?, ?)`,
            ['Web Development', 'Frontend and backend web technologies']
        );
        const [cat2] = await conn.execute<any>(
            `INSERT IGNORE INTO categories (name, description) VALUES (?, ?)`,
            ['Data Science', 'Machine learning, statistics, and data analysis']
        );

        // Get category IDs
        const [catRows] = await conn.execute<any[]>('SELECT id, name FROM categories ORDER BY id ASC');
        const webDevCatId = (catRows as any[]).find((c: any) => c.name === 'Web Development')?.id;
        const dataSciCatId = (catRows as any[]).find((c: any) => c.name === 'Data Science')?.id;

        console.log(`✅ Categories: Web Dev (${webDevCatId}), Data Science (${dataSciCatId})`);

        // ── Instructor ───────────────────────────────────────────
        const instructorPass = await bcrypt.hash('instructor123', 12);
        await conn.execute(
            `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'instructor')`,
            ['Dr. Eleanor Vance', 'eleanor@lms.dev', instructorPass]
        );
        const [instrRows] = await conn.execute<any[]>('SELECT id FROM users WHERE email = ?', ['eleanor@lms.dev']);
        const instructorId = (instrRows as any[])[0].id;
        console.log(`✅ Instructor: Dr. Eleanor Vance (id=${instructorId})`);

        // ── Students ─────────────────────────────────────────────
        const studentPass = await bcrypt.hash('student123', 12);
        const students = [
            { name: 'Alice Hartwell', email: 'alice@lms.dev' },
            { name: 'Ben Okafor', email: 'ben@lms.dev' },
            { name: 'Clara Mendez', email: 'clara@lms.dev' },
        ];
        for (const s of students) {
            await conn.execute(
                `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')`,
                [s.name, s.email, studentPass]
            );
        }
        const [studentRows] = await conn.execute<any[]>(
            'SELECT id FROM users WHERE email IN (?, ?, ?)',
            ['alice@lms.dev', 'ben@lms.dev', 'clara@lms.dev']
        );
        const studentIds = (studentRows as any[]).map((r: any) => r.id);
        console.log(`✅ Students: ${studentIds.join(', ')}`);

        // ── Courses ──────────────────────────────────────────────
        const courses = [
            {
                title: 'Modern JavaScript Mastery',
                description: 'A comprehensive guide to ES6+, async/await, and modern JS patterns.',
                level: 'intermediate',
                duration_hours: 24,
                category_id: webDevCatId,
            },
            {
                title: 'Angular 17 from Scratch',
                description: 'Build production-grade Angular apps with standalone components and signals.',
                level: 'beginner',
                duration_hours: 18,
                category_id: webDevCatId,
            },
            {
                title: 'Python for Data Science',
                description: 'Master pandas, NumPy, matplotlib, and scikit-learn for real-world data projects.',
                level: 'beginner',
                duration_hours: 30,
                category_id: dataSciCatId,
            },
        ];

        const courseIds: number[] = [];
        for (const c of courses) {
            const [res] = await conn.execute<any>(
                `INSERT INTO courses (title, description, level, duration_hours, category_id, instructor_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [c.title, c.description, c.level, c.duration_hours, c.category_id, instructorId]
            );
            courseIds.push((res as any).insertId);
        }
        console.log(`✅ Courses: ${courseIds.join(', ')}`);

        // ── Lessons (5 total across first 2 courses) ─────────────
        const lessons = [
            { course_id: courseIds[0], title: 'Variables, Scope & Closures', content: 'Deep dive into var, let, const and lexical scope.', order_index: 1, duration_min: 45 },
            { course_id: courseIds[0], title: 'Promises & Async/Await', content: 'Mastering asynchronous JavaScript with modern syntax.', order_index: 2, duration_min: 60 },
            { course_id: courseIds[0], title: 'ES6 Modules & Tooling', content: 'Import/export, bundlers, and the modern JS ecosystem.', order_index: 3, duration_min: 50 },
            { course_id: courseIds[1], title: 'Angular Standalone Components', content: 'Building self-contained components without NgModules.', order_index: 1, duration_min: 55 },
            { course_id: courseIds[1], title: 'Reactive Forms Deep Dive', content: 'FormBuilder, validators, and dynamic form arrays.', order_index: 2, duration_min: 65 },
        ];

        const lessonIds: number[] = [];
        for (const l of lessons) {
            const [res] = await conn.execute<any>(
                'INSERT INTO lessons (course_id, title, content, order_index, duration_min) VALUES (?, ?, ?, ?, ?)',
                [l.course_id, l.title, l.content, l.order_index, l.duration_min]
            );
            lessonIds.push((res as any).insertId);
        }
        console.log(`✅ Lessons: ${lessonIds.join(', ')}`);

        // ── Quizzes (2 quizzes on first 2 lessons) ───────────────
        const quiz1 = await conn.execute<any>(
            'INSERT INTO quizzes (lesson_id, title) VALUES (?, ?)',
            [lessonIds[0], 'Scope & Closures Quiz']
        );
        const quiz1Id = (quiz1[0] as any).insertId;

        await conn.execute(
            `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz1Id, 'What keyword creates block-scoped variables?', 'var', 'let', 'function', 'const', 'b', 1]
        );
        await conn.execute(
            `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz1Id, 'A closure is a function that remembers its...', 'arguments', 'return value', 'outer scope', 'prototype', 'c', 2]
        );

        const quiz2 = await conn.execute<any>(
            'INSERT INTO quizzes (lesson_id, title) VALUES (?, ?)',
            [lessonIds[1], 'Async JavaScript Quiz']
        );
        const quiz2Id = (quiz2[0] as any).insertId;

        await conn.execute(
            `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz2Id, 'What does async/await syntax wrap under the hood?', 'Callbacks', 'Promises', 'Generators', 'Observables', 'b', 1]
        );

        console.log(`✅ Quizzes: ${quiz1Id}, ${quiz2Id}`);

        // ── Assignments (2 assignments) ───────────────────────────
        const [assign1] = await conn.execute<any>(
            `INSERT INTO assignments (lesson_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)`,
            [lessonIds[0], 'Closure Challenge', 'Write 3 examples demonstrating closures in real-world scenarios.', '2026-03-15 23:59:00', 100]
        );
        const [assign2] = await conn.execute<any>(
            `INSERT INTO assignments (lesson_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)`,
            [lessonIds[3], 'Build a Standalone Component', 'Create a reusable card component using Angular standalone APIs.', '2026-03-20 23:59:00', 100]
        );
        console.log(`✅ Assignments: ${(assign1 as any).insertId}, ${(assign2 as any).insertId}`);

        // ── Enrollments (all 3 students in course 1, 2 students in course 2) ─
        for (const sid of studentIds) {
            await conn.execute(
                'INSERT IGNORE INTO enrollments (student_id, course_id, progress) VALUES (?, ?, ?)',
                [sid, courseIds[0], Math.floor(Math.random() * 80) + 10]
            );
        }
        await conn.execute(
            'INSERT IGNORE INTO enrollments (student_id, course_id, progress) VALUES (?, ?, ?)',
            [studentIds[0], courseIds[1], 45]
        );
        await conn.execute(
            'INSERT IGNORE INTO enrollments (student_id, course_id, progress) VALUES (?, ?, ?)',
            [studentIds[1], courseIds[1], 20]
        );
        console.log('✅ Enrollments created');

        console.log('\n🎉 Seed complete!');
        console.log('─────────────────────────────────────────');
        console.log('Instructor login: eleanor@lms.dev / instructor123');
        console.log('Student logins:   alice@lms.dev / student123');
        console.log('                  ben@lms.dev   / student123');
        console.log('                  clara@lms.dev / student123');
        console.log('─────────────────────────────────────────');
    } finally {
        conn.release();
        await pool.end();
    }
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
