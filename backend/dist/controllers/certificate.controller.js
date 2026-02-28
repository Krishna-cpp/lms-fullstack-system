"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myCertificates = myCertificates;
exports.issueCertificate = issueCertificate;
const db_1 = __importDefault(require("../config/db"));
async function myCertificates(req, res) {
    try {
        const studentId = req.user.id;
        const [rows] = await db_1.default.execute(`
      SELECT cert.*, c.title AS course_title, c.thumbnail_url AS course_thumbnail
      FROM certificates cert
      JOIN courses c ON c.id = cert.course_id
      WHERE cert.student_id = ?
      ORDER BY cert.issued_at DESC
    `, [studentId]);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function issueCertificate(req, res) {
    try {
        const studentId = req.user.id;
        const { course_id, score } = req.body;
        // Verify student is enrolled and has completed the course
        const [enrollRows] = await db_1.default.execute('SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, course_id]);
        const enrollment = enrollRows[0];
        if (!enrollment) {
            res.status(400).json({ error: 'Not enrolled in this course' });
            return;
        }
        // Check if certificate already exists
        const [existing] = await db_1.default.execute('SELECT id FROM certificates WHERE student_id = ? AND course_id = ?', [studentId, course_id]);
        if (existing.length > 0) {
            res.status(409).json({ error: 'Certificate already issued' });
            return;
        }
        // Mark enrollment as completed
        await db_1.default.execute('UPDATE enrollments SET completed = 1, progress = 100, completed_at = NOW() WHERE student_id = ? AND course_id = ?', [studentId, course_id]);
        const [result] = await db_1.default.execute('INSERT INTO certificates (student_id, course_id, score) VALUES (?, ?, ?)', [studentId, course_id, score ?? null]);
        const newId = result.insertId;
        const [rows] = await db_1.default.execute(`
      SELECT cert.*, c.title AS course_title, c.thumbnail_url AS course_thumbnail
      FROM certificates cert
      JOIN courses c ON c.id = cert.course_id
      WHERE cert.id = ?
    `, [newId]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=certificate.controller.js.map