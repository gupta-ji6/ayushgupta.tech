import { useCallback, useEffect, useState } from 'react';

const COMMENTS_ENDPOINT = '/api/comments';

const errorMessage =
  'Oops! Fetching comments was unsuccessful. Try again later.';

export type CommentStatus =
  | 'sending'
  | 'delivered-awaiting-approval'
  | 'failed';

export interface CommentRecord {
  post_id: string;
  author: string;
  content: string;
  created_at: string;
  status?: CommentStatus;
}

export interface CommentsError {
  error: string;
  details: string;
}

interface UseCommentsConfig {
  limit?: number;
  offset?: number;
}

/**
 * Fetches visible comments for a given post from the `/api/comments` proxy on
 * mount and whenever `config.limit` or `config.offset` change.
 *
 * @param postId  Slug or path that groups comments (e.g. '/music/')
 * @param config  Optional `{ limit, offset }` for pagination
 */
export const useComments = (postId: string, config?: UseCommentsConfig) => {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<CommentsError | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ postId });
    if (config?.limit) params.set('limit', String(config.limit));
    if (config?.offset) params.set('offset', String(config.offset));

    fetch(`${COMMENTS_ENDPOINT}?${params}`)
      .then((res) => res.json().then((data) => ({ data, ok: res.ok })))
      .then(({ data, ok }) => {
        if (ok && Array.isArray(data?.comments)) {
          setComments(data.comments);
          setCount(data.count ?? data.comments.length);
        } else {
          setError({
            error: errorMessage,
            details: data?.error ?? 'Unknown error',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError({ error: errorMessage, details: err?.message ?? String(err) });
        setLoading(false);
      });
  }, [postId, config?.limit, config?.offset]);

  useEffect(fetchComments, [fetchComments]);

  const addComment = ({
    content,
    author,
  }: {
    content: string;
    author: string;
  }) => {
    const optimistic: CommentRecord = {
      author,
      content,
      post_id: postId,
      created_at: new Date().toISOString(),
      status: 'sending',
    };
    setComments((prev) => [optimistic, ...prev]);
    setCount((prev) => prev + 1);

    fetch(COMMENTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, author, content }),
    })
      .then((res) => {
        if (res.ok) {
          setComments((prev) =>
            prev.map((x) =>
              x === optimistic
                ? {
                    ...optimistic,
                    status: 'delivered-awaiting-approval' as const,
                  }
                : x,
            ),
          );
        } else {
          return res.json().then((err) => {
            setError({
              error: errorMessage,
              details: err?.error ?? 'Insert failed',
            });
            setComments((prev) =>
              prev.map((x) =>
                x === optimistic
                  ? { ...optimistic, status: 'failed' as const }
                  : x,
              ),
            );
          });
        }
      })
      .catch((err) => {
        setError({ error: errorMessage, details: err?.message ?? String(err) });
        setComments((prev) =>
          prev.map((x) =>
            x === optimistic ? { ...optimistic, status: 'failed' as const } : x,
          ),
        );
      });
  };

  return {
    comments,
    addComment,
    refetch: fetchComments,
    count,
    loading,
    error,
  };
};
