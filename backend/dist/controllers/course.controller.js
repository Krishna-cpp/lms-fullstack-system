"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCourses = listCourses;
exports.getCourseById = getCourseById;
exports.createCourse = createCourse;
exports.updateCourse = updateCourse;
exports.deleteCourse = deleteCourse;
const db_1 = __importDefault(require("../config/db"));
async function listCourses(_req, res) {
    try {
        const [rows] = await db_1.default.execute(`
      SELECT c.*, cat.name AS category_name, u.name AS instructor_name, u.email AS instructor_email
      FROM courses c
      JOIN categories cat ON cat.id = c.category_id
      JOIN users u        ON u.id  = c.instructor_id
      WHERE c.is_published = 1
      ORDER BY c.created_at DESC
    `);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getCourseById(req, res) {
    try {
        const { id } = req.params;
        const [courseRows] = await db_1.default.execute(`
      SELECT c.*, cat.name AS category_name, u.name AS instructor_name, u.email AS instructor_email
      FROM courses c
      JOIN categories cat ON cat.id = c.category_id
      JOIN users u        ON u.id  = c.instructor_id
      WHERE c.id = ?
    `, [id]);
        const course = courseRows[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const [lessons] = await db_1.default.execute('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC', [id]);
        course.lessons = lessons;
        res.json(course);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function createCourse(req, res) {
    try {
        const instructorId = req.user.id;
        const { title, description, thumbnail_url, level, duration_hours, category_id } = req.body;
        const [result] = await db_1.default.execute(`INSERT INTO courses (title, description, thumbnail_url, level, duration_hours, category_id, instructor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [title, description ?? null, thumbnail_url ?? null, level, duration_hours, category_id, instructorId]);
        const newId = result.insertId;
        const [rows] = await db_1.default.execute('SELECT * FROM courses WHERE id = ?', [newId]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function updateCourse(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const [courseRows] = await db_1.default.execute('SELECT * FROM courses WHERE id = ?', [id]);
        const course = courseRows[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        if (course.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const { title, description, thumbnail_url, level, duration_hours, category_id } = req.body;
        const fields = [];
        const values = [];
        if (title !== undefined) {
            fields.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            fields.push('description = ?');
            values.push(description);
        }
        if (thumbnail_url !== undefined) {
            fields.push('thumbnail_url = ?');
            values.push(thumbnail_url);
        }
        if (level !== undefined) {
            fields.push('level = ?');
            values.push(level);
        }
        if (duration_hours !== undefined) {
            fields.push('duration_hours = ?');
            values.push(duration_hours);
        }
        if (category_id !== undefined) {
            fields.push('category_id = ?');
            values.push(category_id);
        }
        if (fields.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        values.push(id);
        await db_1.default.execute(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, values);
        const [updated] = await db_1.default.execute('SELECT * FROM courses WHERE id = ?', [id]);
        res.json(updated[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function deleteCourse(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const [courseRows] = await db_1.default.execute('SELECT * FROM courses WHERE id = ?', [id]);
        const course = courseRows[0];
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        if (course.instructor_id !== userId && userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await db_1.default.execute('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ message: 'Course deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=course.controller.js.map