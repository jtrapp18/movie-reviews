import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '@utils/formatting';

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
      <Time>{formatRelativeTime(eventAt)}</Time>
    </Row>
  );
}
