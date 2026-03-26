import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArticleCard } from '@features/articles';
import SearchHeroBanner from '@components/shared-sections/SearchHeroBanner';
import { SearchPageFrame } from '@features/movies';
import { CardContainer } from '@styles';
import { useArticlesList } from '@features/articles/useArticlesList';
import styled from 'styled-components';

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
`;

const ArticleCardWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

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

  useEffect(() => {
    setFilteredArticles(articles ?? []);
  }, [articles]);

  const handleSearch = async (searchText) => {
    if (!searchText.trim()) {
      setFilteredArticles(articles);
      setActiveQuickSearch(null);
    } else {
      setIsSearching(true);
      const data = await fetchArticles(searchText);
      setFilteredArticles(data);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!loading && articles && articles.length && setContextArticles) {
      setContextArticles(articles);
    }
  }, [articles, loading, setContextArticles]);

  const isLoading =
    (!coreDataLoaded && (!articles || articles.length === 0)) || loading;
  const quickButtons = ['analysis', 'horror', 'hitchcock', 'cinematography'];

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
          buttonLabels={quickButtons}
          activeButton={activeQuickSearch}
          onButtonClick={(label) => {
            setActiveQuickSearch(label);
            handleSearch(label);
          }}
        />
      }
    >
      <CardContainer>
        {Array.isArray(filteredArticles) && filteredArticles.length > 0 ? (
          <ArticlesGrid>
            {filteredArticles.map((article) => (
              <ArticleCardWrapper key={article.id}>
                <ArticleCard article={article} />
              </ArticleCardWrapper>
            ))}
          </ArticlesGrid>
        ) : (
          <p>No articles match your search.</p>
        )}
      </CardContainer>
    </SearchPageFrame>
  );
}

export default Articles;
