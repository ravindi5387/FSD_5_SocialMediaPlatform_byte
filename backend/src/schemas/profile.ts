import { z } from 'zod';

export const profileUpdateSchema = z.object({
  bio: z.string().trim().max(280).optional(),
  avatar_url: z.string().url().max(600).optional().or(z.literal(''))
});
