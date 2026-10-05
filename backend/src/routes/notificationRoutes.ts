import { Router } from 'express';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../controllers/interactionController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const notificationRoutes = Router();
notificationRoutes.use(requireAuth);
notificationRoutes.get('/', listNotifications);
notificationRoutes.put('/:notificationId/read', markNotificationRead);
notificationRoutes.put('/read-all', markAllNotificationsRead);
