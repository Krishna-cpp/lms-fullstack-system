import { Request, Response } from 'express';
import pool from '../config/db';

export async function quizzesByLesson(req: Request, res: Response): Promise<void> {
    try {
        const { lessonId } = req.params;
        const [quizzes] = await pool.execute<any[]>(
            'SELECT * FROM quizzes WHERE lesson_id = ?', [lessonId]
        );
        // Attach questions (hide correct_option for students)
        for (const quiz of quizzes as any[]) {
            const [questions] = await pool.execute(
                'SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, order_index FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC',
                [quiz.id]
            );
            quiz.questions = questions;
        }
        res.json(quizzes);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createQuiz(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user!.id;
        const userRole = req.user!.role;
        const { lesson_id, title, questions } = req.body as {
            lesson_id: number;
            title: string;
            questions: Array<{
                question_text: string;
                option_a: string; option_b: string; option_c: string; option_d: string;
                correct_option: 'a' | 'b' | 'c' | 'd';
                order_index: number;
            }>;
        };

        const [lessonRows] = await pool.execute<any[]>(
            `SELECT l.*, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`,
            [lesson_id]
        );
        const lesson = (lessonRows as any[])[0];
        if (!lesson) { res.status(404).json({ error: 'Lesson not found' }); return; }
        if (lesson.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' }); return;
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [quizResult] = await conn.execute<any>(
                'INSERT INTO quizzes (lesson_id, title) VALUES (?, ?)',
                [lesson_id, title]
            );
            const quizId = (quizResult as any).insertId;
            for (const q of questions) {
                await conn.execute(
                    `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.order_index ?? 0]
                );
            }
            await conn.commit();
            const [quizRows] = await conn.execute<any[]>('SELECT * FROM quizzes WHERE id = ?', [quizId]);
            const quiz = (quizRows as any[])[0];
            const [qRows] = await conn.execute('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC', [quizId]);
            quiz.questions = qRows;
            res.status(201).json(quiz);
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function submitQuiz(req: Request, res: Response): Promise<void> {
    try {
        const { quiz_id, answers } = req.body as {
            quiz_id: number;
            answers: { question_id: number; selected_option: string }[];
        };

        const [questions] = await pool.execute<any[]>(
            'SELECT id, correct_option FROM quiz_questions WHERE quiz_id = ?',
            [quiz_id]
        );

        if ((questions as any[]).length === 0) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }

        const correctMap = new Map<number, string>();
        for (const q of questions as any[]) {
            correctMap.set(q.id, q.correct_option);
        }

        const correct: number[] = [];
        const wrong: number[] = [];

        for (const answer of answers) {
            const correctOption = correctMap.get(answer.question_id);
            if (correctOption && answer.selected_option === correctOption) {
                correct.push(answer.question_id);
            } else {
                wrong.push(answer.question_id);
            }
        }

        const total = (questions as any[]).length;
        const score = correct.length;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        res.json({ score, total, percentage, correct, wrong });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
