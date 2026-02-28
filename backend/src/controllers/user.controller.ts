import { Request, Response } from 'express';
import pool from '../config/db';

export async function listUsers(req: Request, res: Response): Promise<void> {
    try {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, avatar_url, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute<any[]>(
            'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?',
            [id]
        );
        const user = (rows as any[])[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const requesterId = req.user!.id;
        const requesterRole = req.user!.role;

        // Only the user themselves or admin can update
        if (requesterId !== Number(id) && requesterRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { name, avatar_url } = req.body as { name?: string; avatar_url?: string | null };
        const fields: string[] = [];
        const values: any[] = [];

        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(avatar_url); }

        if (fields.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        values.push(id);
        await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

        const [rows] = await pool.execute<any[]>(
            'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?', [id]
        );
        res.json((rows as any[])[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
