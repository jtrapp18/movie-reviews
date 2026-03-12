import React from 'react';
import styled from 'styled-components';
import SearchBar from './SearchBar';
import Loading from './ui/Loading';
import { StyledContainer } from '../styles';

const PageContainer = styled.div`
  min-height: 100%;
  padding: 20px 0 40px 0;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PageHeader = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 0.25rem 0;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--font-color-2);
`;

const ContentWrapper = styled.div`
  width: 100%;
  margin-top: 1.5rem;
`;

function SearchPageFrame({
  title,
  subtitle,
  searchPlaceholder,
  onSearch,
  isLoading = false,
  loadingText = 'Loading',
  showHeader = true,
  wide = false,
  children,
}) {
  const Container = wide ? PageContainer : StyledContainer;

  return (
    <Container>
      {showHeader && (
        <PageHeader>
          {title && <Title>{title}</Title>}
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </PageHeader>
      )}

      <SearchBar enterSearch={onSearch} placeholder={searchPlaceholder} />

      {isLoading ? (
        <ContentWrapper>
          <Loading text={loadingText} size="large" />
        </ContentWrapper>
      ) : (
        <ContentWrapper>{children}</ContentWrapper>
      )}
    </Container>
  );
}

export default SearchPageFrame;

