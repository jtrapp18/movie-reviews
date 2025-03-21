import { getJSON, getMovieInfo } from '../helper';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper'
import Movies from '../components/Movies';
import { useOutletContext } from 'react-router-dom';

const StyledContainer = styled.div`
  padding: 0;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function Home() {
  const { movies } = useOutletContext();
  
  const [showMovies, setShowMovies] = useState([]); // Set initial state to movies from context

  useEffect(() => {
    setShowMovies(movies); // Update showMovies when movies from context change
  }, [movies]);

  const enterSearch = (text) => {
    // Filter movies based on the search text
    const filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(text.toLowerCase())
    );
    setShowMovies(filteredMovies); // Set filtered movies
  };

  return (
    <StyledContainer>
        <MotionWrapper index={1}>
          <h1>Movies</h1>
        </MotionWrapper>
        <MotionWrapper index={2}>
          <h3>Click movie to view review</h3>
        </MotionWrapper>
        <Movies
          showMovies={showMovies}
          enterSearch={enterSearch}
        />
    </StyledContainer>
  );
}

export default Home;