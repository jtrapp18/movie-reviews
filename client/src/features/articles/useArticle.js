import { useCallback } from 'react';
import { getJSON, snakeToCamel } from '@helper';
import { useCachedEntityDetail } from '@features/cache/useCachedEntityDetail';

const ENTITY_KEY = 'article';

export function useArticle(reviewId) {
  const load = useCallback(async (id) => {
    const data = await getJSON(`reviews/${id}`);
    if (!data || data.error) {
      return { entity: null, error: data?.error || 'Article not found' };
    }
    return { entity: snakeToCamel(data), error: null };
  }, []);

  const {
    entity: article,
    loading,
    error,
    setEntity: setArticle,
    refetch,
  } = useCachedEntityDetail({
    cacheKey: ENTITY_KEY,
    id: reviewId,
    load,
    fetchErrorMessage: 'Failed to load article',
  });

  return { article, loading, error, setArticle, refetch };
}
