import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MotionWrapper from '@styles/MotionWrapper';
import ArticleCard from '@components/cards/ArticleCard';
import SearchBar from '@components/shared-sections/SearchBar';
import PageContainer from '@components/layout/PageContainer';
import { CardContainer } from '@styles';
import Carousel, { ArticleCarouselSlide } from '@components/shared-sections/Carousel';
import { useArticlesList } from '@features/articles/useArticlesList';

function Articles() {
  const {
    articles: contextArticles,
    setArticles: setContextArticles,
    coreDataLoaded,
  } = useOutletContext();
  const { articles, loading, fetchArticles } = useArticlesList(contextArticles);
  const [filteredArticles, setFilteredArticles] = useState(articles ?? []);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setFilteredArticles(articles ?? []);
  }, [articles]);

  const handleSearch = async (searchText) => {
    if (!searchText.trim()) {
      setFilteredArticles(articles);
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
  if (!filteredArticles || !Array.isArray(filteredArticles) || isLoading) {
    return (
      <PageContainer fullHeight>
        <MotionWrapper index={1}>
          <h1>Articles</h1>
        </MotionWrapper>
        <MotionWrapper index={2}>
          <h3>{isLoading ? 'Loading articles...' : 'No articles yet.'}</h3>
        </MotionWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer fullHeight>
      <MotionWrapper index={1}>
        <h1>Articles</h1>
      </MotionWrapper>
      <MotionWrapper index={2}>
        <h3>Browse theme-based articles and essays</h3>
      </MotionWrapper>

      <CardContainer>
        <MotionWrapper index={0}>
          <SearchBar
            key="articles-search"
            enterSearch={handleSearch}
            placeholder={
              isSearching
                ? 'Searching...'
                : "Search articles by title, content, or tags (e.g., 'horror', 'analysis', 'hitchcock')..."
            }
          />
        </MotionWrapper>

        <Carousel showArrows>
          {filteredArticles.map((article) => (
            <ArticleCarouselSlide key={article.id}>
              <ArticleCard article={article} />
            </ArticleCarouselSlide>
          ))}
        </Carousel>
      </CardContainer>
    </PageContainer>
  );
}

export default Articles;
