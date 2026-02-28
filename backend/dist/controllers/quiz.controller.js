"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizzesByLesson = quizzesByLesson;
exports.createQuiz = createQuiz;
exports.submitQuiz = submitQuiz;
const db_1 = __importDefault(require("../config/db"));
async function quizzesByLesson(req, res) {
    try {
        const { lessonId } = req.params;
        const [quizzes] = await db_1.default.execute('SELECT * FROM quizzes WHERE lesson_id = ?', [lessonId]);
        // Attach questions (hide correct_option for students)
        for (const quiz of quizzes) {
            const [questions] = await db_1.default.execute('SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, order_index FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC', [quiz.id]);
            quiz.questions = questions;
        }
        res.json(quizzes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function createQuiz(req, res) {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { lesson_id, title, questions } = req.body;
        const [lessonRows] = await db_1.default.execute(`SELECT l.*, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, [lesson_id]);
        const lesson = lessonRows[0];
        if (!lesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        if (lesson.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const conn = await db_1.default.getConnection();
        try {
            await conn.beginTransaction();
            const [quizResult] = await conn.execute('INSERT INTO quizzes (lesson_id, title) VALUES (?, ?)', [lesson_id, title]);
            const quizId = quizResult.insertId;
            for (const q of questions) {
                await conn.execute(`INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.order_index ?? 0]);
            }
            await conn.commit();
            const [quizRows] = await conn.execute('SELECT * FROM quizzes WHERE id = ?', [quizId]);
            const quiz = quizRows[0];
            const [qRows] = await conn.execute('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC', [quizId]);
            quiz.questions = qRows;
            res.status(201).json(quiz);
        }
        catch (txErr) {
            await conn.rollback();
            throw txErr;
        }
        finally {
            conn.release();
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function submitQuiz(req, res) {
    try {
        const { quiz_id, answers } = req.body;
        const [questions] = await db_1.default.execute('SELECT id, correct_option FROM quiz_questions WHERE quiz_id = ?', [quiz_id]);
        if (questions.length === 0) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        const correctMap = new Map();
        for (const q of questions) {
            correctMap.set(q.id, q.correct_option);
        }
        const correct = [];
        const wrong = [];
        for (const answer of answers) {
            const correctOption = correctMap.get(answer.question_id);
            if (correctOption && answer.selected_option === correctOption) {
                correct.push(answer.question_id);
            }
            else {
                wrong.push(answer.question_id);
            }
        }
        const total = questions.length;
        const score = correct.length;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        res.json({ score, total, percentage, correct, wrong });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=quiz.controller.js.map