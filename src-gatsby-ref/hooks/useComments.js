import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = process.env.GATSBY_SUPABASE_URL;
const SUPABASE_KEY = process.env.GATSBY_SUPABASE_KEY;

const errorMessage = 'Oops! Fetching comments was unsuccessful. Try again later.';

const headers = () => ({
  apikey: SUPABASE_KEY,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
});

/**
 * Fetches visible comments for a given post from Supabase on mount and
 * whenever `config.limit` or `config.offset` change.
 *
 * @param {string} postId  Slug or path that groups comments (e.g. '/music/')
 * @param {Object} [config]  Optional `{ limit, offset }` for pagination
 */
export const useComments = (postId, config) => {
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const params = new URLSearchParams({
      post_id: `eq.${postId}`,
      hidden: 'eq.false',
      order: 'created_at.desc',
      select: 'post_id,author,content,created_at',
    });
    if (config?.limit) params.set('limit', config.limit);
    if (config?.offset) params.set('offset', config.offset);

    fetch(`${SUPABASE_URL}/rest/v1/comments?${params}`, {
      headers: { ...headers(), Prefer: 'count=exact' },
    })
      .then(res => {
        const range = res.headers.get('content-range');
        const total = range ? parseInt(range.split('/')[1], 10) : 0;
        return res.json().then(data => ({ data, total }));
      })
      .then(({ data, total }) => {
        if (Array.isArray(data)) {
          setComments(data);
          setCount(total || data.length);
        } else {
          setError({ error: errorMessage, details: data?.message || 'Unknown error' });
        }
        setLoading(false);
      })
      .catch(err => {
        setError({ error: errorMessage, details: err.message || err });
        setLoading(false);
      });
  }, [postId, config?.limit, config?.offset]);

  useEffect(fetchComments, [fetchComments]);

  const addComment = ({ content, author }) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;

    const createdAt = new Date().toISOString();
    const optimistic = {
      author,
      content,
      post_id: postId,
      created_at: createdAt,
      status: 'sending',
    };
    setComments(prev => [optimistic, ...prev]);
    setCount(prev => prev + 1);

    fetch(`${SUPABASE_URL}/rest/v1/comments`, {
      method: 'POST',
      headers: { ...headers(), Prefer: 'return=minimal' },
      body: JSON.stringify({ post_id: postId, author, content }),
    })
      .then(res => {
        if (res.ok) {
          setComments(prev =>
            prev.map(x =>
              x === optimistic ? { ...optimistic, status: 'delivered-awaiting-approval' } : x,
            ),
          );
        } else {
          return res.json().then(err => {
            setError({ error: errorMessage, details: err?.message || 'Insert failed' });
          });
        }
      })
      .catch(err => {
        setError({ error: errorMessage, details: err.message || err });
        setComments(prev =>
          prev.map(x => (x === optimistic ? { ...optimistic, status: 'failed' } : x)),
        );
      });
  };

  return { comments, addComment, refetch: fetchComments, count, loading, error };
};
