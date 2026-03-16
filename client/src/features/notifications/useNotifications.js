import { useState, useCallback, useEffect } from 'react';
import { snakeToCamel } from '@helper';

// Shared in-memory cache so multiple hooks (bell, page) reuse data
const NOTIFICATION_CACHE_TTL = 60 * 1000; // 60 seconds
let cachedSnapshot = null; // { items, total, unreadCount, hasMore, timestamp }
let inFlightPromise = null;

/**
 * Fetches notifications from GET /api/notifications and provides mark-as-read.
 * @returns {{
 *   items: Array,
 *   total: number,
 *   unreadCount: number,
 *   hasMore: boolean,
 *   isLoading: boolean,
 *   error: string | null,
 *   loadMore: function,
 *   refresh: function,
 *   markAsRead: function
 * }}
 */
export function useNotifications() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 20;

  // Hydrate from cache on first mount for instant UI where possible
  useEffect(() => {
    if (!cachedSnapshot) return;
    const now = Date.now();
    if (now - cachedSnapshot.timestamp > NOTIFICATION_CACHE_TTL) return;
    setItems(cachedSnapshot.items);
    setTotal(cachedSnapshot.total);
    setUnreadCount(cachedSnapshot.unreadCount);
    setHasMore(cachedSnapshot.hasMore);
  }, []);

  const fetchPage = useCallback(
    async (offset = 0, append = false) => {
      setIsLoading(true);
      setError(null);
      try {
        // If we already have a fresh snapshot and we're not appending, reuse it
        const now = Date.now();
        if (
          !append &&
          cachedSnapshot &&
          now - cachedSnapshot.timestamp < NOTIFICATION_CACHE_TTL
        ) {
          setItems(cachedSnapshot.items);
          setTotal(cachedSnapshot.total);
          setUnreadCount(cachedSnapshot.unreadCount);
          setHasMore(cachedSnapshot.hasMore);
          setIsLoading(false);
          return;
        }

        // Deduplicate concurrent initial fetches across components
        if (!append && inFlightPromise) {
          const camel = await inFlightPromise;
          const list = camel.items || [];
          setItems(list);
          setTotal(camel.total ?? 0);
          setUnreadCount(camel.unreadCount ?? 0);
          setHasMore(camel.hasMore ?? false);
          cachedSnapshot = {
            items: list,
            total: camel.total ?? 0,
            unreadCount: camel.unreadCount ?? 0,
            hasMore: camel.hasMore ?? false,
            timestamp: Date.now(),
          };
          setIsLoading(false);
          return;
        }

        const doFetch = async () => {
          const res = await fetch(
            `/api/notifications?limit=${PAGE_SIZE}&offset=${offset}`,
            { credentials: 'include' }
          );
          if (!res.ok) {
            if (res.status === 401) {
              throw new Error('unauthorized');
            }
            throw new Error('failed');
          }
          const data = await res.json();
          return snakeToCamel(data);
        };

        if (!append) {
          inFlightPromise = doFetch();
        }
        const camel = await (inFlightPromise || doFetch());
        const list = camel.items || [];

        if (append) {
          setItems((prev) => [...prev, ...list]);
          // snapshot with appended list for subsequent consumers
          const combined = [...items, ...list];
          cachedSnapshot = {
            items: combined,
            total: camel.total ?? 0,
            unreadCount: camel.unreadCount ?? 0,
            hasMore: camel.hasMore ?? false,
            timestamp: Date.now(),
          };
        } else {
          setItems(list);
          cachedSnapshot = {
            items: list,
            total: camel.total ?? 0,
            unreadCount: camel.unreadCount ?? 0,
            hasMore: camel.hasMore ?? false,
            timestamp: Date.now(),
          };
        }
        setTotal(camel.total ?? 0);
        setUnreadCount(camel.unreadCount ?? 0);
        setHasMore(camel.hasMore ?? false);
      } catch (err) {
        console.error('Notifications fetch failed', err);
        if (err.message === 'unauthorized') {
          setError('Please log in to view notifications.');
        } else {
          setError('Failed to load notifications.');
        }
      } finally {
        setIsLoading(false);
        if (!append) {
          inFlightPromise = null;
        }
      }
    },
    [items, PAGE_SIZE]
  );

  const loadMore = useCallback(() => {
    fetchPage(items.length, true);
  }, [fetchPage, items.length]);

  const refresh = useCallback(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const markAsRead = useCallback(async (events) => {
    if (!events || !events.length) return;
    try {
      const res = await fetch('/api/notifications/mark_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          events: events.map((e) => ({
            event_type: e.eventType,
            event_id: e.eventId,
          })),
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.marked > 0) {
        setItems((prev) => {
          const next = prev.map((item) =>
            events.some(
              (e) => e.eventType === item.eventType && e.eventId === item.eventId
            )
              ? { ...item, read: true }
              : item
          );
          // update cache snapshot so bell/page stay in sync
          if (cachedSnapshot) {
            cachedSnapshot = {
              ...cachedSnapshot,
              items: next,
              unreadCount: Math.max(0, (cachedSnapshot.unreadCount || 0) - data.marked),
              timestamp: Date.now(),
            };
          }
          return next;
        });
        setUnreadCount((c) => Math.max(0, c - data.marked));
      }
    } catch (err) {
      console.error('Mark read failed', err);
    }
  }, []);

  return {
    items,
    total,
    unreadCount,
    hasMore,
    isLoading,
    error,
    fetchPage,
    loadMore,
    refresh,
    markAsRead,
  };
}
