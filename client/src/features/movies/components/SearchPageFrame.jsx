import { isValidElement, cloneElement } from 'react';
import styled, { css } from 'styled-components';
import SearchBar from '@components/shared-sections/SearchBar';
import Loading from '@components/ui/Loading';
import { StyledSizedContainer, CONTAINER_MAX_WIDTH } from '@styles';

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
  margin-top: ${({ $flushTop }) => ($flushTop ? '0' : '1.5rem')};
`;

/** Optional page-specific banner/title area above the search bar */
const HeroSlot = styled.div`
  width: 100%;
  margin-bottom: 1.25rem;
`;

/**
 * Full-width (100vw) band with primary background — hero + search.
 * Breaks out of the sized container for edge-to-edge background; height follows content.
 */
const HeroSearchPrimaryBand = styled.div`
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  background: var(--primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: clamp(1.25rem, 4vh, 2.5rem) 0;
  box-sizing: border-box;

  ${({ $wide }) =>
    $wide &&
    css`
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    `}
`;

const HeroSearchBandInner = styled.div`
  width: 100%;
  max-width: ${({ $size }) => CONTAINER_MAX_WIDTH[$size] ?? CONTAINER_MAX_WIDTH.narrow};
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 0;
  }
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
  /** Optional: custom hero (e.g. Home) rendered above SearchBar */
  hero = null,
  /** When true, hero + SearchBar sit in a full-width (100vw) primary band */
  heroSearchPrimaryBand = false,
  /** When true, no margin between hero/search and page content (e.g. Home flush with split) */
  contentFlushTop = false,
  children,
}) {
  const Container = wide ? PageContainer : StyledSizedContainer;

  const heroForBand =
    heroSearchPrimaryBand && hero && isValidElement(hero)
      ? cloneElement(hero, { onPrimary: true })
      : hero;

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

      {heroSearchPrimaryBand ? (
        <HeroSearchPrimaryBand $wide={wide}>
          <HeroSearchBandInner $size={containerSize}>
            {heroForBand}
            <SearchBar enterSearch={onSearch} placeholder={searchPlaceholder} />
          </HeroSearchBandInner>
        </HeroSearchPrimaryBand>
      ) : (
        <>
          {hero ? <HeroSlot>{hero}</HeroSlot> : null}
          <SearchBar enterSearch={onSearch} placeholder={searchPlaceholder} />
        </>
      )}

      {isLoading ? (
        <Loading text={loadingText} size="large" />
      ) : (
        <ContentWrapper $flushTop={contentFlushTop}>{children}</ContentWrapper>
      )}
    </Container>
  );
}

export default SearchPageFrame;
