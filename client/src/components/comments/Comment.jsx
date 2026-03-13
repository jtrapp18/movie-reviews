import { useState } from 'react';
import styled from 'styled-components';
import CommentForm from './CommentForm';

const Wrapper = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  flex-wrap: wrap;
`;

const Author = styled.span`
  font-weight: 600;
  color: var(--font-color);
`;

const Meta = styled.span`
  font-size: 0.85rem;
  color: var(--font-color-2);
`;

const Body = styled.p`
  margin: 0 0 0.5rem 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ReplyToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  // color: var(--cinema-gold);
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const Replies = styled.div`
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid var(--border);
`;

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Comment({ comment, reviewId, onReplySuccess }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const authorName = comment.user?.username ?? comment.user?.firstName ?? 'Anonymous';
  const replies = comment.replies ?? [];

  return (
    <Wrapper>
      <Header>
        <Author>{authorName}</Author>
        <Meta>{formatDate(comment.createdAt)}</Meta>
      </Header>
      <Body>{comment.body}</Body>
      <ReplyToggle type="button" onClick={() => setShowReplyForm((v) => !v)}>
        {showReplyForm ? 'Cancel' : 'Reply'}
      </ReplyToggle>
      {showReplyForm && (
        <CommentForm
          reviewId={reviewId}
          parentCommentId={comment.id}
          onSuccess={(newComment) => {
            setShowReplyForm(false);
            onReplySuccess?.(newComment);
          }}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
      {replies.length > 0 && (
        <Replies>
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              reviewId={reviewId}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </Replies>
      )}
    </Wrapper>
  );
}

export default Comment;
