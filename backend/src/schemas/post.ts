import { z } from 'zod';

const mediaValue = z.string().max(4_500_000).refine((value) => {
  if (!value) return true;
  return /^https?:\/\//i.test(value) || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
}, 'Media must be an http(s) URL or an uploaded image');

export const postSchema = z.object({
  content: z.string().trim().max(2000).default(''),
  media_url: mediaValue.optional().default('')
}).refine((data) => data.content.trim().length > 0 || Boolean(data.media_url), {
  message: 'Post must contain text or an image',
  path: ['content']
});

export const commentSchema = z.object({
  content: z.string().trim().min(1).max(500)
});
