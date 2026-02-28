import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { User, JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? '7d';

export async function register(req: Request, res: Response): Promise<void> {
    try {
        const { name, email, password, role } = req.body as {
            name: string; email: string; password: string; role: 'student' | 'instructor';
        };

        const [existing] = await pool.execute<any[]>(
            'SELECT id FROM users WHERE email = ?', [email]
        );
        if ((existing as any[]).length > 0) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }

        const hashed = await bcrypt.hash(password, 12);
        const [result] = await pool.execute<any>(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashed, role ?? 'student']
        );

        const userId = (result as any).insertId;
        const payload: JwtPayload = { id: userId, email, role: role ?? 'student', name };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as any);

        res.status(201).json({ token, user: { id: userId, name, email, role: role ?? 'student' } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

import { logLogin } from '../utils/logger';

// ... (existing simplified code)

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body as { email: string; password: string };
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        const [rows] = await pool.execute<any[]>(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        const user = (rows as User[])[0];
        if (!user) {
            logLogin(email, false, ip as string);
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const valid = await bcrypt.compare(password, user.password!);
        if (!valid) {
            logLogin(email, false, ip as string);
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        logLogin(email, true, ip as string);

        // Audit login in database
        await pool.execute(
            'INSERT INTO login_history (user_id, ip_address) VALUES (?, ?)',
            [user.id, ip]
        );

        const payload: JwtPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as any);

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
