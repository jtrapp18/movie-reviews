const COMMENTS_TTL_MS = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map(); // reviewId -> { flatComments, total, timestamp }

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getCachedComments(reviewId) {
  if (!reviewId) return null;
  const now = Date.now();

  const mem = memoryCache.get(reviewId);
  if (mem && now - mem.timestamp < COMMENTS_TTL_MS) {
    return mem;
  }

  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(`comments:${reviewId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (now - parsed.timestamp > COMMENTS_TTL_MS) return null;

    memoryCache.set(reviewId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedComments(reviewId, flatComments, total) {
  if (!reviewId) return;
  const entry = {
    flatComments: flatComments || [],
    total: typeof total === 'number' ? total : 0,
    timestamp: Date.now(),
  };
  memoryCache.set(reviewId, entry);

  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(`comments:${reviewId}`, JSON.stringify(entry));
  } catch {
    // ignore quota / serialization errors
  }
}
