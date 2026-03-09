import { getJSON, getMovieInfo, snakeToCamel } from '../helper';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Movies from '../components/Movies';
import Articles from '../components/Articles';
import RecentPosts from '../components/RecentPosts';
import Directors from '../components/Directors';
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
  const [recentPosts, setRecentPosts] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [showDirectors, setShowDirectors] = useState([]);

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

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const data = await getJSON('reviews');
        if (Array.isArray(data)) {
          const sorted = [...data].sort(
            (a, b) =>
              new Date(b.dateAdded || b.date_added || 0) -
              new Date(a.dateAdded || a.date_added || 0)
          );
          setRecentPosts(sorted);
        } else {
          setRecentPosts([]);
        }
      } catch (error) {
        console.error('Error fetching recent posts:', error);
        setRecentPosts([]);
      }
    };

    fetchRecentPosts();
  }, []);

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const data = await getJSON('directors');
        if (Array.isArray(data)) {
          setDirectors(data);
          setShowDirectors(data);
        } else {
          setDirectors([]);
          setShowDirectors([]);
        }
      } catch (error) {
        console.error('Error fetching directors:', error);
        setDirectors([]);
        setShowDirectors([]);
      }
    };

    fetchDirectors();
  }, []);

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
          title="Recent Posts"
          subtitle={searchQuery ? "" : "Latest movie reviews and articles"}
          showSearch={false}
        >
          <RecentPosts posts={recentPosts} />
        </Section>

        <hr />

        <Section
          title="Directors"
          subtitle={searchQuery ? "" : "Explore directors in the collection"}
          showSearch={false}
        >
          <Directors directors={showDirectors} />
        </Section>
        
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