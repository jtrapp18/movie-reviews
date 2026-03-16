import { useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import { useNotifications, NotificationList } from '@features/notifications';
import DropdownPanel from '@components/ui/DropdownPanel';
import { UserContext } from '@context/userProvider';

const BellWrapper = styled.div`
  position: relative;
  margin-left: 1rem;
`;

const BellButton = styled.button`
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  color: var(--font-color);
  display: flex;
  align-items: center;

  &:hover {
    color: var(--font-color-1);
  }
`;

const BellIcon = styled.span`
  width: 1.25rem;
  height: 1.25rem;
  display: inline-block;
  border-radius: 999px 999px 0 0;
  border: 2px solid currentColor;
  border-bottom: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.25rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0.45rem;
    height: 0.3rem;
    border-radius: 999px;
    background: currentColor;
  }
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
    // Load a small page of notifications once the bell mounts
    fetchPage(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadItems = items.filter((i) => !i.read);

  if (!user) return null;

  return (
    <BellWrapper
      onMouseOver={() => setIsOpen(true)}
      onMouseOut={() => setIsOpen(false)}
    >
      <BellButton type="button" aria-label="Notifications">
        <BellIcon aria-hidden />
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
