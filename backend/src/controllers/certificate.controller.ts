import { Request, Response } from 'express';
import pool from '../config/db';

export async function myCertificates(req: Request, res: Response): Promise<void> {
    try {
        const studentId = req.user!.id;
        const [rows] = await pool.execute(`
      SELECT cert.*, c.title AS course_title, c.thumbnail_url AS course_thumbnail
      FROM certificates cert
      JOIN courses c ON c.id = cert.course_id
      WHERE cert.student_id = ?
      ORDER BY cert.issued_at DESC
    `, [studentId]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function issueCertificate(req: Request, res: Response): Promise<void> {
    try {
        const studentId = req.user!.id;
        const { course_id, score } = req.body as { course_id: number; score?: number };

        // Verify student is enrolled and has completed the course
        const [enrollRows] = await pool.execute<any[]>(
            'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
            [studentId, course_id]
        );
        const enrollment = (enrollRows as any[])[0];
        if (!enrollment) {
            res.status(400).json({ error: 'Not enrolled in this course' });
            return;
        }

        // Check if certificate already exists
        const [existing] = await pool.execute<any[]>(
            'SELECT id FROM certificates WHERE student_id = ? AND course_id = ?',
            [studentId, course_id]
        );
        if ((existing as any[]).length > 0) {
            res.status(409).json({ error: 'Certificate already issued' });
            return;
        }

        // Mark enrollment as completed
        await pool.execute(
            'UPDATE enrollments SET completed = 1, progress = 100, completed_at = NOW() WHERE student_id = ? AND course_id = ?',
            [studentId, course_id]
        );

        const [result] = await pool.execute<any>(
            'INSERT INTO certificates (student_id, course_id, score) VALUES (?, ?, ?)',
            [studentId, course_id, score ?? null]
        );
        const newId = (result as any).insertId;
        const [rows] = await pool.execute<any[]>(`
      SELECT cert.*, c.title AS course_title, c.thumbnail_url AS course_thumbnail
      FROM certificates cert
      JOIN courses c ON c.id = cert.course_id
      WHERE cert.id = ?
    `, [newId]);

        res.status(201).json((rows as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
