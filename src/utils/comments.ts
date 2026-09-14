import { z } from 'zod';

export const MAX_AUTHOR_LENGTH = 100;
export const MAX_CONTENT_LENGTH = 2000;
export const POST_ID_PATTERN = /^\/(blog\/[a-z0-9-]+|music\/)$/;

const trimmedText = (max: number) => z.string().trim().min(1).max(max);
const persistedText = (max: number) =>
  z
    .string()
    .max(max)
    .refine((value) => value.trim().length > 0);

export const commentInputSchema = z.object({
  postId: z.string().regex(POST_ID_PATTERN),
  author: trimmedText(MAX_AUTHOR_LENGTH),
  content: trimmedText(MAX_CONTENT_LENGTH),
});

export const commentRecordSchema = z.object({
  post_id: z.string().regex(POST_ID_PATTERN),
  author: persistedText(MAX_AUTHOR_LENGTH),
  content: persistedText(MAX_CONTENT_LENGTH),
  created_at: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Expected a parseable timestamp',
  }),
});

export const commentsResponseSchema = z.object({
  comments: z.array(commentRecordSchema),
  count: z.number().int().nonnegative(),
});

export const commentCreatedResponseSchema = z.object({
  ok: z.literal(true),
});

export const apiErrorSchema = z.object({
  error: z.string(),
});

export type CommentStatus =
  | 'sending'
  | 'delivered-awaiting-approval'
  | 'failed';

export type CommentRecord = z.infer<typeof commentRecordSchema> & {
  status?: CommentStatus;
};
