import styled from 'styled-components';

const HeaderContainer = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const Title = styled.h2`
  // color: var(--cinema-gold);
  font-size: 1.8rem;
  margin-bottom: 10px;
`;

const ResultsCount = styled.p`
  // color: var(--cinema-silver);
  font-size: 1rem;
  margin: 0;
`;

const SearchQuery = styled.span`
  // color: var(--cinema-gold-dark);
  display: inline;
  font-size: inherit;
  color: inherit;
  font-weight: 600;
`;

const AnimatedEllipsis = styled.span`
  display: inline-block;
  width: 1.2em;
  text-align: left;
  vertical-align: baseline;
`;

const Dot = styled.span`
  opacity: 0;
  animation: fadeDot 1.2s infinite;
  animation-delay: ${({ $delay = 0 }) => `${$delay}s`};

  @keyframes fadeDot {
    0%,
    20% {
      opacity: 0;
    }
    45%,
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const SearchResultsHeader = ({
  searchQuery,
  movieCount = 0,
  articleCount = 0,
  directorCount = 0,
  isLoading = false,
  showNoResults = false,
}) => {
  if (isLoading) {
    return (
      <HeaderContainer>
        <Title>
          Searching
          <AnimatedEllipsis aria-hidden="true">
            <Dot $delay={0.05}>.</Dot>
            <Dot $delay={0.25}>.</Dot>
            <Dot $delay={0.45}>.</Dot>
          </AnimatedEllipsis>
        </Title>
      </HeaderContainer>
    );
  }

  const totalCount = movieCount + articleCount + directorCount;

  if (showNoResults || totalCount === 0) {
    return (
      <HeaderContainer>
        <Title>No Results Found</Title>
        <ResultsCount>Try a different search term</ResultsCount>
      </HeaderContainer>
    );
  }

  const movieText = movieCount === 1 ? 'movie' : 'movies';
  const articleText = articleCount === 1 ? 'article' : 'articles';
  const directorText = directorCount === 1 ? 'director' : 'directors';

  const resultParts = [];
  if (directorCount > 0) resultParts.push(`${directorCount} ${directorText}`);
  if (movieCount > 0) resultParts.push(`${movieCount} ${movieText}`);
  if (articleCount > 0) resultParts.push(`${articleCount} ${articleText}`);

  let resultsText = '';
  if (resultParts.length === 1) {
    resultsText = `${resultParts[0]} found`;
  } else if (resultParts.length === 2) {
    resultsText = `${resultParts[0]} and ${resultParts[1]} found`;
  } else if (resultParts.length === 3) {
    resultsText = `${resultParts[0]}, ${resultParts[1]}, and ${resultParts[2]} found`;
  }

  return (
    <HeaderContainer>
      <Title>
        Results for <SearchQuery>&quot;{searchQuery}&quot;</SearchQuery>
      </Title>
      <ResultsCount>{resultsText}</ResultsCount>
    </HeaderContainer>
  );
};

export default SearchResultsHeader;
