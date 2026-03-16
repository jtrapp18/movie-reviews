import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Row = styled(Link)`
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--background-secondary, rgba(0, 0, 0, 0.03));
  }

  &.unread {
    background: var(--background-secondary, rgba(0, 0, 0, 0.04));
  }
`;

const Text = styled.span`
  font-size: 0.95rem;
`;

const Actor = styled.span`
  font-weight: 600;
  color: var(--font-color);
`;

const ReviewRef = styled.span`
  font-size: 0.9rem;
  color: var(--font-color-2);
  display: block;
  margin-top: 0.25rem;
`;

const Time = styled.span`
  font-size: 0.8rem;
  color: var(--font-color-2);
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
