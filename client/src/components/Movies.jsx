import React, { useState, useEffect } from 'react';
import { CardContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import MotionWrapper from '../styles/MotionWrapper';
import Carousel from './Carousel';
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
        {showMovies.map((movie, index) => {
          // Get rating for this movie
          let rating = null;
          let movieWithCorrectId = movie;
          
          console.log(`Movie ${index}:`, movie.title, 'ID:', movie.id, 'ExternalID:', movie.externalId);
          console.log('RatingsMap keys:', Object.keys(ratingsMap));
          console.log('Looking for rating with movie.id:', movie.id);
          
          if (movie.externalId) {
            // External movie - look up by external ID
            const movieData = ratingsMap[movie.externalId];
            rating = movieData?.rating || null;
            const localId = movieData?.local_id;
            console.log('External movie data:', movieData);
            if (localId) {
              movieWithCorrectId = { ...movie, id: localId };
            }
          } else {
            // Local movie - look up by local ID
            const localData = ratingsMap[movie.id];
            rating = localData?.rating || null;
            console.log('Local movie data:', localData);
          }
          
          console.log('Final rating:', rating);
          
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