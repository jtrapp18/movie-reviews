import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MovieCard from '@components/cards/MovieCard';
import { getMovieRatings } from '@helper';


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 0;
  max-width: 100%;
`;

const MovieCardWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const MoviesGrid = ({ movies, onMovieClick }) => {
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!movies || movies.length === 0) {
        setLoading(false);
        return;
      }
      
      const ratings = await getMovieRatings(movies);
      setRatingsMap(ratings);
      setLoading(false);
    };
    
    fetchRatings();
  }, [movies]);


  return (
    <Grid>
    {movies.map((movie) => {
        const movieData = ratingsMap[movie.externalId];
        const rating = movieData?.rating || null;
        const localId = movieData?.local_id;
        
        // If we have a local ID, use it for navigation
        // Otherwise, keep the external ID for creating new movies
        const movieWithCorrectId = localId 
        ? { ...movie, id: localId }
        : movie;
        
        return (
        <MovieCardWrapper key={movie.externalId || movie.id}>
            <MovieCard
            movie={movieWithCorrectId}
            rating={rating}
            onClick={() => onMovieClick(movie)}
            />
        </MovieCardWrapper>
        );
    })}
    </Grid>
  );
};

export default MoviesGrid;
