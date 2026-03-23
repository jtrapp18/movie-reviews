import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getJSON } from '@helper';
import { formatRelativeTime } from '@utils/formatting';
import GlowBullet from '@components/ui/GlowBullet';
import Loading from '@components/ui/Loading';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
`;

const Row = styled(Link)`
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: var(--background-secondary);
  text-decoration: none;
  color: inherit;
  font-size: 0.82rem;
  line-height: 1.45;
  box-sizing: border-box;
  border: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }

  &:focus-visible {
    outline: 2px solid var(--cinema-gold-dark, #b8860b);
    outline-offset: 2px;
  }
`;

/** Narrow column so the bullet reads as a list marker, not inline punctuation */
const BulletColumn = styled.div`
  flex-shrink: 0;
  width: 1.35em;
  min-width: 1.35em;
`;

const TextColumn = styled.div`
  flex: 1;
  min-width: 0;
`;

/**
 * div not p: avoid invalid nesting if any global style treats strong as block.
 */
const PrimaryLine = styled.div`
  margin: 0;
  color: var(--font-color-1);

  /* Actor + title: same tag, same metrics (avoids one strong looking “bigger”) */
  strong {
    display: inline;
    font-weight: 600;
    font-size: inherit;
    line-height: inherit;
    font-family: inherit;
    color: var(--font-color-1);
  }
`;

const Meta = styled.span`
  display: block;
  margin-top: 0.3rem;
  color: var(--font-color-2);
  font-size: 0.72rem;
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
    return <Loading text="Loading" size="small" />;
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
        const fullTitle = item.review?.title || 'Untitled';
        const name = item.actor?.username || 'Someone';
        const verb = item.type === 'like' ? 'liked' : 'commented on';

        return (
          <Row key={`${item.type}-${item.id}`} to={path} title={fullTitle}>
            <BulletColumn>
              <GlowBullet variant="column" />
            </BulletColumn>
            <TextColumn>
              <PrimaryLine>
                <strong>{name}</strong> {verb} <strong>{title}</strong>
              </PrimaryLine>
              <Meta>{formatRelativeTime(item.occurredAt)}</Meta>
            </TextColumn>
          </Row>
        );
      })}
    </List>
  );
}

export default ActivityFeedList;
