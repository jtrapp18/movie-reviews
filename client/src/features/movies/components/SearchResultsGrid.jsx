import { useState, useEffect } from 'react';
import styled from 'styled-components';
import SearchResultsHeader from './SearchResultsHeader';
import { getMovieRatings } from '@helper';
import MoviesGrid from './MoviesGrid';

const GridContainer = styled.div`
  width: 100%;
  padding: 0 20px;
`;

const SearchResultsGrid = ({ searchQuery, searchContextText = null, movies, onMovieClick }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!movies || movies.length === 0) {
        setLoading(false);
        return;
      }
      await getMovieRatings(movies);
      setLoading(false);
    };

    fetchRatings();
  }, [movies]);

  if (!movies || movies.length === 0) {
    return (
      <GridContainer>
        <SearchResultsHeader
          searchQuery={searchQuery}
          searchContextText={searchContextText}
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
          searchContextText={searchContextText}
          isLoading={true}
        />
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <SearchResultsHeader
        searchQuery={searchQuery}
        searchContextText={searchContextText}
        movieCount={movies.length}
      />
      <MoviesGrid movies={movies} onMovieClick={onMovieClick} />
    </GridContainer>
  );
};

export default SearchResultsGrid;
