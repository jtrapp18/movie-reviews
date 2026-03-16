import { useState, useCallback } from 'react';
import { snakeToCamel } from '@helper';

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

  const fetchPage = useCallback(async (offset = 0, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/notifications?limit=${PAGE_SIZE}&offset=${offset}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view notifications.');
          return;
        }
        setError('Failed to load notifications.');
        return;
      }
      const data = await res.json();
      const camel = snakeToCamel(data);
      const list = camel.items || [];
      if (append) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
      }
      setTotal(camel.total ?? 0);
      setUnreadCount(camel.unreadCount ?? 0);
      setHasMore(camel.hasMore ?? false);
    } catch (err) {
      console.error('Notifications fetch failed', err);
      setError('Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        setItems((prev) =>
          prev.map((item) =>
            events.some(
              (e) => e.eventType === item.eventType && e.eventId === item.eventId
            )
              ? { ...item, read: true }
              : item
          )
        );
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
