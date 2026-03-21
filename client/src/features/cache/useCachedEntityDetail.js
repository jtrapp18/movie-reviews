import { useState, useEffect, useCallback, useRef } from 'react';
import { getEntity, setEntity as cacheSetEntity } from '@features/cache/entityStore';

/**
 * Generic cached entity loader: memory/localStorage cache + background revalidation.
 * `load(id)` should return `{ entity, error }` where `error` is a string or null.
 * Network failures should throw; they are caught and mapped to `fetchErrorMessage`.
 *
 * `load` may change every render; the latest ref is used so callers need not memoize.
 */
export function useCachedEntityDetail({
  cacheKey,
  id,
  load,
  fetchErrorMessage = 'Failed to load',
}) {
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRef = useRef(load);
  loadRef.current = load;

  const refetch = useCallback(async () => {
    if (id == null || Number.isNaN(id)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await loadRef.current(id);
      if (result.error) {
        setEntity(null);
        setError(result.error);
        return;
      }
      setEntity(result.entity);
      if (result.entity != null) {
        cacheSetEntity(cacheKey, id, result.entity);
      }
    } catch (err) {
      console.error(err);
      setError(fetchErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, cacheKey, fetchErrorMessage]);

  useEffect(() => {
    if (id == null || Number.isNaN(id)) {
      setEntity(null);
      setError(null);
      setLoading(false);
      return;
    }

    const cached = getEntity(cacheKey, id);
    if (cached) {
      setEntity(cached);
      setLoading(false);
      setError(null);
      refetch();
    } else {
      refetch();
    }
  }, [id, cacheKey, refetch]);

  return { entity, loading, error, setEntity, refetch };
}
