import { getMoviesByGenre } from '../helper';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper'
import SearchBar from '../components/SearchBar';
import MovieSwimlane from '../components/MovieSwimlane';
import { useNavigate } from 'react-router-dom';

const StyledContainer = styled.div`
  height: var(--size-body);
  padding-top: 20px;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllGenres = async (searchText = null) => {
    setLoading(true);
    try {
      const promises = GENRES.map(async (genre) => {
        const movies = await getMoviesByGenre(genre.id, searchText);
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

  useEffect(() => {    
    fetchAllGenres();
  }, []);

  const enterSearch = (text) => {
    setSearchQuery(text);
    fetchAllGenres(text);
  }

  const handleMovieClick = (movie) => {
    // Navigate to movie review page
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
            placeholder={searchQuery ? "Searching..." : "Search movies by title..."} 
          />
        </MotionWrapper>
        
        {loading ? (
          <MotionWrapper index={4}>
            <h3>Loading movies...</h3>
          </MotionWrapper>
        ) : genreData.length > 0 ? (
          genreData.map((genre, index) => (
            <MotionWrapper key={genre.id} index={index + 4}>
              <MovieSwimlane
                genre={genre}
                movies={genre.movies}
                onMovieClick={handleMovieClick}
              />
            </MotionWrapper>
          ))
        ) : (
          <MotionWrapper index={4}>
            <h3>No movies found. Try a different search term.</h3>
          </MotionWrapper>
        )}
    </StyledContainer>
  );
}

export default SearchMovies;
