import { useState, useEffect } from 'react';
import { snakeToCamel } from '@helper';
import styled from 'styled-components';
import { Movies } from '@features/movies';
import { Articles, RecentPosts } from '@features/articles';
import { Directors } from '@features/directors';
import Section from '@components/layout/Section';
import MotionWrapper from '@styles/MotionWrapper';
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

/**
 * Main row: side panel (left on desktop) + Recent Posts (right).
 * Side panel is hidden below 1024px.
 */
const ActivityRecentShell = styled.div`
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: stretch;
    /* Tight space between side panel and Recent Posts */
    gap: 0.5rem;
  }
`;

/**
 * Outer side panel — red background blocks the full column (layout staging).
 * Inner sections (e.g. Activity) sit on top with their own surface.
 */
const SidePanel = styled.aside`
  display: none;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 0.75rem;
  flex: 0 0 280px;
  width: 280px;
  min-height: 0;
  order: 0;
  align-self: stretch;
  box-sizing: border-box;
  padding: 0.75rem;
  border-radius: 8px;
  background: red;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

/** Inner block inside the side panel (Activity, future widgets, …) — not the red shell */
const SidePanelSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
  flex: ${({ $fill }) => ($fill ? '1' : '0 0 auto')};
  padding: 0.65rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--font-color-1, #1a1a1a);
`;

const SidePanelSectionTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
  width: 100%;
`;

/** Placeholder body — fixed footprint; Activity section does not stretch with panel */
const ActivityContentPlaceholder = styled.div`
  min-height: 120px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
  width: 100%;
`;

const RecentPostsBlock = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 5px;

  h1 {
    text-align: center;
    margin: 0;
  }

  h3 {
    margin: 0;
    text-align: center;
  }
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
          containerSize="medium"
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

            <ActivityRecentShell>
              <SidePanel aria-label="Sidebar">
                <SidePanelSection aria-labelledby="side-panel-activity-heading">
                  <MotionWrapper index={1}>
                    <SidePanelSectionTitle id="side-panel-activity-heading">
                      Activity
                    </SidePanelSectionTitle>
                  </MotionWrapper>
                  <ActivityContentPlaceholder />
                </SidePanelSection>
              </SidePanel>

              <RecentPostsBlock>
                <MotionWrapper index={2}>
                  <h1>Recent Posts</h1>
                </MotionWrapper>
                {searchQuery ? null : (
                  <MotionWrapper index={3}>
                    <h3>
                      <i>Latest movie reviews and articles</i>
                    </h3>
                  </MotionWrapper>
                )}
                <RecentPosts posts={posts} fillColumn />
              </RecentPostsBlock>
            </ActivityRecentShell>

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
