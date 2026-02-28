import { Request, Response } from 'express';
import pool from '../config/db';

export async function listCourses(_req: Request, res: Response): Promise<void> {
    try {
        const [rows] = await pool.execute(`
      SELECT c.*, cat.name AS category_name, u.name AS instructor_name, u.email AS instructor_email
      FROM courses c
      JOIN categories cat ON cat.id = c.category_id
      JOIN users u        ON u.id  = c.instructor_id
      WHERE c.is_published = 1
      ORDER BY c.created_at DESC
    `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getCourseById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const [courseRows] = await pool.execute<any[]>(`
      SELECT c.*, cat.name AS category_name, u.name AS instructor_name, u.email AS instructor_email
      FROM courses c
      JOIN categories cat ON cat.id = c.category_id
      JOIN users u        ON u.id  = c.instructor_id
      WHERE c.id = ?
    `, [id]);

        const course = (courseRows as any[])[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }

        const [lessons] = await pool.execute(
            'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC', [id]
        );
        course.lessons = lessons;

        res.json(course);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createCourse(req: Request, res: Response): Promise<void> {
    try {
        const instructorId = req.user!.id;
        const { title, description, thumbnail_url, level, duration_hours, category_id } = req.body;

        const [result] = await pool.execute<any>(
            `INSERT INTO courses (title, description, thumbnail_url, level, duration_hours, category_id, instructor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, description ?? null, thumbnail_url ?? null, level, duration_hours, category_id, instructorId]
        );
        const newId = (result as any).insertId;
        const [rows] = await pool.execute<any[]>('SELECT * FROM courses WHERE id = ?', [newId]);
        res.status(201).json((rows as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const [courseRows] = await pool.execute<any[]>('SELECT * FROM courses WHERE id = ?', [id]);
        const course = (courseRows as any[])[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        if (course.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { title, description, thumbnail_url, level, duration_hours, category_id } = req.body;
        const fields: string[] = [];
        const values: any[] = [];

        if (title !== undefined) { fields.push('title = ?'); values.push(title); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (thumbnail_url !== undefined) { fields.push('thumbnail_url = ?'); values.push(thumbnail_url); }
        if (level !== undefined) { fields.push('level = ?'); values.push(level); }
        if (duration_hours !== undefined) { fields.push('duration_hours = ?'); values.push(duration_hours); }
        if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }

        if (fields.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        values.push(id);
        await pool.execute(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, values);

        const [updated] = await pool.execute<any[]>('SELECT * FROM courses WHERE id = ?', [id]);
        res.json((updated as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const [courseRows] = await pool.execute<any[]>('SELECT * FROM courses WHERE id = ?', [id]);
        const course = (courseRows as any[])[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        if (course.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ message: 'Course deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
