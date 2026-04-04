import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { ArticleCard } from '@features/articles';
import SearchHeroBanner from '@components/sections/SearchHeroBanner';
import { SearchPageFrame, SearchResultsHeader } from '@features/movies';
import { CardContainer, MediaCardGrid, MediaCardCell } from '@styles';
import { useArticlesList } from '@features/articles/useArticlesList';

/** Matches SearchResultsGrid `GridContainer` so article cards size/spacing match library grid. */
const ArticlesGridSection = styled.div`
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const ARTICLE_QUICK_FILTERS = ['analysis', 'horror', 'hitchcock', 'cinematography'];

function Articles() {
  const {
    articles: contextArticles,
    setArticles: setContextArticles,
    coreDataLoaded,
  } = useOutletContext();
  const { articles, loading, fetchArticles } = useArticlesList(contextArticles);
  const [filteredArticles, setFilteredArticles] = useState(articles ?? []);
  const [isSearching, setIsSearching] = useState(false);
  const [activeQuickSearch, setActiveQuickSearch] = useState(null);
  /** Bar contents (typing updates this; submit / pill sync the same as an Enter search). */
  const [searchInput, setSearchInput] = useState('');
  /** Last term actually searched (empty = browsing full list). Drives results header. */
  const [submittedQuery, setSubmittedQuery] = useState('');

  useEffect(() => {
    if (!submittedQuery.trim()) {
      setFilteredArticles(articles ?? []);
    }
  }, [articles, submittedQuery]);

  const handleSearch = useCallback(
    async (searchText) => {
      const trimmed = typeof searchText === 'string' ? searchText.trim() : '';
      setSearchInput(trimmed);
      setSubmittedQuery(trimmed);

      if (!trimmed) {
        setFilteredArticles(articles ?? []);
        setActiveQuickSearch(null);
        setIsSearching(false);
        return;
      }

      setActiveQuickSearch(ARTICLE_QUICK_FILTERS.includes(trimmed) ? trimmed : null);
      setIsSearching(true);
      try {
        const data = await fetchArticles(trimmed);
        setFilteredArticles(Array.isArray(data) ? data : []);
      } finally {
        setIsSearching(false);
      }
    },
    [articles, fetchArticles]
  );

  useEffect(() => {
    if (!loading && articles && articles.length && setContextArticles) {
      setContextArticles(articles);
    }
  }, [articles, loading, setContextArticles]);

  const isLoading =
    (!coreDataLoaded && (!articles || articles.length === 0)) || loading;

  const hasSubmittedSearch = Boolean(submittedQuery.trim());
  const showArticleNoResults =
    hasSubmittedSearch && !isSearching && filteredArticles.length === 0;

  return (
    <SearchPageFrame
      title={null}
      subtitle={null}
      searchPlaceholder={
        isSearching
          ? 'Searching...'
          : "Search articles by title, content, or tags (e.g., 'horror', 'analysis', 'hitchcock')..."
      }
      onSearch={handleSearch}
      searchValue={searchInput}
      onSearchValueChange={setSearchInput}
      isLoading={isLoading}
      loadingText="Loading articles..."
      showHeader={false}
      heroSearchPrimaryBand
      heroBandBackgroundImage="/images/spotlight.webp"
      searchBarVariant="hero"
      hero={
        <SearchHeroBanner
          title="Articles"
          subtitle="Browse theme-based articles and essays"
        />
      }
      heroBandFooter={
        <SearchHeroBanner
          buttonLabels={ARTICLE_QUICK_FILTERS}
          showDivider={false}
          activeButton={activeQuickSearch}
          onButtonClick={(label) => {
            handleSearch(label);
          }}
        />
      }
    >
      <CardContainer>
        <ArticlesGridSection>
          {!isLoading && (
            <SearchResultsHeader
              searchQuery={submittedQuery}
              articleCount={filteredArticles.length}
              isLoading={isSearching}
              showNoResults={showArticleNoResults}
            />
          )}
          {!isSearching && !showArticleNoResults && filteredArticles.length > 0 ? (
            <MediaCardGrid>
              {filteredArticles.map((article) => (
                <MediaCardCell key={article.id}>
                  <ArticleCard article={article} fillGridCell />
                </MediaCardCell>
              ))}
            </MediaCardGrid>
          ) : null}
        </ArticlesGridSection>
      </CardContainer>
    </SearchPageFrame>
  );
}

export default Articles;
