import { Request, Response } from 'express';
import pool from '../config/db';

export async function enroll(req: Request, res: Response): Promise<void> {
    try {
        const studentId = req.user!.id;
        const { course_id } = req.body as { course_id: number };

        const [courseRows] = await pool.execute<any[]>('SELECT id FROM courses WHERE id = ?', [course_id]);
        if ((courseRows as any[]).length === 0) { res.status(404).json({ error: 'Course not found' }); return; }

        const [existing] = await pool.execute<any[]>(
            'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
            [studentId, course_id]
        );
        if ((existing as any[]).length > 0) { res.status(409).json({ error: 'Already enrolled in this course' }); return; }

        const [result] = await pool.execute<any>(
            'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
            [studentId, course_id]
        );
        const newId = (result as any).insertId;
        const [rows] = await pool.execute<any[]>('SELECT * FROM enrollments WHERE id = ?', [newId]);
        res.status(201).json((rows as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function myEnrollments(req: Request, res: Response): Promise<void> {
    try {
        const studentId = req.user!.id;
        const [rows] = await pool.execute(`
      SELECT e.*, c.title AS course_title, c.thumbnail_url AS course_thumbnail,
             c.level, c.duration_hours, u.name AS instructor_name
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      JOIN users u   ON u.id = c.instructor_id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `, [studentId]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function courseEnrollments(req: Request, res: Response): Promise<void> {
    try {
        const { courseId } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const [courseRows] = await pool.execute<any[]>('SELECT instructor_id FROM courses WHERE id = ?', [courseId]);
        const course = (courseRows as any[])[0];
        if (!course) { res.status(404).json({ error: 'Course not found' }); return; }
        if (course.instructor_id !== userId && userRole !== 'admin') { res.status(403).json({ error: 'Forbidden' }); return; }

        const [rows] = await pool.execute(`
      SELECT e.*, u.name AS student_name, u.email AS student_email, u.avatar_url
      FROM enrollments e
      JOIN users u ON u.id = e.student_id
      WHERE e.course_id = ?
      ORDER BY e.enrolled_at DESC
    `, [courseId]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateProgress(req: Request, res: Response): Promise<void> {
    try {
        const studentId = req.user!.id;
        const { course_id, progress } = req.body as { course_id: number; progress: number };

        if (progress < 0 || progress > 100) {
            res.status(400).json({ error: 'Progress must be between 0 and 100' });
            return;
        }

        const completed = progress >= 100;
        await pool.execute(
            'UPDATE enrollments SET progress = ?, completed = ?, completed_at = ? WHERE student_id = ? AND course_id = ?',
            [progress, completed, completed ? new Date() : null, studentId, course_id]
        );

        const [rows] = await pool.execute<any[]>(
            'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
            [studentId, course_id]
        );
        if ((rows as any[]).length === 0) { res.status(404).json({ error: 'Enrollment not found' }); return; }
        res.json((rows as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
