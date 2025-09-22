import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const Title = styled.h2`
  color: var(--cinema-gold);
  font-size: 1.8rem;
  margin-bottom: 10px;
`;

const ResultsCount = styled.p`
  color: var(--cinema-silver);
  font-size: 1rem;
  margin: 0;
`;

const SearchQuery = styled.span`
  color: var(--cinema-gold-dark);
  font-weight: 600;
`;

const SearchResultsHeader = ({ 
  searchQuery, 
  movieCount = 0, 
  articleCount = 0, 
  isLoading = false,
  showNoResults = false 
}) => {
  if (isLoading) {
    return (
      <HeaderContainer>
        <Title>Searching...</Title>
      </HeaderContainer>
    );
  }

  if (showNoResults || (movieCount === 0 && articleCount === 0)) {
    return (
      <HeaderContainer>
        <Title>No Results Found</Title>
        <ResultsCount>Try a different search term</ResultsCount>
      </HeaderContainer>
    );
  }

  const totalResults = movieCount + articleCount;
  const movieText = movieCount === 1 ? 'movie' : 'movies';
  const articleText = articleCount === 1 ? 'article' : 'articles';

  let resultsText = '';
  if (movieCount > 0 && articleCount > 0) {
    resultsText = `${movieCount} ${movieText} and ${articleCount} ${articleText} found`;
  } else if (movieCount > 0) {
    resultsText = `${movieCount} ${movieText} found`;
  } else if (articleCount > 0) {
    resultsText = `${articleCount} ${articleText} found`;
  }

  return (
    <HeaderContainer>
      <Title>
        Search Results for <SearchQuery>"{searchQuery}"</SearchQuery>
      </Title>
      <ResultsCount>{resultsText}</ResultsCount>
    </HeaderContainer>
  );
};

export default SearchResultsHeader;
