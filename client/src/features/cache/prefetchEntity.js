import { getEntity, setEntity } from '@features/cache/entityStore';
import { getJSON } from '@helper';

/**
 * Best-effort prefetcher: warms entityStore for a given key/id using getJSON.
 * key: logical cache bucket (e.g. 'movieReview', 'article', 'director')
 * dbKey: resource name used with getJSON (e.g. 'movies', 'articles', 'directors')
 */
export async function prefetchEntity(key, dbKey, id) {
  if (!key || id == null) return;
  const existing = getEntity(key, id);
  if (existing) return;

  try {
    const data = await getJSON(dbKey, id);
    if (data) {
      setEntity(key, id, data);
    }
  } catch {
    // ignore prefetch errors; this is purely an optimization
  }
}
