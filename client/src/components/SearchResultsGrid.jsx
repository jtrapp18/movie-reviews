import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SearchResultsHeader from './SearchResultsHeader';
import { getMovieRatings } from '../helper';
import MoviesGrid from './MoviesGrid';

const GridContainer = styled.div`
  width: 100%;
  padding: 0 20px;
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
      <MoviesGrid
        movies={movies}
        onMovieClick={onMovieClick}
      />
    </GridContainer>
  );
};

export default SearchResultsGrid;
