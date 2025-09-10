import React from 'react';
import { CardContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import MotionWrapper from '../styles/MotionWrapper';
import Carousel from './Carousel';

function Movies({ showMovies, enterSearch }) {

  // Handle null or undefined showMovies
  if (!showMovies || !Array.isArray(showMovies)) {
    return (
      <CardContainer>
        <div className="text-center p-4">
          <h3>Loading movies...</h3>
          <p>Please wait while we fetch the latest movies.</p>
        </div>
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <Carousel>
        {showMovies.map((movie, index) => (
          <MotionWrapper key={movie.title} index={index}>
            <div style={{ 
              margin: '0',
              width: '200px',
              height: '100%',
              flexShrink: 0
            }}>
              <MovieCard movie={movie} />
            </div>
          </MotionWrapper>
        ))}
      </Carousel>
    </CardContainer>
  );
}

export default Movies;