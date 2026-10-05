import type { NextFunction, Response } from 'express';
import { pool } from '../config/db.js';
import { verifyToken } from '../utils/jwt.js';
import type { AuthedRequest } from '../types/index.js';

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });

    const token = header.slice(7);
    const decoded = verifyToken(token);
    const userId = Number(decoded.sub);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(401).json({ message: 'Invalid token' });

    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    if (!rows[0]) return res.status(401).json({ message: 'User no longer exists' });

    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
