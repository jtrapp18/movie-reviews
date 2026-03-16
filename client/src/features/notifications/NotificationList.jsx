import styled from 'styled-components';
import NotificationItem from './NotificationItem';

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const LoadMoreWrap = styled.div`
  padding: 1rem;
  text-align: center;
`;

const LoadMoreBtn = styled.button`
  padding: 0.5rem 1.25rem;
  font-size: 0.95rem;
  cursor: pointer;
  background: var(--background-tertiary);
  border: 1px solid var(--border);
  color: var(--font-color);
  border-radius: 4px;

  &:hover:not(:disabled) {
    background: var(--font-color-1);
    color: var(--background-tertiary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Empty = styled.p`
  text-align: center;
  padding: 2rem;
  color: var(--font-color-2);
  font-size: 1rem;
`;

export default function NotificationList({ items, hasMore, onLoadMore, isLoading }) {
  if (!items || items.length === 0) {
    return <Empty>No notifications yet.</Empty>;
  }

  return (
    <List>
      {items.map((item) => (
        <li key={`${item.eventType}-${item.eventId}`}>
          <NotificationItem item={item} />
        </li>
      ))}
      {hasMore && (
        <LoadMoreWrap>
          <LoadMoreBtn type="button" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading…' : 'Load more'}
          </LoadMoreBtn>
        </LoadMoreWrap>
      )}
    </List>
  );
}
