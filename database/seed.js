/**
 * seed.js — run with: node seed.js (from the database/ directory)
 * Uses backend node_modules for mysql2 and bcryptjs
 */
const path = require('path');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));
const bcrypt = require(path.join(__dirname, '..', 'backend', 'node_modules', 'bcryptjs'));
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({
    path: path.join(__dirname, '..', 'backend', '.env')
});

async function seed() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms_db',
        multipleStatements: true,
    });

    const conn = await pool.getConnection();

    try {
        console.log('🌱 Starting seed...');

        // ── Categories ───────────────────────────────────────────
        await conn.execute(
            `INSERT IGNORE INTO categories (name, description) VALUES (?, ?)`,
            ['Web Development', 'Frontend and backend web technologies']
        );
        await conn.execute(
            `INSERT IGNORE INTO categories (name, description) VALUES (?, ?)`,
            ['Data Science', 'Machine learning, statistics, and data analysis']
        );

        const [catRows] = await conn.execute('SELECT id, name FROM categories ORDER BY id ASC');
        const webDevCatId = catRows.find(c => c.name === 'Web Development')?.id;
        const dataSciCatId = catRows.find(c => c.name === 'Data Science')?.id;
        console.log(`✅ Categories: Web Dev (${webDevCatId}), Data Science (${dataSciCatId})`);

        // ── Instructor ───────────────────────────────────────────
        const instructorPass = await bcrypt.hash('password', 12);
        await conn.execute(
            `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'instructor')`,
            ['Dr. Eleanor Vance', 'instructor@academia.com', instructorPass]
        );
        const [instrRows] = await conn.execute('SELECT id FROM users WHERE email = ?', ['instructor@academia.com']);
        const instructorId = instrRows[0].id;
        console.log(`✅ Instructor: Dr. Eleanor Vance (id=${instructorId})`);

        // ── Students ─────────────────────────────────────────────
        const studentPass = await bcrypt.hash('password', 12);
        const students = [
            { name: 'Alice Hartwell', email: 'alice@academia.com' },
            { name: 'Bob Okafor', email: 'bob@academia.com' },
        ];
        for (const s of students) {
            await conn.execute(
                `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')`,
                [s.name, s.email, studentPass]
            );
        }
        const [studentRows] = await conn.execute(
            'SELECT id FROM users WHERE email IN (?, ?)',
            ['alice@academia.com', 'bob@academia.com']
        );
        const studentIds = studentRows.map(r => r.id);
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

        const courseIds = [];
        for (const c of courses) {
            const [res] = await conn.execute(
                `INSERT INTO courses (title, description, level, duration_hours, category_id, instructor_id) VALUES (?, ?, ?, ?, ?, ?)`,
                [c.title, c.description, c.level, c.duration_hours, c.category_id, instructorId]
            );
            courseIds.push(res.insertId);
        }
        console.log(`✅ Courses: ${courseIds.join(', ')}`);

        // ── Lessons ──────────────────────────────────────────────
        const lessons = [
            { course_id: courseIds[0], title: 'Variables, Scope & Closures', content: 'Deep dive into var, let, const and lexical scope.', order_index: 1, duration_min: 45 },
            { course_id: courseIds[0], title: 'Promises & Async/Await', content: 'Mastering asynchronous JavaScript with modern syntax.', order_index: 2, duration_min: 60 },
            { course_id: courseIds[0], title: 'ES6 Modules & Tooling', content: 'Import/export, bundlers, and the modern JS ecosystem.', order_index: 3, duration_min: 50 },
            { course_id: courseIds[1], title: 'Angular Standalone Components', content: 'Building self-contained components without NgModules.', order_index: 1, duration_min: 55 },
            { course_id: courseIds[1], title: 'Reactive Forms Deep Dive', content: 'FormBuilder, validators, and dynamic form arrays.', order_index: 2, duration_min: 65 },
        ];

        const lessonIds = [];
        for (const l of lessons) {
            const [res] = await conn.execute(
                'INSERT INTO lessons (course_id, title, content, order_index, duration_min) VALUES (?, ?, ?, ?, ?)',
                [l.course_id, l.title, l.content, l.order_index, l.duration_min]
            );
            lessonIds.push(res.insertId);
        }
        console.log(`✅ Lessons: ${lessonIds.join(', ')}`);

        // ── Quizzes ───────────────────────────────────────────────
        const [quiz1Res] = await conn.execute(
            'INSERT INTO quizzes (lesson_id, title) VALUES (?, ?)',
            [lessonIds[0], 'Scope & Closures Quiz']
        );
        const quiz1Id = quiz1Res.insertId;
        await conn.execute(
            `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz1Id, 'What keyword creates block-scoped variables?', 'var', 'let', 'function', 'const', 'b', 1]
        );
        await conn.execute(
            `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz1Id, 'A closure is a function that remembers its...', 'arguments', 'return value', 'outer scope', 'prototype', 'c', 2]
        );

        const [quiz2Res] = await conn.execute(
            'INSERT INTO quizzes (lesson_id, title) VALUES (?, ?)',
            [lessonIds[1], 'Async JavaScript Quiz']
        );
        const quiz2Id = quiz2Res.insertId;
        await conn.execute(
            `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz2Id, 'What does async/await syntax wrap under the hood?', 'Callbacks', 'Promises', 'Generators', 'Observables', 'b', 1]
        );
        console.log(`✅ Quizzes: ${quiz1Id}, ${quiz2Id}`);

        // ── Assignments ───────────────────────────────────────────
        const [a1] = await conn.execute(
            `INSERT INTO assignments (lesson_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)`,
            [lessonIds[0], 'Closure Challenge', 'Write 3 examples demonstrating closures in real-world scenarios.', '2026-03-15 23:59:00', 100]
        );
        const [a2] = await conn.execute(
            `INSERT INTO assignments (lesson_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)`,
            [lessonIds[3], 'Build a Standalone Component', 'Create a reusable card component using Angular standalone APIs.', '2026-03-20 23:59:00', 100]
        );
        console.log(`✅ Assignments: ${a1.insertId}, ${a2.insertId}`);

        // ── Enrollments ───────────────────────────────────────────
        for (const sid of studentIds) {
            await conn.execute(
                'INSERT IGNORE INTO enrollments (student_id, course_id, progress) VALUES (?, ?, ?)',
                [sid, courseIds[0], Math.floor(Math.random() * 70) + 10]
            );
        }
        await conn.execute(
            'INSERT IGNORE INTO enrollments (student_id, course_id, progress) VALUES (?, ?, ?)',
            [studentIds[0], courseIds[1], 45]
        );
        console.log('✅ Enrollments created');

        console.log('\n🎉 Seed complete!');
        console.log('─────────────────────────────────────────');
        console.log('Instructor: instructor@academia.com / password');
        console.log('Student:    alice@academia.com / password');
        console.log('Student:    bob@academia.com   / password');
        console.log('─────────────────────────────────────────');
    } finally {
        conn.release();
        await pool.end();
    }
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
