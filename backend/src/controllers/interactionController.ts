import type { Response } from 'express';
import { pool } from '../config/db.js';
import type { AuthedRequest } from '../types/index.js';

export async function listNotifications(req: AuthedRequest, res: Response) {
  const { rows } = await pool.query(
    `SELECT n.id, n.type, n.post_id, n.message, n.is_read, n.created_at,
            u.id AS actor_id, u.name AS actor_name, p.content AS post_content
     FROM notifications n
     JOIN users u ON u.id = n.actor_id
     LEFT JOIN posts p ON p.id = n.post_id
     WHERE n.recipient_id = $1
     ORDER BY n.created_at DESC LIMIT 50`,
    [req.user!.id]
  );
  const unread = rows.filter((item) => !item.is_read).length;
  return res.json({ items: rows, unread });
}

export async function markNotificationRead(req: AuthedRequest, res: Response) {
  const notificationId = Number(req.params.notificationId);
  if (!Number.isInteger(notificationId)) return res.status(400).json({ message: 'Invalid notification id' });
  const result = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_id = $2',
    [notificationId, req.user!.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: 'Notification not found' });
  return res.json({ message: 'Notification marked as read' });
}

export async function markAllNotificationsRead(req: AuthedRequest, res: Response) {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1', [req.user!.id]);
  return res.json({ message: 'All notifications marked as read' });
}
