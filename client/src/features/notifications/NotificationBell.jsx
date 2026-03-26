import { useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import { useNotifications, NotificationList } from '@features/notifications';
import DropdownPanel from '@components/ui/DropdownPanel';
import { UserContext } from '@context/userProvider';

const BellWrapper = styled.div`
  position: relative;
`;

const BellButton = styled.button`
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.25rem 0.45rem;
  color: var(--font-color);
  display: flex;
  align-items: center;

  &:hover {
    color: var(--font-color-1);
  }
`;

const BellIcon = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  display: block;
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(40%, -40%);
  background: var(--font-color-1);
  color: #fff;
  border-radius: 999px;
  padding: 0 0.4rem;
  font-size: 0.7rem;
  line-height: 1.4;
  min-width: 1.1rem;
  text-align: center;
`;

const Dropdown = styled(DropdownPanel)`
  width: 280px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  margin-top: 0.4rem;
`;

const Empty = styled.div`
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: var(--font-color-2);
`;

function NotificationBell() {
  const { user } = useContext(UserContext);
  const { items, unreadCount, fetchPage, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Load a small page of notifications once the bell mounts for logged-in users
    fetchPage(0, false);
  }, [user, fetchPage]);

  const unreadItems = items.filter((i) => !i.read);

  if (!user) return null;

  return (
    <BellWrapper
      onMouseOver={() => setIsOpen(true)}
      onMouseOut={() => setIsOpen(false)}
    >
      <BellButton type="button" aria-label="Notifications">
        <BellIcon
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </BellIcon>
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </BellButton>
      <Dropdown className={isOpen ? 'open' : 'closed'}>
        {isLoading && unreadItems.length === 0 ? (
          <Empty>Loading notifications…</Empty>
        ) : unreadItems.length === 0 ? (
          <Empty>No unread notifications.</Empty>
        ) : (
          <NotificationList
            items={unreadItems}
            hasMore={false}
            onLoadMore={() => {}}
            isLoading={false}
          />
        )}
      </Dropdown>
    </BellWrapper>
  );
}

export default NotificationBell;
