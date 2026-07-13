import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { toast } from 'react-hot-toast';

import Notifications from '@components/Notifications';
import { useComments, type CommentRecord } from '@hooks/useComments';
import { getRelativeTime } from '@utils/datetime';

import './comments.css';

const formatStatus = (status: CommentRecord['status']) => {
  switch (status) {
    case 'sending':
      return 'adding comment...';
    case 'delivered-awaiting-approval':
      return 'waiting for author approval';
    case 'failed':
      return 'failed to add comment, try again';
    default:
      return 'adding comment...';
  }
};

function Comment({ data }: { data: CommentRecord }) {
  const { author, content, created_at, status } = data;

  return (
    <div className="comment-card">
      <div>
        <span className="comment-author">{author}</span>
        <time
          dateTime={created_at}
        >{`・${getRelativeTime(+new Date(created_at))}`}</time>
        <span>{status ? `・ ${formatStatus(status)}` : ''}</span>
        {author === 'Ayush Gupta' ? (
          <>
            <span>・ </span>
            <span className="comment-author-tag">Author</span>
          </>
        ) : null}
      </div>
      <div className="comment-content">{content}</div>
    </div>
  );
}

export default function Comments({ postId }: { postId: string }) {
  const { comments, count, loading, addComment, error, refetch } =
    useComments(postId);
  const [commentData, setCommentData] = useState({
    authorName: '',
    comment: '',
  });

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCommentData((oldCommentData) => ({
      ...oldCommentData,
      authorName: event.target.value,
    }));
  };

  const onCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCommentData((oldCommentData) => ({
      ...oldCommentData,
      comment: event.target.value,
    }));
  };

  const onSubmitComment = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    addComment({
      content: commentData.comment,
      author: commentData.authorName,
    });
    setCommentData({
      authorName: '',
      comment: '',
    });
    toast.success('Your comment is waiting for approval!', {
      duration: 5000,
    });
  };

  const renderComments = () => {
    if (loading) {
      return <div>Loading comments...</div>;
    } else if (error !== null) {
      return (
        <>
          <div className="comments-count">Failed to load comments.</div>
          <button type="button" className="big-button" onClick={refetch}>
            Re-fetch Comments
          </button>
        </>
      );
    } else if (count === 0) {
      return <div className="comments-count">No comments yet.</div>;
    } else {
      return (
        <>
          <div className="comments-count">
            {`${count} ${count > 1 ? 'comments' : 'comment'}`}
          </div>
          {comments.map((comment, index) => (
            <Comment key={index} data={comment} />
          ))}
        </>
      );
    }
  };

  return (
    <section className="comments-section">
      <hr />

      <form className="comments-form" onSubmit={onSubmitComment}>
        <div className="comments-form-entry">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            value={commentData.authorName}
            onChange={onNameChange}
            required
          />
        </div>

        <div className="comments-form-entry">
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            name="comment"
            placeholder="Write your valuable comment"
            value={commentData.comment}
            onChange={onCommentChange}
            spellCheck={true}
            rows={5}
            required
          />
        </div>
        <button type="submit" className="big-button">
          Add Comment
        </button>
      </form>

      <hr />

      {renderComments()}

      <Notifications />
    </section>
  );
}
