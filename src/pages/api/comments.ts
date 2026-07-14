export const prerender = false;
import type { APIRoute } from 'astro';

const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.SUPABASE_KEY;

const MAX_AUTHOR_LENGTH = 100;
const MAX_CONTENT_LENGTH = 2000;
// Matches the post_id values stored in Supabase: '/blog/<slug>' and '/music/'.
const POST_ID_PATTERN = /^\/(blog\/[a-z0-9-]+|music\/)$/;

const supabaseHeaders = {
  apikey: SUPABASE_KEY,
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

export const GET: APIRoute = async ({ url }) => {
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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/comments?${params}`, {
      headers: { ...supabaseHeaders, Prefer: 'count=exact' },
    });

    if (!response.ok) {
      return json({ error: 'Failed to fetch comments.' }, 502);
    }

    const comments = await response.json();
    const range = response.headers.get('content-range');
    const total = range ? Number.parseInt(range.split('/')[1], 10) : NaN;
    const count = Number.isNaN(total)
      ? Array.isArray(comments)
        ? comments.length
        : 0
      : total;

    return json({ comments, count }, 200);
  } catch {
    return json({ error: 'Failed to fetch comments.' }, 502);
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return missingConfigResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { postId, author, content } = (body ?? {}) as Record<string, unknown>;
  const trimmedAuthor = typeof author === 'string' ? author.trim() : '';
  const trimmedContent = typeof content === 'string' ? content.trim() : '';

  if (typeof postId !== 'string' || !POST_ID_PATTERN.test(postId)) {
    return json({ error: 'Invalid postId.' }, 400);
  }
  if (!trimmedAuthor || trimmedAuthor.length > MAX_AUTHOR_LENGTH) {
    return json(
      { error: `Author is required (max ${MAX_AUTHOR_LENGTH} characters).` },
      400,
    );
  }
  if (!trimmedContent || trimmedContent.length > MAX_CONTENT_LENGTH) {
    return json(
      { error: `Content is required (max ${MAX_CONTENT_LENGTH} characters).` },
      400,
    );
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
      method: 'POST',
      headers: { ...supabaseHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({
        post_id: postId,
        author: trimmedAuthor,
        content: trimmedContent,
      }),
    });

    if (!response.ok) {
      return json({ error: 'Failed to add comment.' }, 502);
    }

    return json({ ok: true }, 201);
  } catch {
    return json({ error: 'Failed to add comment.' }, 502);
  }
};

export const ALL: APIRoute = () => json({ error: 'Method not allowed.' }, 405);
