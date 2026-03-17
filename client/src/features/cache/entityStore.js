const ENTITY_TTL_MS = 5 * 60 * 1000; // 5 minutes
const memoryStore = new Map(); // key -> Map(id -> { value, timestamp })

function getBucket(key) {
  let bucket = memoryStore.get(key);
  if (!bucket) {
    bucket = new Map();
    memoryStore.set(key, bucket);
  }
  return bucket;
}

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getEntity(key, id) {
  if (!key || id == null) return null;
  const now = Date.now();

  const bucket = memoryStore.get(key);
  if (bucket) {
    const entry = bucket.get(String(id));
    if (entry && now - entry.timestamp < ENTITY_TTL_MS) {
      return entry.value;
    }
  }

  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(`entity:${key}:${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (now - parsed.timestamp > ENTITY_TTL_MS) return null;

    const value = parsed.value;
    getBucket(key).set(String(id), {
      value,
      timestamp: parsed.timestamp,
    });
    return value;
  } catch {
    return null;
  }
}

export function setEntity(key, id, value) {
  if (!key || id == null) return;
  const timestamp = Date.now();
  getBucket(key).set(String(id), { value, timestamp });

  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(
      `entity:${key}:${id}`,
      JSON.stringify({ value, timestamp }),
    );
  } catch {
    // ignore quota/serialization errors
  }
}

export function invalidateEntity(key, id) {
  if (!key) return;
  const bucket = memoryStore.get(key);
  if (bucket && id != null) {
    bucket.delete(String(id));
  }
  const storage = getStorage();
  if (!storage) return;
  if (id != null) {
    storage.removeItem(`entity:${key}:${id}`);
  } else {
    // remove all for this key
    try {
      const prefix = `entity:${key}:`;
      for (let i = storage.length - 1; i >= 0; i -= 1) {
        const k = storage.key(i);
        if (k && k.startsWith(prefix)) {
          storage.removeItem(k);
        }
      }
    } catch {
      // ignore
    }
  }
}
