"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentsByLesson = assignmentsByLesson;
exports.createAssignment = createAssignment;
const db_1 = __importDefault(require("../config/db"));
async function assignmentsByLesson(req, res) {
    try {
        const { lessonId } = req.params;
        const [rows] = await db_1.default.execute('SELECT * FROM assignments WHERE lesson_id = ? ORDER BY created_at ASC', [lessonId]);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function createAssignment(req, res) {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { lesson_id, title, description, due_date, max_score } = req.body;
        const [lessonRows] = await db_1.default.execute(`SELECT l.*, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, [lesson_id]);
        const lesson = lessonRows[0];
        if (!lesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        if (lesson.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const [result] = await db_1.default.execute('INSERT INTO assignments (lesson_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)', [lesson_id, title, description ?? null, due_date ?? null, max_score ?? 100]);
        const newId = result.insertId;
        const [rows] = await db_1.default.execute('SELECT * FROM assignments WHERE id = ?', [newId]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=assignment.controller.js.map