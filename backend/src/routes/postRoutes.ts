import { Router } from 'express';
import { createComment, createPost, deletePost, listCommentedPosts, listComments, listLikedPosts, listPosts, toggleLike } from '../controllers/postController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const postRoutes = Router();
postRoutes.use(requireAuth);
postRoutes.get('/', listPosts);
postRoutes.get('/liked', listLikedPosts);
postRoutes.get('/commented', listCommentedPosts);
postRoutes.post('/', createPost);
postRoutes.delete('/:postId', deletePost);
postRoutes.post('/:postId/like', toggleLike);
postRoutes.get('/:postId/comments', listComments);
postRoutes.post('/:postId/comments', createComment);
