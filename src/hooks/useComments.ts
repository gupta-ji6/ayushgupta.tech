import { useCallback, useEffect, useRef, useState } from 'react';

import {
  apiErrorSchema,
  commentCreatedResponseSchema,
  commentsResponseSchema,
  type CommentRecord,
} from '@utils/comments';
import { HttpResponseError, isAbortError, requestJson } from '@utils/http';

const COMMENTS_ENDPOINT = '/api/comments';

const errorMessage =
  'Oops! Fetching comments was unsuccessful. Try again later.';

export type { CommentRecord, CommentStatus } from '@utils/comments';

export interface CommentsError {
  error: string;
  details: string;
}

interface UseCommentsConfig {
  limit?: number;
  offset?: number;
}

function getErrorDetails(error: unknown, fallback: string): string {
  if (error instanceof HttpResponseError) {
    const parsed = apiErrorSchema.safeParse(error.body);
    return parsed.success ? parsed.data.error : fallback;
  }

  return error instanceof Error ? error.message : fallback;
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
  const fetchControllerRef = useRef<AbortController | null>(null);
  const submissionControllersRef = useRef(new Set<AbortController>());

  const fetchComments = useCallback(async () => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ postId });
    if (config?.limit) params.set('limit', String(config.limit));
    if (config?.offset) params.set('offset', String(config.offset));

    try {
      const data = await requestJson(
        `${COMMENTS_ENDPOINT}?${params}`,
        commentsResponseSchema,
        { signal: controller.signal },
      );

      if (!controller.signal.aborted) {
        setComments(data.comments);
        setCount(data.count);
      }
    } catch (requestError: unknown) {
      if (!controller.signal.aborted && !isAbortError(requestError)) {
        setError({
          error: errorMessage,
          details: getErrorDetails(requestError, 'Unknown error'),
        });
      }
    } finally {
      const isCurrentRequest = fetchControllerRef.current === controller;
      if (isCurrentRequest) {
        fetchControllerRef.current = null;
      }
      setLoading((currentLoading) =>
        isCurrentRequest ? false : currentLoading,
      );
    }
  }, [postId, config?.limit, config?.offset]);

  useEffect(() => {
    void fetchComments();

    return () => {
      fetchControllerRef.current?.abort();
      for (const controller of submissionControllersRef.current) {
        controller.abort();
      }
    };
  }, [fetchComments]);

  const addComment = useCallback(
    async ({ content, author }: { content: string; author: string }) => {
      const optimistic: CommentRecord = {
        author,
        content,
        post_id: postId,
        created_at: new Date().toISOString(),
        status: 'sending',
      };
      const controller = new AbortController();
      submissionControllersRef.current.add(controller);

      setComments((prev) => [optimistic, ...prev]);
      setCount((prev) => prev + 1);

      try {
        await requestJson(COMMENTS_ENDPOINT, commentCreatedResponseSchema, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, author, content }),
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setComments((prev) =>
            prev.map((comment) =>
              comment === optimistic
                ? { ...optimistic, status: 'delivered-awaiting-approval' }
                : comment,
            ),
          );
        }
      } catch (requestError: unknown) {
        if (controller.signal.aborted || isAbortError(requestError)) {
          return;
        }

        setError({
          error: errorMessage,
          details: getErrorDetails(requestError, 'Insert failed'),
        });
        setComments((prev) =>
          prev.map((comment) =>
            comment === optimistic
              ? { ...optimistic, status: 'failed' }
              : comment,
          ),
        );
      } finally {
        submissionControllersRef.current.delete(controller);
      }
    },
    [postId],
  );

  return {
    comments,
    addComment,
    refetch: fetchComments,
    count,
    loading,
    error,
  };
};
