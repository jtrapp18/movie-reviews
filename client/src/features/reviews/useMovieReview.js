import { useCallback } from 'react';
import { getJSON } from '@helper';
import { useCachedEntityDetail } from '@features/cache/useCachedEntityDetail';

const ENTITY_KEY = 'movieReview';

export function useMovieReview(movieId) {
  const load = useCallback(async (id) => {
    const data = await getJSON('movies', id);
    if (!data) {
      return { entity: null, error: null };
    }
    return { entity: data, error: null };
  }, []);

  const {
    entity: movie,
    loading,
    error,
    setEntity: setMovie,
    refetch,
  } = useCachedEntityDetail({
    cacheKey: ENTITY_KEY,
    id: movieId,
    load,
    fetchErrorMessage: 'Failed to load movie details',
  });

  return { movie, loading, error, setMovie, refetch };
}
