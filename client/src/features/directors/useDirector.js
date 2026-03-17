import { useState, useEffect, useCallback } from 'react';
import { getJSON } from '@helper';
import { getEntity, setEntity } from '@features/cache/entityStore';

const ENTITY_KEY = 'director';

export function useDirector(directorId) {
  const [director, setDirector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDirector = useCallback(async () => {
    if (!directorId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON('directors', directorId);
      if (!data || data.error) {
        setDirector(null);
        setError(data?.error || 'Director not found');
        return;
      }
      setDirector(data);
      setEntity(ENTITY_KEY, directorId, data);
    } catch (err) {
      console.error('Error fetching director:', err);
      setError('Failed to load director details');
    } finally {
      setLoading(false);
    }
  }, [directorId]);

  useEffect(() => {
    if (!directorId) return;
    const cached = getEntity(ENTITY_KEY, directorId);
    if (cached) {
      setDirector(cached);
      setLoading(false);
      // Revalidate in the background
      fetchDirector();
    } else {
      fetchDirector();
    }
  }, [directorId, fetchDirector]);

  return { director, loading, error, refetch: fetchDirector, setDirector };
}
