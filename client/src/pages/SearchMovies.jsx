import { getMoviesByGenre, getMovieInfo } from '../helper';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper'
import SearchBar from '../components/SearchBar';
import MovieSwimlane from '../components/MovieSwimlane';
import SearchResultsGrid from '../components/SearchResultsGrid';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';

const StyledContainer = styled.div`
  min-height: 100%;
  padding: 20px 0 40px 0;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

// Define genres we want to show
const GENRES = [
  { id: 28, name: "Action", emoji: "🎬" },
  { id: 35, name: "Comedy", emoji: "😂" },
  { id: 18, name: "Drama", emoji: "🎭" },
  { id: 27, name: "Horror", emoji: "👻" },
  { id: 878, name: "Sci-Fi", emoji: "🚀" },
  { id: 16, name: "Animation", emoji: "🎨" }
];

function SearchMovies() {
  const navigate = useNavigate();
  const [genreData, setGenreData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const fetchAllGenres = async () => {
    setLoading(true);
    try {
      const promises = GENRES.map(async (genre) => {
        const movies = await getMoviesByGenre(genre.id);
        return {
          ...genre,
          movies: movies
        };
      });
      
      const results = await Promise.all(promises);
      // Filter out empty genres (no movies found)
      const nonEmptyResults = results.filter(genre => genre.movies.length > 0);
      setGenreData(nonEmptyResults);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      setGenreData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async (searchText) => {
    setLoading(true);
    try {
      const movies = await getMovieInfo(searchText);
      setSearchResults(movies || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {    
    fetchAllGenres();
  }, []);

  const enterSearch = (text) => {
    setSearchQuery(text);
    if (text && text.trim()) {
      setIsSearchMode(true);
      fetchSearchResults(text);
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  }

  const handleMovieClick = (movie) => {
    // Navigate to movie review page - MovieReview will handle creating the movie if needed
    navigate(`/movies/${movie.id}`);
  };

  return (
    <StyledContainer>
        <MotionWrapper index={1}>
          <h1>Search Movies</h1>
        </MotionWrapper>
        <MotionWrapper index={2}>
          <h3>Click any movie card to add a new review</h3>
        </MotionWrapper>
        <MotionWrapper index={3}>
          <SearchBar 
            enterSearch={enterSearch} 
            placeholder={loading ? "Searching..." : "Search movies by title..."} 
          />
        </MotionWrapper>
        
        {loading ? (
          <MotionWrapper index={4}>
            <Loading text="Loading movies" compact={true} />
          </MotionWrapper>
        ) : isSearchMode ? (
          <MotionWrapper index={4}>
            <SearchResultsGrid
              searchQuery={searchQuery}
              movies={searchResults}
              onMovieClick={handleMovieClick}
            />
          </MotionWrapper>
        ) : (
          genreData.map((genre, index) => (
            <MotionWrapper key={genre.id} index={index + 4}>
              <MovieSwimlane
                genre={genre}
                movies={genre.movies}
                onMovieClick={handleMovieClick}
              />
            </MotionWrapper>
          ))
        )}
    </StyledContainer>
  );
}

export default SearchMovies;
