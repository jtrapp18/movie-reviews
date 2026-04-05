import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { ArticleCard } from '@features/articles';
import SearchHeroBanner from '@components/sections/SearchHeroBanner';
import { SearchPageFrame, SearchResultsHeader } from '@features/movies';
import { CardContainer, MediaCardGrid, MediaCardCell, Button } from '@styles';
import { useArticlesList } from '@features/articles/useArticlesList';
import { useAdmin } from '@hooks/useAdmin';

/**
 * Matches SearchResultsGrid horizontal inset; bottom padding so the grid stops before the
 * page edge instead of the last row hugging the viewport bottom.
 */
const ArticlesGridSection = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 0 20px 24px;
  box-sizing: border-box;
`;

const ARTICLE_QUICK_FILTERS = ['analysis', 'horror', 'hitchcock', 'cinematography'];

const AddButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 2% auto 20px auto;
  flex-wrap: wrap;
`;

function Articles() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
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
          {isAdmin && (
            <AddButtonContainer>
              <Button type="button" onClick={() => navigate('/articles/new')}>
                + Add New Article
              </Button>
            </AddButtonContainer>
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
