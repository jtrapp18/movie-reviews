import { useState, useEffect, useCallback } from 'react';
import { getEntity, setEntity } from '@features/cache/entityStore';

const LIST_KEY = 'directorsList:all';

export function useDirectorsList(initialDirectors) {
  const [directors, setDirectors] = useState(initialDirectors ?? null);
  const [loading, setLoading] = useState(!initialDirectors);
  const [error, setError] = useState(null);

  const fetchDirectors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/directors');
      if (!res.ok) {
        throw new Error(`Failed to load directors (${res.status})`);
      }
      const data = await res.json();
      setDirectors(data);
      setEntity(LIST_KEY, 'all', data);
      return data;
    } catch (err) {
      console.error('Error fetching directors:', err);
      setError('Failed to load directors.');
      setDirectors([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialDirectors && initialDirectors.length) {
      setDirectors(initialDirectors);
      setLoading(false);
      return;
    }
    const cached = getEntity(LIST_KEY, 'all');
    if (cached) {
      setDirectors(cached);
      setLoading(false);
      fetchDirectors();
    } else {
      fetchDirectors();
    }
  }, [initialDirectors, fetchDirectors]);

  return {
    directors: directors ?? [],
    loading,
    error,
    fetchDirectors,
    setDirectors,
  };
}
