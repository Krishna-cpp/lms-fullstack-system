"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enroll = enroll;
exports.myEnrollments = myEnrollments;
exports.courseEnrollments = courseEnrollments;
exports.updateProgress = updateProgress;
const db_1 = __importDefault(require("../config/db"));
async function enroll(req, res) {
    try {
        const studentId = req.user.id;
        const { course_id } = req.body;
        const [courseRows] = await db_1.default.execute('SELECT id FROM courses WHERE id = ?', [course_id]);
        if (courseRows.length === 0) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const [existing] = await db_1.default.execute('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, course_id]);
        if (existing.length > 0) {
            res.status(409).json({ error: 'Already enrolled in this course' });
            return;
        }
        const [result] = await db_1.default.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [studentId, course_id]);
        const newId = result.insertId;
        const [rows] = await db_1.default.execute('SELECT * FROM enrollments WHERE id = ?', [newId]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function myEnrollments(req, res) {
    try {
        const studentId = req.user.id;
        const [rows] = await db_1.default.execute(`
      SELECT e.*, c.title AS course_title, c.thumbnail_url AS course_thumbnail,
             c.level, c.duration_hours, u.name AS instructor_name
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      JOIN users u   ON u.id = c.instructor_id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `, [studentId]);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function courseEnrollments(req, res) {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const [courseRows] = await db_1.default.execute('SELECT instructor_id FROM courses WHERE id = ?', [courseId]);
        const course = courseRows[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        if (course.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const [rows] = await db_1.default.execute(`
      SELECT e.*, u.name AS student_name, u.email AS student_email, u.avatar_url
      FROM enrollments e
      JOIN users u ON u.id = e.student_id
      WHERE e.course_id = ?
      ORDER BY e.enrolled_at DESC
    `, [courseId]);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function updateProgress(req, res) {
    try {
        const studentId = req.user.id;
        const { course_id, progress } = req.body;
        if (progress < 0 || progress > 100) {
            res.status(400).json({ error: 'Progress must be between 0 and 100' });
            return;
        }
        const completed = progress >= 100;
        await db_1.default.execute('UPDATE enrollments SET progress = ?, completed = ?, completed_at = ? WHERE student_id = ? AND course_id = ?', [progress, completed, completed ? new Date() : null, studentId, course_id]);
        const [rows] = await db_1.default.execute('SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, course_id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Enrollment not found' });
            return;
        }
        res.json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=enrollment.controller.js.map