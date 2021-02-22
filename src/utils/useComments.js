/*
  customized use-comments for my use case
  ref - https://github.com/beerose/use-comments/blob/master/src/useComments/index.ts
*/

import { useState, useEffect } from 'react';

const getCommentsQuery = `
query GetComments($postId: String!, $limit: Int, $offset: Int) {
  comments(where: {post_id: {_eq: $postId}}, limit: $limit, offset: $offset, order_by: {created_at: desc}) {
    post_id
    author
    content
    created_at
  }
  comments_aggregate(where: {post_id: {_eq: $postId}}) {
    aggregate {
      count
    }
  }
}
`;

const addNewCommentMutation = `
mutation AddNewComment($postId: String!, $author: String!, $content: String!) {
  insert_comments_one(object: {author: $author, content: $content, post_id: $postId}) {
    post_id
    author
    content
    created_at
    hidden
  }
}
`;

const errorMessage = 'Oops! Fetching comments was unsuccessful. Try again later.';

/**
 * Fetches comments from Hasura backend specified in `hasuraUrl` on mount and whenever
 * `config.limit` or `config.offset` change.
 *
 * @param hasuraUrl URL of the Hasura instance
 * @param postId Comments will be fetched for the post with id `postId`
 * @param config Configurable offset and limit for the GraphQL query to Hasura
 * @returns comments for given post, aggregated count of all comments, error,
 *          loading state and a function to refetch data from backend.
 */

export const useComments = (hasuraUrl, postId, config) => {
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComments = () => {
    setLoading(true);
    fetch(hasuraUrl, {
      method: 'POST',
      headers: {
        'x-hasura-role': 'anonymous',
      },
      body: JSON.stringify({
        query: getCommentsQuery,
        variables: Object.assign(
          Object.assign(
            { postId },
            (config === null || config === void 0 ? void 0 : config.limit) && {
              limit: config.limit,
            },
          ),
          (config === null || config === void 0 ? void 0 : config.offset) && {
            offset: config.offset,
          },
        ),
      }),
    })
      .then(res => res.json())
      .then(res => {
        if (res.errors && res.errors.length) {
          setError({
            error: errorMessage,
            details: res.errors[0].message,
          });
          setLoading(false);
          return;
        }
        setComments(res.data.comments);
        setCount(res.data.comments_aggregate.aggregate.count);
        setLoading(false);
      })
      .catch(err => {
        setError({
          error: errorMessage,
          details: err,
        });
        setLoading(false);
      });
  };

  useEffect(fetchComments, [
    config === null || config === void 0 ? void 0 : config.limit,
    config === null || config === void 0 ? void 0 : config.offset,
  ]);

  const addComment = ({ content, author }) => {
    const createdAt = new Date().toDateString();
    const newComment = {
      author,
      content,
      post_id: postId,
      created_at: createdAt,
      status: 'sending',
    };
    setComments(prev => [newComment, ...prev]);
    setCount(prev => ++prev);
    fetch(hasuraUrl, {
      method: 'POST',
      headers: {
        'x-hasura-role': 'user',
      },
      body: JSON.stringify({
        query: addNewCommentMutation,
        variables: {
          postId,
          content,
          author,
        },
      }),
    })
      .then(res => res.json())
      .then(res => {
        if (res.errors && res.errors.length) {
          setError({
            error: errorMessage,
            details: res.errors[0].message,
          });
          return;
        }
        const remoteComment = res.data.insert_comments_one;
        setComments(prev =>
          prev.map(x =>
            x === newComment
              ? Object.assign(Object.assign({}, remoteComment), {
                status: remoteComment.hidden ? 'delivered-awaiting-approval' : 'added',
              })
              : x,
          ),
        );
      })
      .catch(err => {
        setError({
          error: errorMessage,
          details: err,
        });
        setComments(prev =>
          prev.map(x =>
            x === newComment
              ? Object.assign(Object.assign({}, newComment), { status: 'failed' })
              : x,
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
