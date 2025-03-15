import { getMovieInfo } from '../helper';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper'
import Movies from '../components/Movies';

const StyledContainer = styled.div`
  height: var(--size-body);
  padding: 0;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function SearchMovies() {
  const [showMovies, setShowMovies] = useState([]);

  const fetchMovies = async (text=null) => {
    const movies = await getMovieInfo(text); // Wait for the JSON
    setShowMovies(movies); // Set state with actual JSON
  };

  useEffect(() => {    
      fetchMovies();
    }, []);

  const enterSearch = (text) => {
    fetchMovies(text);
  }

  return (
    <StyledContainer>
        <MotionWrapper index={1}>
          <h1>Movies</h1>
        </MotionWrapper>
        <MotionWrapper index={2}>
          <h3>Click any movie card to add a new review</h3>
        </MotionWrapper>
        <Movies
          showMovies={showMovies}
          enterSearch={enterSearch}
        />
    </StyledContainer>
  );
}

export default SearchMovies;