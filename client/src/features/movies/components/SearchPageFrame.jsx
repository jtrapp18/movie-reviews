import styled from 'styled-components';
import SearchBar from '@components/shared-sections/SearchBar';
import Loading from '@components/ui/Loading';
import { StyledSizedContainer } from '@styles';

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
  /** narrow | medium | full — only applies when wide is false */
  containerSize = 'narrow',
  children,
}) {
  const Container = wide ? PageContainer : StyledSizedContainer;

  return (
    <Container {...(!wide ? { $size: containerSize } : {})}>
      {showHeader && (
        <PageHeader>
          {title && <h1>{title}</h1>}
          {subtitle && (
            <h3>
              <i>{subtitle}</i>
            </h3>
          )}
        </PageHeader>
      )}

      <SearchBar enterSearch={onSearch} placeholder={searchPlaceholder} />

      {isLoading ? (
        <Loading text={loadingText} size="large" />
      ) : (
        <ContentWrapper>{children}</ContentWrapper>
      )}
    </Container>
  );
}

export default SearchPageFrame;
