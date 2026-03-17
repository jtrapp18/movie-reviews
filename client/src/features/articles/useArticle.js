import { useState, useEffect, useCallback } from 'react';
import { getJSON, snakeToCamel } from '@helper';
import { getEntity, setEntity } from '@features/cache/entityStore';

const ENTITY_KEY = 'article';

export function useArticle(reviewId) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticle = useCallback(async () => {
    if (!reviewId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON(`reviews/${reviewId}`);
      if (!data || data.error) {
        setArticle(null);
        setError(data?.error || 'Article not found');
        return;
      }
      const transformed = snakeToCamel(data);
      setArticle(transformed);
      setEntity(ENTITY_KEY, reviewId, transformed);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    if (!reviewId) return;
    const cached = getEntity(ENTITY_KEY, reviewId);
    if (cached) {
      setArticle(cached);
      setLoading(false);
      fetchArticle();
    } else {
      fetchArticle();
    }
  }, [reviewId, fetchArticle]);

  return { article, loading, error, setArticle, refetch: fetchArticle };
}
