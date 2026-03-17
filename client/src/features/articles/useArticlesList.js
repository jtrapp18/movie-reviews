import { useState, useEffect, useCallback } from 'react';
import { getEntity, setEntity } from '@features/cache/entityStore';

const LIST_KEY = 'articlesList:all';

export function useArticlesList(initialArticles) {
  const [articles, setArticles] = useState(initialArticles ?? null);
  const [loading, setLoading] = useState(!initialArticles);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async (searchText = null) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/articles';
      if (searchText) {
        url += `?search=${encodeURIComponent(searchText)}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load articles (${res.status})`);
      }
      const data = await res.json();
      setArticles(data);
      if (!searchText) {
        // Only cache the base list, not searched subsets
        setEntity(LIST_KEY, 'default', data);
      }
      return data;
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles.');
      setArticles([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialArticles && initialArticles.length) {
      setArticles(initialArticles);
      setLoading(false);
      return;
    }
    const cached = getEntity(LIST_KEY, 'default');
    if (cached) {
      setArticles(cached);
      setLoading(false);
      // Revalidate in the background
      fetchArticles();
    } else {
      fetchArticles();
    }
  }, [initialArticles, fetchArticles]);

  return {
    articles: articles ?? [],
    loading,
    error,
    fetchArticles,
    setArticles,
  };
}
