import { Router } from 'express';
import { getMyProfile, getProfile, updateMyProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const profileRoutes = Router();
profileRoutes.use(requireAuth);
profileRoutes.get('/me', getMyProfile);
profileRoutes.put('/me', updateMyProfile);
profileRoutes.get('/:userId', getProfile);
