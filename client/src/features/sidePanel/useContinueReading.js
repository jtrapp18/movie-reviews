import { useEffect, useState } from 'react';

/**
 * Local-only “resume” list (no server tracking). Updated when users open posts
 * from cards (home grid / continue rail).
 */
const STORAGE_KEY = 'movie-reviews-continue-reading';
/** MRU cap — aligns with typical CONTINUE rail length */
const MAX_ITEMS = 5;

/** Same-tab updates (localStorage “storage” event does not fire in the active tab). */
export const CONTINUE_READING_UPDATED_EVENT = 'movie-reviews-continue-reading-updated';

function readItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Record a post open for the CONTINUE rail (MRU, deduped by path).
 * @param {{ path: string, title: string, kind?: 'movieReview' | 'article' }} entry
 */
export function appendContinueReading(entry) {
  const { path, title, kind } = entry;
  if (!path) return;

  const items = readItems();
  const filtered = items.filter((i) => i.path !== path);
  const next = [
    {
      path,
      title: title?.trim() || 'Untitled',
      kind,
      ts: Date.now(),
    },
    ...filtered,
  ].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CONTINUE_READING_UPDATED_EVENT));
}

/**
 * @returns {{ items: Array<{ path: string, title: string, kind?: string, ts?: number }> }}
 */
export function useContinueReading() {
  const [items, setItems] = useState(() => readItems());

  useEffect(() => {
    const sync = () => setItems(readItems());
    window.addEventListener(CONTINUE_READING_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONTINUE_READING_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return { items };
}

export { STORAGE_KEY as CONTINUE_READING_STORAGE_KEY };
