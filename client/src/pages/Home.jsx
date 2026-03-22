import { useState, useEffect } from 'react';
import { snakeToCamel } from '@helper';
import styled from 'styled-components';
import { Movies } from '@features/movies';
import { Articles, RecentPosts } from '@features/articles';
import { Directors } from '@features/directors';
import Section from '@components/layout/Section';
import MotionWrapper from '@styles/MotionWrapper';
import { CONTAINER_MAX_WIDTH } from '@styles';
import { SearchResultsHeader, SearchPageFrame } from '@features/movies';
import { useOutletContext } from 'react-router-dom';
import SEOHead from '@components/shared-sections/SEOHead';
import { generateWebsiteStructuredData } from '@utils/seoUtils';
import HomeHero from './HomeHero';
import {
  ContinueReadingList,
  SidePanelBlock,
  SidePanelPlaceholder,
} from '@features/sidePanel';

const StyledContainer = styled.div`
  padding: 0;
  margin-top: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 100vh;
`;

/**
 * Full-width split below the hero: flush sidebar (left) + main feed (right).
 * Right column holds the previous single-column home content (posts + carousels).
 */
const HomeSplitShell = styled.div`
  align-self: stretch;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  display: flex;
  flex-direction: column;
  /* No background — main column uses page bg; sidebar sets its own */
  box-sizing: border-box;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: stretch;
  }
`;

/** ~25% wider than original 280px rail for continue-reading cards */
const HOME_SIDEBAR_WIDTH_PX = 350;

const HomeSidebar = styled.aside`
  display: none;
  flex-direction: column;
  gap: 0.75rem;
  box-sizing: border-box;
  padding: 1rem 0.85rem 1rem 1.35rem;
  /* “Background 2” in design tokens */
  background: var(--background-secondary);
  /* Same as global h3 / subhead; uses --font-color-3 (see index.css) */
  border-right: 1px solid var(--font-color-3);

  @media (min-width: 1024px) {
    display: flex;
    flex: 0 0 ${HOME_SIDEBAR_WIDTH_PX}px;
    width: ${HOME_SIDEBAR_WIDTH_PX}px;
    min-height: 0;
    align-self: stretch;
  }
`;

/** Fills space to the right of the sidebar; does not set a max-width (flex quirk fix). */
const HomeMainArea = styled.div`
  flex: 1 1 0%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  background: transparent;
`;

/**
 * Capped at medium width — `width: min(100%, …)` so flex row doesn’t stretch past 1200px
 * (plain max-width on a flex:1 child was not reliably constraining).
 */
const HomeMainColumn = styled.div`
  width: min(100%, ${CONTAINER_MAX_WIDTH.medium});
  max-width: ${CONTAINER_MAX_WIDTH.medium};
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: clamp(1.25rem, 3vw, 2rem) 1rem 2rem;
  box-sizing: border-box;
`;

const RecentPostsBlock = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 5px;

  h1,
  h2 {
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
          hero={<HomeHero />}
          heroSearchPrimaryBand
          contentFlushTop
        >
          <>
            {/* Search results header */}
            <HomeSplitShell>
              <HomeSidebar aria-label="Sidebar">
                <SidePanelBlock
                  title={
                    <span style={{ letterSpacing: '0.04em' }}>CONTINUE</span>
                  }
                  titleId="side-panel-continue-heading"
                  motionIndex={1}
                >
                  <ContinueReadingList posts={posts} limit={5} />
                </SidePanelBlock>
                <SidePanelBlock
                  title="Activity"
                  titleId="side-panel-activity-heading"
                  motionIndex={2}
                >
                  <SidePanelPlaceholder />
                </SidePanelBlock>
              </HomeSidebar>

              <HomeMainArea>
                <HomeMainColumn>
                  {searchQuery && (
                    <SearchResultsHeader
                      searchQuery={searchQuery}
                      movieCount={showMovies.length}
                      articleCount={showArticles.length}
                      isLoading={isSearching}
                      showNoResults={
                        !isSearching &&
                        showMovies.length === 0 &&
                        showArticles.length === 0
                      }
                    />
                  )}

                  <RecentPostsBlock>
                    <MotionWrapper index={3}>
                      <h1>Recent Posts</h1>
                    </MotionWrapper>
                    {searchQuery ? null : (
                      <MotionWrapper index={4}>
                        <h3>
                          <i>Latest movie reviews and articles</i>
                        </h3>
                      </MotionWrapper>
                    )}
                    <RecentPosts posts={posts} fillColumn />
                  </RecentPostsBlock>

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
                    subtitle={
                      searchQuery ? '' : 'Browse theme-based articles and essays'
                    }
                    showSearch={false}
                  >
                    <Articles showArticles={showArticles} enterSearch={unifiedSearch} />
                  </Section>
                </HomeMainColumn>
              </HomeMainArea>
            </HomeSplitShell>
          </>
        </SearchPageFrame>
      </StyledContainer>
    </>
  );
}

export default Home;
