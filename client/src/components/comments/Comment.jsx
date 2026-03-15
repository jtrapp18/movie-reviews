import { useState, useContext } from 'react';
import styled from 'styled-components';
import CommentForm from './CommentForm';
import LikeButton from '@components/shared-sections/LikeButton';
import { UserContext } from '@context/userProvider';

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
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  flex-wrap: wrap;
`;

const IconBubble = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => props.$color || 'var(--font-color-3)'};
  flex-shrink: 0;
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

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ReplyToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
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

const DEFAULT_ICON_COLOR = '#6b7280';

function Comment({ comment, reviewId, onReplySuccess, onLikeUpdate }) {
  const { user } = useContext(UserContext);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const authorName = comment.user?.username ?? comment.user?.firstName ?? 'Anonymous';
  const iconColor = comment.user?.iconColor ?? DEFAULT_ICON_COLOR;
  const replies = comment.replies ?? [];
  const likeCount = comment.likeCount ?? 0;
  const likedByMe = comment.likedByMe ?? false;

  return (
    <Wrapper>
      <Header>
        <IconBubble $color={iconColor} aria-hidden />
        <Author>{authorName}</Author>
        <Meta>{formatDate(comment.createdAt)}</Meta>
      </Header>
      <Body>{comment.body}</Body>
      <Actions>
        <LikeButton
          type="comment"
          id={comment.id}
          likeCount={likeCount}
          likedByMe={likedByMe}
          disabled={!user}
          onUpdate={onLikeUpdate}
        />
        <ReplyToggle type="button" onClick={() => setShowReplyForm((v) => !v)}>
          {showReplyForm ? 'Cancel' : 'Reply'}
        </ReplyToggle>
      </Actions>
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
              onLikeUpdate={onLikeUpdate}
            />
          ))}
        </Replies>
      )}
    </Wrapper>
  );
}

export default Comment;
