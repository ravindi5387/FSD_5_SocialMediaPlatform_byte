import type { Response } from 'express';
import { pool } from '../config/db.js';
import { profileUpdateSchema } from '../schemas/profile.js';
import type { AuthedRequest } from '../types/index.js';

export async function getMyProfile(req: AuthedRequest, res: Response) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, p.bio, p.avatar_url, p.updated_at,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id)::int AS post_count
     FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
    [req.user!.id]
  );
  return res.json(rows[0]);
}

export async function getProfile(req: AuthedRequest, res: Response) {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) return res.status(400).json({ message: 'Invalid user id' });
  const { rows } = await pool.query(
    `SELECT u.id, u.name, p.bio, p.avatar_url,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id)::int AS post_count
     FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
    [userId]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Profile not found' });
  return res.json(rows[0]);
}

export async function updateMyProfile(req: AuthedRequest, res: Response) {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid profile data' });
  const { bio = '', avatar_url = '' } = parsed.data;
  const { rows } = await pool.query(
    `INSERT INTO profiles (user_id, bio, avatar_url) VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()
     RETURNING *`,
    [req.user!.id, bio, avatar_url]
  );
  return res.json(rows[0]);
}
