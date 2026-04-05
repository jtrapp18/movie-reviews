import { useState, useEffect, useCallback } from 'react';
import { getEntity, setEntity } from '@features/cache/entityStore';

const LIST_KEY = 'articlesList:all';

export function useArticlesList(initialArticles) {
  const [articles, setArticles] = useState(initialArticles ?? null);
  const [loading, setLoading] = useState(!initialArticles);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async (searchText = null) => {
    const trimmed =
      typeof searchText === 'string' ? searchText.trim() : '';
    const isSearch = Boolean(trimmed);

    // Full-list loads drive page-level loading; search is handled by the page (isSearching).
    if (!isSearch) {
      setLoading(true);
    }
    setError(null);
    try {
      let url = '/api/articles';
      if (isSearch) {
        url += `?search=${encodeURIComponent(trimmed)}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load articles (${res.status})`);
      }
      const data = await res.json();
      // Keep `articles` as the full catalog; search results are only returned to the caller.
      if (!isSearch) {
        setArticles(data);
        setEntity(LIST_KEY, 'default', data);
      }
      return data;
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles.');
      if (!isSearch) {
        setArticles([]);
      }
      return [];
    } finally {
      if (!isSearch) {
        setLoading(false);
      }
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
