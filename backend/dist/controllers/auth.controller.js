"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? '7d';
async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;
        const [existing] = await db_1.default.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 12);
        const [result] = await db_1.default.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashed, role ?? 'student']);
        const userId = result.insertId;
        const payload = { id: userId, email, role: role ?? 'student', name };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.status(201).json({ token, user: { id: userId, name, email, role: role ?? 'student' } });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const logger_1 = require("../utils/logger");
// ... (existing simplified code)
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const [rows] = await db_1.default.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) {
            (0, logger_1.logLogin)(email, false, ip);
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            (0, logger_1.logLogin)(email, false, ip);
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        (0, logger_1.logLogin)(email, true, ip);
        // Audit login in database
        await db_1.default.execute('INSERT INTO login_history (user_id, ip_address) VALUES (?, ?)', [user.id, ip]);
        const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=auth.controller.js.map