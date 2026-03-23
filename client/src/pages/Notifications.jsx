import { useEffect, useContext, useRef } from 'react';
import styled from 'styled-components';
import { StaticPageShell } from '@styles';
import { UserContext } from '@context/userProvider';
import LoginMessage from '@components/feedback/LoginMessage';
import { NotificationList, useNotifications } from '@features/notifications';
import Loading from '@components/ui/Loading';
import {
  StaticPageHeader,
  StaticPageSubtitle,
} from '@components/layout/staticPageStyles';

const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: var(--error-bg, #f8d7da);
  color: var(--error-text, #721c24);
  border-radius: 4px;
  font-size: 0.95rem;
`;

function Notifications() {
  const { user } = useContext(UserContext);
  const { items, total, hasMore, isLoading, error, fetchPage, loadMore, markAsRead } =
    useNotifications();

  const hasMarkedFirstPage = useRef(false);

  useEffect(() => {
    if (user) {
      fetchPage(0, false);
      hasMarkedFirstPage.current = false;
    }
  }, [user, fetchPage]);

  useEffect(() => {
    if (!user || !items.length || hasMarkedFirstPage.current) return;
    const unread = items.filter((i) => !i.read);
    if (unread.length > 0) {
      markAsRead(unread.map((i) => ({ eventType: i.eventType, eventId: i.eventId })));
      hasMarkedFirstPage.current = true;
    }
  }, [user, items, markAsRead]);

  if (!user) {
    return (
      <StaticPageShell>
        <LoginMessage message="Log in to view your notifications." />
      </StaticPageShell>
    );
  }

  return (
    <StaticPageShell>
      <StaticPageHeader>
        <h1>Notifications</h1>
        {total > 0 ? (
          <StaticPageSubtitle>
            {`${total} notification${total !== 1 ? 's' : ''}`}
          </StaticPageSubtitle>
        ) : null}
      </StaticPageHeader>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {isLoading && items.length === 0 ? (
        <Loading />
      ) : (
        <NotificationList
          items={items}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isLoading={isLoading}
        />
      )}
    </StaticPageShell>
  );
}

export default Notifications;
