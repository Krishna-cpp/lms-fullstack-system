import { Request, Response } from 'express';
import pool from '../config/db';

export async function lessonsByCourse(req: Request, res: Response): Promise<void> {
    try {
        const { courseId } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
            [courseId]
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createLesson(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user!.id;
        const userRole = req.user!.role;
        const { course_id, title, content, order_index, duration_min } = req.body;

        // Verify ownership
        const [courseRows] = await pool.execute<any[]>(
            'SELECT instructor_id FROM courses WHERE id = ?', [course_id]
        );
        const course = (courseRows as any[])[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        if (course.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const [result] = await pool.execute<any>(
            'INSERT INTO lessons (course_id, title, content, order_index, duration_min) VALUES (?, ?, ?, ?, ?)',
            [course_id, title, content ?? null, order_index ?? 0, duration_min ?? 0]
        );
        const newId = (result as any).insertId;
        const [rows] = await pool.execute<any[]>('SELECT * FROM lessons WHERE id = ?', [newId]);
        res.status(201).json((rows as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateLesson(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const [lessonRows] = await pool.execute<any[]>(
            `SELECT l.*, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, [id]
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

        const { title, content, order_index, duration_min } = req.body;
        const fields: string[] = [];
        const values: any[] = [];

        if (title !== undefined) { fields.push('title = ?'); values.push(title); }
        if (content !== undefined) { fields.push('content = ?'); values.push(content); }
        if (order_index !== undefined) { fields.push('order_index = ?'); values.push(order_index); }
        if (duration_min !== undefined) { fields.push('duration_min = ?'); values.push(duration_min); }

        if (fields.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        values.push(id);
        await pool.execute(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);
        const [updated] = await pool.execute<any[]>('SELECT * FROM lessons WHERE id = ?', [id]);
        res.json((updated as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteLesson(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const [lessonRows] = await pool.execute<any[]>(
            `SELECT l.*, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, [id]
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

        await pool.execute('DELETE FROM lessons WHERE id = ?', [id]);
        res.json({ message: 'Lesson deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
