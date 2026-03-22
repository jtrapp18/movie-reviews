import { useMemo } from 'react';

/**
 * Local-only “resume” list (no server tracking). Keys are written when we
 * record explicit opens from review/article routes — not generic click analytics.
 */
const STORAGE_KEY = 'movie-reviews-continue-reading';

/**
 * @returns {{ items: Array<{ path: string, title: string, kind?: string, ts?: number }> }}
 */
export function useContinueReading() {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { items: [] };
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [];
      return { items };
    } catch {
      return { items: [] };
    }
  }, []);
}

export { STORAGE_KEY as CONTINUE_READING_STORAGE_KEY };
