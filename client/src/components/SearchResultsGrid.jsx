import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MovieCard from '../cards/MovieCard';
import SearchResultsHeader from './SearchResultsHeader';
import { getMovieRatings } from '../helper';
import Loading from './ui/Loading';

const GridContainer = styled.div`
  width: 100%;
  padding: 0 20px;
`;


const MoviesGrid = styled.div`
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

const SearchResultsGrid = ({ searchQuery, movies, onMovieClick }) => {
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

  if (!movies || movies.length === 0) {
    return (
      <GridContainer>
        <SearchResultsHeader
          searchQuery={searchQuery}
          movieCount={0}
          showNoResults={true}
        />
      </GridContainer>
    );
  }

  if (loading) {
    return (
      <GridContainer>
        <SearchResultsHeader
          searchQuery={searchQuery}
          isLoading={true}
        />
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <SearchResultsHeader
        searchQuery={searchQuery}
        movieCount={movies.length}
      />
      
      <MoviesGrid>
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
      </MoviesGrid>
    </GridContainer>
  );
};

export default SearchResultsGrid;
