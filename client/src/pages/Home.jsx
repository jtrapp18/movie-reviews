import { getJSON, getMovieInfo, snakeToCamel } from '../helper';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Movies from '../components/Movies';
import Articles from '../components/Articles';
import Section from '../components/Section';
import SearchBar from '../components/SearchBar';
import SearchResultsHeader from '../components/SearchResultsHeader';
import Loading from '../components/ui/Loading';
import { useOutletContext, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { generateWebsiteStructuredData } from '../utils/seoUtils';

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
  const { movies } = useOutletContext();
  const navigate = useNavigate();
  
  const [showMovies, setShowMovies] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showArticles, setShowArticles] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setShowMovies(movies);
  }, [movies]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getJSON('articles');
        setArticles(data);
        setShowArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
        setShowArticles([]);
      }
    };
    
    fetchArticles();
  }, []);

  const unifiedSearch = async (text) => {
    if (!text.trim()) {
      // If empty search, show all content
      setShowMovies(movies);
      setShowArticles(articles);
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
        {/* Single search bar at the top */}
        <SearchBar 
          enterSearch={unifiedSearch}
          placeholder="Search movies, reviews, articles, and tags..."
        />
        
        {/* Search results header */}
        {searchQuery && (
          <SearchResultsHeader
            searchQuery={searchQuery}
            movieCount={showMovies.length}
            articleCount={showArticles.length}
            isLoading={isSearching}
            showNoResults={!isSearching && showMovies.length === 0 && showArticles.length === 0}
          />
        )}
        
        {/* Loading indicator */}
        {isSearching && !searchQuery && (
          <Loading text="Searching" compact={true} />
        )}
        
        <Section
          title={searchQuery ? "Movies" : "Movie Reviews"}
          subtitle={searchQuery ? "" : "Click movie to view review"}
          showSearch={false}
        >
          <Movies
            showMovies={showMovies}
            enterSearch={unifiedSearch}
          />
        </Section>
        
        <Section
          title={searchQuery ? "Articles" : "Articles"}
          subtitle={searchQuery ? "" : "Browse theme-based articles and essays"}
          showSearch={false}
        >
          <Articles
            showArticles={showArticles}
            enterSearch={unifiedSearch}
          />
        </Section>
      </StyledContainer>
    </>
  );
}

export default Home;