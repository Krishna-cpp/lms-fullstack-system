"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAssignment = submitAssignment;
exports.submissionsByAssignment = submissionsByAssignment;
const db_1 = __importDefault(require("../config/db"));
async function submitAssignment(req, res) {
    try {
        const studentId = req.user.id;
        const { assignment_id } = req.body;
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        // Check assignment exists
        const [assignRows] = await db_1.default.execute('SELECT id FROM assignments WHERE id = ?', [assignment_id]);
        if (assignRows.length === 0) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }
        // Upsert submission
        const [existing] = await db_1.default.execute('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?', [assignment_id, studentId]);
        if (existing.length > 0) {
            // Update existing submission
            await db_1.default.execute('UPDATE submissions SET file_url = ?, submitted_at = NOW() WHERE assignment_id = ? AND student_id = ?', [fileUrl, assignment_id, studentId]);
            const [rows] = await db_1.default.execute('SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?', [assignment_id, studentId]);
            res.json(rows[0]);
        }
        else {
            const [result] = await db_1.default.execute('INSERT INTO submissions (assignment_id, student_id, file_url) VALUES (?, ?, ?)', [assignment_id, studentId, fileUrl]);
            const newId = result.insertId;
            const [rows] = await db_1.default.execute('SELECT * FROM submissions WHERE id = ?', [newId]);
            res.status(201).json(rows[0]);
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function submissionsByAssignment(req, res) {
    try {
        const { assignmentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        // Verify instructor owns the course
        const [assignRows] = await db_1.default.execute(`
      SELECT a.*, c.instructor_id
      FROM assignments a
      JOIN lessons l ON l.id = a.lesson_id
      JOIN courses c ON c.id = l.course_id
      WHERE a.id = ?
    `, [assignmentId]);
        const assignment = assignRows[0];
        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }
        if (assignment.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const [rows] = await db_1.default.execute(`
      SELECT s.*, u.name AS student_name, u.email AS student_email
      FROM submissions s
      JOIN users u ON u.id = s.student_id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `, [assignmentId]);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=submission.controller.js.map