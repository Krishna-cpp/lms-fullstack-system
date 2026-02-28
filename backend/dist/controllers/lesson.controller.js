"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonsByCourse = lessonsByCourse;
exports.createLesson = createLesson;
exports.updateLesson = updateLesson;
exports.deleteLesson = deleteLesson;
const db_1 = __importDefault(require("../config/db"));
async function lessonsByCourse(req, res) {
    try {
        const { courseId } = req.params;
        const [rows] = await db_1.default.execute('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC', [courseId]);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function createLesson(req, res) {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { course_id, title, content, order_index, duration_min } = req.body;
        // Verify ownership
        const [courseRows] = await db_1.default.execute('SELECT instructor_id FROM courses WHERE id = ?', [course_id]);
        const course = courseRows[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        if (course.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const [result] = await db_1.default.execute('INSERT INTO lessons (course_id, title, content, order_index, duration_min) VALUES (?, ?, ?, ?, ?)', [course_id, title, content ?? null, order_index ?? 0, duration_min ?? 0]);
        const newId = result.insertId;
        const [rows] = await db_1.default.execute('SELECT * FROM lessons WHERE id = ?', [newId]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function updateLesson(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const [lessonRows] = await db_1.default.execute(`SELECT l.*, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, [id]);
        const lesson = lessonRows[0];
        if (!lesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        if (lesson.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const { title, content, order_index, duration_min } = req.body;
        const fields = [];
        const values = [];
        if (title !== undefined) {
            fields.push('title = ?');
            values.push(title);
        }
        if (content !== undefined) {
            fields.push('content = ?');
            values.push(content);
        }
        if (order_index !== undefined) {
            fields.push('order_index = ?');
            values.push(order_index);
        }
        if (duration_min !== undefined) {
            fields.push('duration_min = ?');
            values.push(duration_min);
        }
        if (fields.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        values.push(id);
        await db_1.default.execute(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);
        const [updated] = await db_1.default.execute('SELECT * FROM lessons WHERE id = ?', [id]);
        res.json(updated[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function deleteLesson(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const [lessonRows] = await db_1.default.execute(`SELECT l.*, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, [id]);
        const lesson = lessonRows[0];
        if (!lesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        if (lesson.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await db_1.default.execute('DELETE FROM lessons WHERE id = ?', [id]);
        res.json({ message: 'Lesson deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=lesson.controller.js.map