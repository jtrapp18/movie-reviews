import React from 'react';
import styled from 'styled-components';
import MovieCard from '../cards/MovieCard';

const GridContainer = styled.div`
  width: 100%;
  padding: 0 20px;
`;

const GridHeader = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const GridTitle = styled.h2`
  color: var(--cinema-gold);
  font-size: 1.8rem;
  margin-bottom: 10px;
`;

const ResultsCount = styled.p`
  color: #ccc;
  font-size: 1rem;
  margin: 0;
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
  if (!movies || movies.length === 0) {
    return (
      <GridContainer>
        <GridHeader>
          <GridTitle>No Results Found</GridTitle>
          <ResultsCount>Try a different search term</ResultsCount>
        </GridHeader>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <GridHeader>
        <GridTitle>Search Results for "{searchQuery}"</GridTitle>
        <ResultsCount>{movies.length} movie{movies.length !== 1 ? 's' : ''} found</ResultsCount>
      </GridHeader>
      
      <MoviesGrid>
        {movies.map((movie) => (
          <MovieCardWrapper key={movie.id}>
            <MovieCard
              movie={movie}
              onClick={() => onMovieClick(movie)}
            />
          </MovieCardWrapper>
        ))}
      </MoviesGrid>
    </GridContainer>
  );
};

export default SearchResultsGrid;
