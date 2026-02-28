"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
const db_1 = __importDefault(require("../config/db"));
async function listUsers(req, res) {
    try {
        const [rows] = await db_1.default.execute('SELECT id, name, email, role, avatar_url, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const [rows] = await db_1.default.execute('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?', [id]);
        const user = rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        // Only the user themselves or admin can update
        if (requesterId !== Number(id) && requesterRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const { name, avatar_url } = req.body;
        const fields = [];
        const values = [];
        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }
        if (avatar_url !== undefined) {
            fields.push('avatar_url = ?');
            values.push(avatar_url);
        }
        if (fields.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        values.push(id);
        await db_1.default.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        const [rows] = await db_1.default.execute('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?', [id]);
        res.json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=user.controller.js.map