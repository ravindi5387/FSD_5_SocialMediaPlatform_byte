import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { pool } from '../config/db.js';
import type { AuthedRequest } from '../types/index.js';
import { signToken } from '../utils/jwt.js';
import { loginSchema, registerSchema } from '../schemas/auth.js';

export async function register(req: AuthedRequest, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid registration data', issues: parsed.error.flatten() });

  const { name, email, password } = parsed.data;
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows[0]) return res.status(409).json({ message: 'Email is already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email.toLowerCase(), passwordHash]
    );
    const user = userResult.rows[0];
    await client.query('INSERT INTO profiles (user_id, bio, avatar_url) VALUES ($1, $2, $3)', [user.id, 'New on Connectly', '']);
    await client.query('COMMIT');
    return res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ message: 'Registration failed' });
  } finally {
    client.release();
  }
}

export async function login(req: AuthedRequest, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid login data' });

  const { email, password } = parsed.data;
  const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

  const publicUser = { id: user.id, name: user.name, email: user.email };
  return res.json({ user: publicUser, token: signToken(publicUser) });
}

export async function me(req: AuthedRequest, res: Response) {
  return res.json({ user: req.user });
}
