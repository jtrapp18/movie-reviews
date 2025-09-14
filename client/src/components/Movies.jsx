import React, { useState, useEffect } from 'react';
import { CardContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import MotionWrapper from '../styles/MotionWrapper';
import Carousel from './Carousel';
import Loading from '../pages/Loading';
import { getMovieRatings } from '../helper';

function Movies({ showMovies, enterSearch }) {
  const [ratingsMap, setRatingsMap] = useState({});

  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = await getMovieRatings(showMovies);
      setRatingsMap(ratings);
    };
    fetchRatings();
  }, [showMovies]);

  // Handle null or undefined showMovies
  if (!showMovies || !Array.isArray(showMovies)) {
    return (
      <CardContainer>
        <Loading text="Loading movies" compact={true} />
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <Carousel noResultsMessage="No movies found">
        {showMovies.map((movie, index) => {
          // Get rating for this movie
          let rating = null;
          let movieWithCorrectId = movie;
          
          if (movie.externalId) {
            // External movie - look up by external ID
            const movieData = ratingsMap[movie.externalId];
            rating = movieData?.rating || null;
            const localId = movieData?.local_id;
            if (localId) {
              movieWithCorrectId = { ...movie, id: localId };
            }
          } else {
            // Local movie - look up by local ID
            const localData = ratingsMap[movie.id];
            rating = localData?.rating || null;
          }
          
          return (
            <MotionWrapper key={movie.title} index={index}>
              <div style={{ 
                margin: '0',
                width: '200px',
                height: '100%',
                flexShrink: 0
              }}>
                <MovieCard movie={movieWithCorrectId} rating={rating} />
              </div>
            </MotionWrapper>
          );
        })}
      </Carousel>
    </CardContainer>
  );
}

export default Movies;