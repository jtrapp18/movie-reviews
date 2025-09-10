import React from 'react';
import styled from 'styled-components';
import MovieCard from '../cards/MovieCard';

const SwimlaneContainer = styled.div`
  margin-bottom: 40px;
  width: 100%;
`;

const SwimlaneHeader = styled.h3`
  color: var(--cinema-gold);
  font-size: 1.5rem;
  margin-bottom: 15px;
  padding-left: 20px;
  font-weight: 600;
`;

const MoviesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  padding: 0 20px;
  gap: 15px;
  scrollbar-width: thin;
  scrollbar-color: var(--cinema-gold) transparent;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--cinema-gold);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--cinema-gold-dark);
  }
`;

const MovieCardWrapper = styled.div`
  flex-shrink: 0;
  width: 200px;
`;

const EmptyMessage = styled.div`
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px;
`;

const MovieSwimlane = ({ genre, movies, onMovieClick }) => {
  if (!movies || movies.length === 0) {
    return null; // Don't render empty swimlanes
  }

  return (
    <SwimlaneContainer>
      <SwimlaneHeader>{genre.name}</SwimlaneHeader>
      <MoviesContainer>
        {movies.map((movie) => (
          <MovieCardWrapper key={movie.id}>
            <MovieCard
              movie={movie}
              onClick={() => onMovieClick(movie)}
            />
          </MovieCardWrapper>
        ))}
      </MoviesContainer>
    </SwimlaneContainer>
  );
};

export default MovieSwimlane;
