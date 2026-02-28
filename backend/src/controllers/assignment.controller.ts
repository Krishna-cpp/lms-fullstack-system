import { Request, Response } from 'express';
import pool from '../config/db';

export async function assignmentsByLesson(req: Request, res: Response): Promise<void> {
    try {
        const { lessonId } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM assignments WHERE lesson_id = ? ORDER BY created_at ASC',
            [lessonId]
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createAssignment(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user!.id;
        const userRole = req.user!.role;
        const { lesson_id, title, description, due_date, max_score } = req.body;

        const [lessonRows] = await pool.execute<any[]>(
            `SELECT l.*, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`,
            [lesson_id]
        );
        const lesson = (lessonRows as any[])[0];
        if (!lesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        if (lesson.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const [result] = await pool.execute<any>(
            'INSERT INTO assignments (lesson_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)',
            [lesson_id, title, description ?? null, due_date ?? null, max_score ?? 100]
        );
        const newId = (result as any).insertId;
        const [rows] = await pool.execute<any[]>('SELECT * FROM assignments WHERE id = ?', [newId]);
        res.status(201).json((rows as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
