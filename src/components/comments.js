import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useComments } from 'use-comments';
import { toast } from 'react-hot-toast';
import { hasuraURL } from '@config';
import { getRelativeTime } from '@utils';
import { theme, mixins } from '@styles';

const { colors, fontSizes, fonts } = theme;

// ======================= STYLED COMPONENTS ========================

const StyledCommentsContainer = styled.section`
  padding: 5vh 0;
  hr {
    margin: 30px 0;
    border: 0;
    border-bottom: 2px dashed ${colors.slate};
  }
`;

const StyledForm = styled.form`
  margin-top: 5vh;
  display: table;
`;

const StyledFormEntry = styled.div`
  display: table-row;
`;

const StyledLabel = styled.label`
  display: table-cell;
  vertical-align: middle;
  margin-bottom: 10px;
  padding-right: 10px;
  font-size: ${fontSizes.xxlarge};
`;

const StyledNameInput = styled.input`
  display: table-cell;
  padding: 10px;
  margin-bottom: 10px;
  background-color: ${colors.lightNavy};
  border-radius: ${theme.borderRadius};
  border: 1px solid ${colors.transGreen};
  color: ${colors.white};
  font-size: ${fontSizes.large};
  width: 50vw;
  max-width: 500px;

  &:focus {
    border: 1px solid ${colors.green};
  }

  &::placeholder {
    color: ${colors.slate};
  }
`;

const StyledTextarea = styled.textarea`
  padding: 10px;
  background-color: ${colors.lightNavy};
  border-radius: ${theme.borderRadius};
  border: 1px solid ${colors.transGreen};
  color: ${colors.white};
  font-family: ${fonts.Calibre};
  font-size: ${fontSizes.xlarge};
  width: 50vw;
  max-width: 500px;

  &:focus {
    border: 1px solid ${colors.green};
  }

  &::placeholder {
    color: ${colors.slate};
  }
`;

const StyledAddCommentBtn = styled.button`
  ${mixins.bigButton};
  margin-top: 5vh;
`;

const StyledCommentCount = styled.div`
  padding: 2vh 0;
  color: ${colors.white};
  font-size: ${fontSizes.h3};
  font-weight: 600;
`;

const StyledComment = styled.div`
  background-color: ${colors.lightNavy};
  border-radius: ${theme.borderRadius};
  padding: 2vw;
  margin-bottom: 2vw;
`;

const StyledCommentAuthor = styled.span`
  color: ${colors.green};
  font-weight: 500;
`;

const StyledCommentContent = styled.div`
  padding-top: 2vh;
`;

// ======================= HELPER FUNCTIONS ========================

const formatStatus = status => {
  switch (status) {
    case 'sending':
      return 'adding comment...';
    case 'added':
      return 'your comment is added';
    case 'delivered-awaiting-approval':
      return 'waiting for author approval';
    case 'failed':
      return 'failed to add comment, try again';
    default:
      return 'adding comment...';
  }
};

// ======================= COMPONENT ========================

const Comment = ({ data }) => {
  const { author, content, created_at, status } = data;
  return (
    <StyledComment>
      <div>
        <StyledCommentAuthor>{author}</StyledCommentAuthor>
        <time dateTime={created_at}>{`・${getRelativeTime(+new Date(created_at))}`}</time>
        <span>{status ? `・ ${formatStatus(status)}` : ''}</span>
      </div>
      <StyledCommentContent>{content}</StyledCommentContent>
    </StyledComment>
  );
};

const Comments = ({ slug = 'defaultSlug' }) => {
  const { comments, count, loading, addComment } = useComments(hasuraURL, slug);
  const [commentData, setCommentData] = useState({
    authorName: '',
    comment: '',
  });

  const onNameChange = event => {
    event.preventDefault();
    event.persist();
    setCommentData(oldCommentData => ({
      ...oldCommentData,
      authorName: event.target.value,
    }));
  };

  const onCommentChange = event => {
    event.preventDefault();
    event.persist();
    setCommentData(oldCommentData => ({
      ...oldCommentData,
      comment: event.target.value,
    }));
  };

  const onSubmitComment = event => {
    event.preventDefault();
    event.persist();
    addComment({
      content: commentData.comment,
      author: commentData.authorName,
    });
    setCommentData({
      authorName: '',
      comment: '',
    });
    toast.success('Your comment is waiting for approval!');
  };

  const renderComments = () => {
    if (loading) {
      return <div>Loading comments...</div>;
    } else if (count === 0) {
      return <StyledCommentCount>No comments yet</StyledCommentCount>;
    } else {
      return (
        <Fragment>
          <StyledCommentCount>{`${count} ${
            count > 1 ? 'comments' : 'comment'
          }`}</StyledCommentCount>
          {comments.map((comment, index) => (
            <Comment key={index} data={comment} />
          ))}
        </Fragment>
      );
    }
  };

  return (
    <StyledCommentsContainer>
      <hr />

      <StyledForm onSubmit={onSubmitComment}>
        <StyledFormEntry>
          <StyledLabel htmlFor="name">Full Name</StyledLabel>
          <StyledNameInput
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            value={commentData.authorName}
            onChange={onNameChange}
            required
          />
        </StyledFormEntry>

        <StyledFormEntry>
          <StyledLabel htmlFor="comment">Comment</StyledLabel>
          <StyledTextarea
            id="comment"
            name="comment"
            placeholder="Write your valuable comment"
            value={commentData.comment}
            onChange={onCommentChange}
            spellcheck={true}
            rows={5}
            required
          />
        </StyledFormEntry>
        <StyledAddCommentBtn type="submit">Add Comment</StyledAddCommentBtn>
      </StyledForm>

      <hr />

      {renderComments()}
    </StyledCommentsContainer>
  );
};

export default Comments;

Comments.propTypes = {
  slug: PropTypes.string,
};

Comment.propTypes = {
  data: PropTypes.object,
};
