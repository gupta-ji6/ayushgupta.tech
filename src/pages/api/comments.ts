export const prerender = false;
import type { APIRoute } from 'astro';
import { z } from 'zod';

import {
  MAX_AUTHOR_LENGTH,
  MAX_CONTENT_LENGTH,
  POST_ID_PATTERN,
  commentInputSchema,
  commentRecordSchema,
  commentsResponseSchema,
} from '@utils/comments';
import { request } from '@utils/http';

const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.SUPABASE_KEY;

const supabaseHeaders = {
  apikey: SUPABASE_KEY ?? '',
  'Content-Type': 'application/json',
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function missingConfigResponse(): Response {
  return json(
    { error: 'Comments are not configured on this deployment.' },
    503,
  );
}

export const GET: APIRoute = async ({ url, request: astroRequest }) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return missingConfigResponse();
  }

  const postId = url.searchParams.get('postId') ?? '';
  if (!POST_ID_PATTERN.test(postId)) {
    return json({ error: 'Invalid postId.' }, 400);
  }

  const params = new URLSearchParams({
    post_id: `eq.${postId}`,
    hidden: 'eq.false',
    order: 'created_at.desc',
    select: 'post_id,author,content,created_at',
  });

  const limit = url.searchParams.get('limit');
  const offset = url.searchParams.get('offset');
  if (limit && /^\d+$/.test(limit)) params.set('limit', limit);
  if (offset && /^\d+$/.test(offset)) params.set('offset', offset);

  try {
    const response = await request(
      `${SUPABASE_URL}/rest/v1/comments?${params}`,
      {
        headers: { ...supabaseHeaders, Prefer: 'count=exact' },
        signal: astroRequest.signal,
      },
    );
    const commentsResult = z
      .array(commentRecordSchema)
      .safeParse(await response.json());

    if (!commentsResult.success) {
      return json({ error: 'Failed to fetch comments.' }, 502);
    }

    const range = response.headers.get('content-range');
    const total = range ? Number.parseInt(range.split('/')[1], 10) : NaN;
    const count = Number.isNaN(total) ? commentsResult.data.length : total;

    return json(
      commentsResponseSchema.parse({ comments: commentsResult.data, count }),
      200,
    );
  } catch {
    return json({ error: 'Failed to fetch comments.' }, 502);
  }
};

export const POST: APIRoute = async ({ request: astroRequest }) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return missingConfigResponse();
  }

  let body: unknown;
  try {
    body = await astroRequest.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const parsedBody = commentInputSchema.safeParse(body);
  if (!parsedBody.success) {
    const invalidField = parsedBody.error.issues[0]?.path[0];

    if (invalidField === 'author') {
      return json(
        { error: `Author is required (max ${MAX_AUTHOR_LENGTH} characters).` },
        400,
      );
    }

    if (invalidField === 'content') {
      return json(
        {
          error: `Content is required (max ${MAX_CONTENT_LENGTH} characters).`,
        },
        400,
      );
    }

    return json({ error: 'Invalid postId.' }, 400);
  }

  const { postId, author, content } = parsedBody.data;

  try {
    await request(`${SUPABASE_URL}/rest/v1/comments`, {
      method: 'POST',
      headers: { ...supabaseHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({ post_id: postId, author, content }),
      signal: astroRequest.signal,
    });

    return json({ ok: true }, 201);
  } catch {
    return json({ error: 'Failed to add comment.' }, 502);
  }
};

export const ALL: APIRoute = () => json({ error: 'Method not allowed.' }, 405);
