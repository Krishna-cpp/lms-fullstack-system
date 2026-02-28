/**
 * Seed script — run with: node seed-temp.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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

        const [cat1] = await conn.execute(
            `INSERT IGNORE INTO categories (name, description) VALUES (?, ?)`,
            ['Web Development', 'Frontend and backend web technologies']
        );
        const [cat2] = await conn.execute(
            `INSERT IGNORE INTO categories (name, description) VALUES (?, ?)`,
            ['Data Science', 'Machine learning, statistics, and data analysis']
        );

        const [catRows] = await conn.execute('SELECT id, name FROM categories ORDER BY id ASC');
        const webDevCatId = catRows.find(c => c.name === 'Web Development')?.id;
        const dataSciCatId = catRows.find(c => c.name === 'Data Science')?.id;

        console.log(`✅ Categories: Web Dev (${webDevCatId}), Data Science (${dataSciCatId})`);

        const instructorPass = await bcrypt.hash('instructor123', 12);
        await conn.execute(
            `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'instructor')`,
            ['Dr. Eleanor Vance', 'eleanor@lms.dev', instructorPass]
        );
        const [instrRows] = await conn.execute('SELECT id FROM users WHERE email = ?', ['eleanor@lms.dev']);
        const instructorId = instrRows[0].id;
        console.log(`✅ Instructor: Dr. Eleanor Vance (id=${instructorId})`);

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
        const [studentRows] = await conn.execute(
            'SELECT id FROM users WHERE email IN (?, ?, ?)',
            ['alice@lms.dev', 'ben@lms.dev', 'clara@lms.dev']
        );
        const studentIds = studentRows.map(r => r.id);
        console.log(`✅ Students: ${studentIds.join(', ')}`);

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
                `INSERT INTO courses (title, description, level, duration_hours, category_id, instructor_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [c.title, c.description, c.level, c.duration_hours, c.category_id, instructorId]
            );
            courseIds.push(res.insertId);
        }
        console.log(`✅ Courses: ${courseIds.join(', ')}`);

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

        const quiz1 = await conn.execute(
            'INSERT INTO quizzes (lesson_id, title) VALUES (?, ?)',
            [lessonIds[0], 'Scope & Closures Quiz']
        );
        const quiz1Id = quiz1[0].insertId;

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

        const quiz2 = await conn.execute(
            'INSERT INTO quizzes (lesson_id, title) VALUES (?, ?)',
            [lessonIds[1], 'Async JavaScript Quiz']
        );
        const quiz2Id = quiz2[0].insertId;

        await conn.execute(
            `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz2Id, 'What does async/await syntax wrap under the hood?', 'Callbacks', 'Promises', 'Generators', 'Observables', 'b', 1]
        );

        console.log(`✅ Quizzes: ${quiz1Id}, ${quiz2Id}`);

        const [assign1] = await conn.execute(
            `INSERT INTO assignments (lesson_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)`,
            [lessonIds[0], 'Closure Challenge', 'Write 3 examples demonstrating closures in real-world scenarios.', '2026-03-15 23:59:00', 100]
        );
        const [assign2] = await conn.execute(
            `INSERT INTO assignments (lesson_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)`,
            [lessonIds[3], 'Build a Standalone Component', 'Create a reusable card component using Angular standalone APIs.', '2026-03-20 23:59:00', 100]
        );
        console.log(`✅ Assignments: ${assign1.insertId}, ${assign2.insertId}`);

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
    } finally {
        conn.release();
        await pool.end();
    }
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
