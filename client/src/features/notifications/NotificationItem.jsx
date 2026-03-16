import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Row = styled(Link)`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--background-tertiary);
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &.unread {
    background: var(--background-tertiary);
  }

  &:hover {
    background: var(--background-secondary);
  }

  &.unread p {
    font-weight: bold;
  }
`;

const Text = styled.p`
  font-size: .95rem;
  margin: 0;
`;

const Actor = styled.span`
  font-weight: 600;
`;

const ReviewRef = styled.span`
  font-size: .9rem;
  display: block;
  margin: 0.25rem 0;
`;

const Time = styled.span`
  font-size: .8rem;
  display: block;
  margin-top: 0.2rem;
`;

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const sec = Math.floor((now - d) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function NotificationItem({ item }) {
  const { eventType, actorUsername, reviewId, reviewTitle, eventAt, read } = item;
  const label =
    eventType === 'reply' ? ' replied to your comment' : ' liked your comment';

  return (
    <Row
      to={`/articles/${reviewId}`}
      className={read ? '' : 'unread'}
      title={reviewTitle}
    >
      <Text>
        <Actor>{actorUsername || 'Someone'}</Actor>
        {label}
      </Text>
      {reviewTitle && (
        <ReviewRef title={reviewTitle}>
          {reviewTitle.length > 50 ? reviewTitle.slice(0, 50) + '…' : reviewTitle}
        </ReviewRef>
      )}
      <Time>{formatRelative(eventAt)}</Time>
    </Row>
  );
}
