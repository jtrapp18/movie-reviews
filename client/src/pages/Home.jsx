import { useState, useEffect } from 'react';
import { snakeToCamel } from '@helper';
import styled from 'styled-components';
import { Movies } from '@features/movies';
import { Articles, RecentPosts } from '@features/articles';
import { Directors } from '@features/directors';
import Section from '@components/layout/Section';
import { SearchResultsHeader, SearchPageFrame } from '@features/movies';
import { useOutletContext } from 'react-router-dom';
import SEOHead from '@components/shared-sections/SEOHead';
import { generateWebsiteStructuredData } from '@utils/seoUtils';

const StyledContainer = styled.div`
  padding: 0;
  margin-top: 20px;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 100vh;
`;

function Home() {
  const { movies, articles, posts, directors } = useOutletContext();

  const [showMovies, setShowMovies] = useState([]);
  const [showArticles, setShowArticles] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDirectors, setShowDirectors] = useState([]);

  useEffect(() => {
    setShowMovies(movies ?? []);
  }, [movies]);

  useEffect(() => {
    setShowArticles(articles ?? []);
  }, [articles]);

  useEffect(() => {
    setShowDirectors(directors ?? []);
  }, [directors]);

  const unifiedSearch = async (text) => {
    if (!text.trim()) {
      // If empty search, show all content
      setShowMovies(movies);
      setShowArticles(articles);
      setShowDirectors(directors);
      setIsSearching(false);
      setSearchQuery('');
      return;
    }

    setIsSearching(true);
    setSearchQuery(text);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(text)}`);
      const data = await response.json();

      // Convert snake_case to camelCase for frontend compatibility
      const camelData = snakeToCamel(data);

      setShowMovies(camelData.movies || []);
      setShowArticles(camelData.articles || []);
      setShowDirectors(camelData.directors || []);
    } catch (error) {
      console.error('Error searching:', error);
      // Fallback to showing all content on error
      setShowMovies(movies);
      setShowArticles(articles);
    } finally {
      setIsSearching(false);
    }
  };

  const structuredData = generateWebsiteStructuredData();

  return (
    <>
      <SEOHead
        title="Movie Reviews Hub - Discover Great Films"
        description="Explore detailed movie reviews, ratings, and film analysis. Find your next favorite movie with our comprehensive database of reviews and articles."
        keywords="movie reviews, film analysis, cinema, ratings, movies, film criticism, movie database"
        type="website"
        structuredData={structuredData}
      />
      <StyledContainer>
        <SearchPageFrame
          title={null}
          subtitle={null}
          searchPlaceholder="Search movies, reviews, articles, and tags..."
          onSearch={unifiedSearch}
          isLoading={isSearching}
          loadingText="Searching"
          showHeader={false}
        >
          <>
            {/* Search results header */}
            {searchQuery && (
              <SearchResultsHeader
                searchQuery={searchQuery}
                movieCount={showMovies.length}
                articleCount={showArticles.length}
                isLoading={isSearching}
                showNoResults={
                  !isSearching && showMovies.length === 0 && showArticles.length === 0
                }
              />
            )}

            <Section
              title="Recent Posts"
              subtitle={searchQuery ? '' : 'Latest movie reviews and articles'}
              showSearch={false}
            >
              <RecentPosts posts={posts} />
            </Section>

            <hr />

            <Section
              title="Directors"
              subtitle={searchQuery ? '' : 'Explore directors in the collection'}
              showSearch={false}
            >
              <Directors directors={showDirectors} />
            </Section>

            <Section
              title={searchQuery ? 'Movies' : 'Movie Reviews'}
              subtitle={searchQuery ? '' : 'Click movie to view review'}
              showSearch={false}
            >
              <Movies showMovies={showMovies} enterSearch={unifiedSearch} />
            </Section>

            <Section
              title={searchQuery ? 'Articles' : 'Articles'}
              subtitle={searchQuery ? '' : 'Browse theme-based articles and essays'}
              showSearch={false}
            >
              <Articles showArticles={showArticles} enterSearch={unifiedSearch} />
            </Section>
          </>
        </SearchPageFrame>
      </StyledContainer>
    </>
  );
}

export default Home;
