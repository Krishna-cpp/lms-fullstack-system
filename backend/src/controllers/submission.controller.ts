import { Request, Response } from 'express';
import pool from '../config/db';

export async function submitAssignment(req: Request, res: Response): Promise<void> {
    try {
        const studentId = req.user!.id;
        const { assignment_id } = req.body as { assignment_id: number | string };

        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const fileUrl = `/uploads/${req.file.filename}`;

        // Check assignment exists
        const [assignRows] = await pool.execute<any[]>(
            'SELECT id FROM assignments WHERE id = ?', [assignment_id]
        );
        if ((assignRows as any[]).length === 0) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        // Upsert submission
        const [existing] = await pool.execute<any[]>(
            'SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?',
            [assignment_id, studentId]
        );

        if ((existing as any[]).length > 0) {
            // Update existing submission
            await pool.execute(
                'UPDATE submissions SET file_url = ?, submitted_at = NOW() WHERE assignment_id = ? AND student_id = ?',
                [fileUrl, assignment_id, studentId]
            );
            const [rows] = await pool.execute<any[]>(
                'SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?',
                [assignment_id, studentId]
            );
            res.json((rows as any[])[0]);
        } else {
            const [result] = await pool.execute<any>(
                'INSERT INTO submissions (assignment_id, student_id, file_url) VALUES (?, ?, ?)',
                [assignment_id, studentId, fileUrl]
            );
            const newId = (result as any).insertId;
            const [rows] = await pool.execute<any[]>('SELECT * FROM submissions WHERE id = ?', [newId]);
            res.status(201).json((rows as any[])[0]);
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function submissionsByAssignment(req: Request, res: Response): Promise<void> {
    try {
        const { assignmentId } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        // Verify instructor owns the course
        const [assignRows] = await pool.execute<any[]>(`
      SELECT a.*, c.instructor_id
      FROM assignments a
      JOIN lessons l ON l.id = a.lesson_id
      JOIN courses c ON c.id = l.course_id
      WHERE a.id = ?
    `, [assignmentId]);

        const assignment = (assignRows as any[])[0];
        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }
        if (assignment.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const [rows] = await pool.execute(`
      SELECT s.*, u.name AS student_name, u.email AS student_email
      FROM submissions s
      JOIN users u ON u.id = s.student_id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `, [assignmentId]);

        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
