import { useState, useEffect, useCallback } from 'react';
import { getJSON } from '@helper';
import { getEntity, setEntity } from '@features/cache/entityStore';

const ENTITY_KEY = 'movieReview';

export function useMovieReview(movieId) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovie = useCallback(async () => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON('movies', movieId);
      if (!data) {
        setMovie(null);
        return;
      }
      setMovie(data);
      setEntity(ENTITY_KEY, movieId, data);
    } catch (err) {
      console.error('Error fetching movie:', err);
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (!movieId) return;
    const cached = getEntity(ENTITY_KEY, movieId);
    if (cached) {
      setMovie(cached);
      setLoading(false);
      // Always revalidate in the background
      fetchMovie();
    } else {
      fetchMovie();
    }
  }, [movieId, fetchMovie]);

  return { movie, loading, error, refetch: fetchMovie };
}
