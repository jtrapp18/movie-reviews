import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getJSON } from '@helper';
import { formatRelativeTime } from '@utils/formatting';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
`;

const Row = styled(Link)`
  display: block;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  /* Design token “background 2” — same family as PostCard / rail surfaces */
  background: var(--background-secondary);
  text-decoration: none;
  color: inherit;
  font-size: 0.82rem;
  line-height: 1.4;
  box-sizing: border-box;
  border: none;
  /* Flat at rest — hover matches PostCard (lift + shadow only) */
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    /* Gentler lift than grid PostCards (-2px); same token shadow as PostCard */
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }
`;

const Actor = styled.span`
  font-weight: 600;
`;

const Meta = styled.span`
  color: var(--font-color-2);
  font-size: 0.72rem;
  display: block;
  margin-top: 0.2rem;
`;

const Snippet = styled.span`
  display: block;
  margin-top: 0.25rem;
  color: var(--font-color-2);
  font-size: 0.75rem;
  font-style: italic;
`;

function truncate(s, len = 42) {
  if (!s || typeof s !== 'string') return '';
  const t = s.trim();
  return t.length > len ? `${t.slice(0, len)}…` : t;
}

/**
 * Global site activity: latest comments and review likes (GET /api/activity).
 */
function ActivityFeedList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getJSON('activity');
        if (!cancelled && data?.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: '0.85rem',
          color: 'var(--font-color-2)',
        }}
      >
        Loading…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: '0.9rem',
          color: 'var(--font-color-2)',
        }}
      >
        No recent activity yet.
      </p>
    );
  }

  return (
    <List>
      {items.map((item) => {
        const path = item.review?.path || '/';
        const title = truncate(item.review?.title || 'Untitled', 48);
        const name = item.actor?.username || 'Someone';
        const verb = item.type === 'like' ? 'liked' : 'commented on';

        return (
          <Row key={`${item.type}-${item.id}`} to={path}>
            <span>
              <Actor>{name}</Actor> {verb}{' '}
              <strong title={item.review?.title}>{title}</strong>
            </span>
            {item.type === 'comment' && item.snippet ? (
              <Snippet>{truncate(item.snippet, 90)}</Snippet>
            ) : null}
            <Meta>{formatRelativeTime(item.occurredAt)}</Meta>
          </Row>
        );
      })}
    </List>
  );
}

export default ActivityFeedList;
