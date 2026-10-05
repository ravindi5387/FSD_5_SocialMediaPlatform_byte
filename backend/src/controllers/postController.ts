import type { Response } from 'express';
import { pool } from '../config/db.js';
import { commentSchema, postSchema } from '../schemas/post.js';
import type { AuthedRequest } from '../types/index.js';

const feedSql = `
SELECT p.id, p.user_id, p.content, p.media_url, p.created_at,
       u.name AS author_name, pr.avatar_url AS author_avatar,
       EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1) AS liked,
       (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id)::int AS like_count,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)::int AS comment_count
FROM posts p
JOIN users u ON u.id = p.user_id
LEFT JOIN profiles pr ON pr.user_id = p.user_id
`;

export async function listPosts(req: AuthedRequest, res: Response) {
  const search = String(req.query.search ?? '').trim();
  const values: unknown[] = [req.user!.id];
  let sql = feedSql;
  if (search) {
    values.push(`%${search}%`);
    sql += `WHERE p.content ILIKE $2 OR u.name ILIKE $2\n`;
  }
  sql += 'ORDER BY p.created_at DESC LIMIT 100';
  const { rows } = await pool.query(sql, values);
  return res.json(rows);
}

export async function listLikedPosts(req: AuthedRequest, res: Response) {
  const { rows } = await pool.query(
    `${feedSql}
     WHERE EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1)
     ORDER BY p.created_at DESC LIMIT 100`,
    [req.user!.id]
  );
  return res.json(rows);
}

export async function listCommentedPosts(req: AuthedRequest, res: Response) {
  const { rows } = await pool.query(
    `${feedSql}
     WHERE EXISTS (SELECT 1 FROM comments c WHERE c.post_id = p.id AND c.user_id = $1)
     ORDER BY p.created_at DESC LIMIT 100`,
    [req.user!.id]
  );
  return res.json(rows);
}

export async function createPost(req: AuthedRequest, res: Response) {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Post must contain valid text and optional media URL' });
  const { content, media_url = '' } = parsed.data;
  const { rows } = await pool.query(
    'INSERT INTO posts (user_id, content, media_url) VALUES ($1, $2, $3) RETURNING id, user_id, content, media_url, created_at',
    [req.user!.id, content, media_url]
  );
  return res.status(201).json(rows[0]);
}

export async function deletePost(req: AuthedRequest, res: Response) {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId)) return res.status(400).json({ message: 'Invalid post id' });
  const result = await pool.query('DELETE FROM posts WHERE id = $1 AND user_id = $2', [postId, req.user!.id]);
  if (!result.rowCount) return res.status(404).json({ message: 'Post not found or not owned by you' });
  return res.json({ message: 'Post deleted' });
}

export async function toggleLike(req: AuthedRequest, res: Response) {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId)) return res.status(400).json({ message: 'Invalid post id' });
  const postResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
  if (!postResult.rows[0]) return res.status(404).json({ message: 'Post not found' });
  const ownerId = postResult.rows[0].user_id as number;

  const existing = await pool.query('SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2', [postId, req.user!.id]);
  if (existing.rows[0]) {
    await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, req.user!.id]);
    const count = await pool.query('SELECT COUNT(*)::int AS count FROM likes WHERE post_id = $1', [postId]);
    return res.json({ liked: false, like_count: count.rows[0].count });
  }

  await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, req.user!.id]);
  if (ownerId !== req.user!.id) {
    await pool.query(
      `INSERT INTO notifications (recipient_id, actor_id, type, post_id, message)
       VALUES ($1, $2, 'like', $3, $4)`,
      [ownerId, req.user!.id, postId, `${req.user!.name} liked your post.`]
    );
  }
  const count = await pool.query('SELECT COUNT(*)::int AS count FROM likes WHERE post_id = $1', [postId]);
  return res.json({ liked: true, like_count: count.rows[0].count });
}

export async function listComments(req: AuthedRequest, res: Response) {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId)) return res.status(400).json({ message: 'Invalid post id' });
  const { rows } = await pool.query(
    `SELECT c.id, c.post_id, c.user_id, c.content, c.created_at,
            u.name AS author_name, pr.avatar_url AS author_avatar
     FROM comments c JOIN users u ON u.id = c.user_id
     LEFT JOIN profiles pr ON pr.user_id = c.user_id
     WHERE c.post_id = $1 ORDER BY c.created_at ASC`,
    [postId]
  );
  return res.json(rows);
}

export async function createComment(req: AuthedRequest, res: Response) {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId)) return res.status(400).json({ message: 'Invalid post id' });
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Comment must contain 1–500 characters' });

  const postResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
  if (!postResult.rows[0]) return res.status(404).json({ message: 'Post not found' });
  const ownerId = postResult.rows[0].user_id as number;

  const { rows } = await pool.query(
    `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)
     RETURNING id, post_id, user_id, content, created_at`,
    [postId, req.user!.id, parsed.data.content]
  );
  if (ownerId !== req.user!.id) {
    await pool.query(
      `INSERT INTO notifications (recipient_id, actor_id, type, post_id, message)
       VALUES ($1, $2, 'comment', $3, $4)`,
      [ownerId, req.user!.id, postId, `${req.user!.name} commented on your post.`]
    );
  }
  return res.status(201).json(rows[0]);
}
