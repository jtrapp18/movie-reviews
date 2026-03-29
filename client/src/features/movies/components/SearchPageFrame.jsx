import { isValidElement, cloneElement } from 'react';
import styled, { css } from 'styled-components';
import { SearchBar } from '@components/sections/SearchBar';
import Loading from '@components/ui/Loading';
import { StyledSizedContainer, CONTAINER_MAX_WIDTH } from '@styles';

/**
 * Narrow search pages (default). Matches `containerShell` but restores vertical
 * padding on small screens: the base shell sets `padding: 0` on mobile, which
 * made pages like Director Highlights flush to the header while `wide` pages
 * (Search Movies) kept `PageContainer`’s top/bottom padding.
 */
const SearchFrameShell = styled(StyledSizedContainer)`
  ${({ $heroSearchPrimaryBand }) =>
    $heroSearchPrimaryBand &&
    `
    padding-top: 0;
  `}

  @media (max-width: 768px) {
    padding-left: 0;
    padding-right: 0;

    ${({ $heroSearchPrimaryBand }) =>
      $heroSearchPrimaryBand
        ? css`
            padding-bottom: 0;
          `
        : css`
            /* Align with PageContainer (wide search pages): breathing room below header */
            padding-top: 20px;
            padding-bottom: 40px;
          `}
  }
`;

const PageContainer = styled.div`
  min-height: 100%;
  padding: ${({ $heroSearchPrimaryBand }) =>
    $heroSearchPrimaryBand ? '0 0 40px 0' : '20px 0 40px 0'};
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

  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: clamp(1.25rem, 4vh, 2.5rem) 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  ${({ $heroImageUrl }) =>
    !$heroImageUrl &&
    css`
      background: var(--primary);
    `}

  ${({ $wide }) =>
    $wide &&
    css`
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    `}

  ${({ $heroImageUrl }) => {
    const heroBgSrc = $heroImageUrl;
    const heroFallbackJpeg = heroBgSrc?.replace(/\.webp(\?|#|$)/i, '.jpeg$1');
    const heroFallbackJpg = heroBgSrc?.replace(/\.webp(\?|#|$)/i, '.jpg$1');
    return (
      heroBgSrc &&
      css`
        /* Matches light-theme --blue / --navy-blue so the hero matches header branding */
        --hero-tint-primary: rgba(2, 38, 88, 0.38);
        --hero-tint-secondary: rgba(0, 17, 61, 0.48);
        background-color: #070d18;
        background-image:
          linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.38) 0%,
            rgba(0, 0, 0, 0.52) 45%,
            rgba(0, 0, 0, 0.66) 100%
          ),
          linear-gradient(
            180deg,
            var(--hero-tint-primary) 0%,
            var(--hero-tint-secondary) 100%
          ),
          url(${heroFallbackJpeg || heroFallbackJpg || heroBgSrc});
        background-image:
          linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.38) 0%,
            rgba(0, 0, 0, 0.52) 45%,
            rgba(0, 0, 0, 0.66) 100%
          ),
          linear-gradient(
            180deg,
            var(--hero-tint-primary) 0%,
            var(--hero-tint-secondary) 100%
          ),
          image-set(
            url(${heroBgSrc}) type('image/webp'),
            url(${heroFallbackJpeg || heroFallbackJpg || heroBgSrc}) type('image/jpeg')
          );
        background-size: cover;
        /* Anchor spotlight fixture to top-right; avoids vertically centered crop */
        background-position: right top;
        background-repeat: no-repeat;
      `
    );
  }}

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: clamp(18px, 3vw, 30px);
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(240, 240, 240, 0.28) 100%
    );
  }
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

const SearchRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr minmax(0, 800px) auto 1fr;
  align-items: center;
  column-gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr minmax(0, 800px) 1fr;
    row-gap: 0.5rem;
  }
`;

const SearchRowCenter = styled.div`
  grid-column: 2;
  width: 100%;
`;

const SearchRowRight = styled.div`
  grid-column: 3;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  @media (max-width: 768px) {
    grid-column: 2;
    justify-content: center;
  }
`;

export default function SearchPageFrame({
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
  /** Optional URL for hero band background (e.g. `/images/spotlight.webp`); file lives under `public/` */
  heroBandBackgroundImage = null,
  /** Optional row below the search bar inside the hero band (e.g. filter pills) */
  heroBandFooter = null,
  /** `hero` styles the search input for the dark hero band */
  searchBarVariant = 'default',
  /** Optional controlled search text passed to SearchBar */
  searchValue,
  /** Optional callback for controlled SearchBar updates */
  onSearchValueChange,
  /** Optional right-side controls aligned with the SearchBar (e.g. Mode toggle) */
  searchBarRightSlot,
  /**
   * Optional control embedded in the search bar (e.g. Library / Discover on Search Movies).
   * Desktop: rendered inside the hero pill on the left. Mobile: stacked below the bar (same as before).
   */
  searchBarAccessory,
  children,
}) {
  const Container = wide ? PageContainer : SearchFrameShell;

  const heroForBand =
    heroSearchPrimaryBand && hero && isValidElement(hero)
      ? cloneElement(hero, { onPrimary: true })
      : hero;

  return (
    <Container
      $heroSearchPrimaryBand={heroSearchPrimaryBand}
      {...(!wide ? { $size: containerSize } : {})}
    >
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
        <HeroSearchPrimaryBand $wide={wide} $heroImageUrl={heroBandBackgroundImage}>
          <HeroSearchBandInner $size={containerSize}>
            {heroForBand}
            <SearchRow>
              <SearchRowCenter>
                <SearchBar
                  enterSearch={onSearch}
                  placeholder={searchPlaceholder}
                  variant={searchBarVariant}
                  value={searchValue}
                  onValueChange={onSearchValueChange}
                  accessory={searchBarAccessory}
                />
              </SearchRowCenter>
              {searchBarRightSlot ? (
                <SearchRowRight>{searchBarRightSlot}</SearchRowRight>
              ) : null}
            </SearchRow>
            {heroBandFooter}
          </HeroSearchBandInner>
        </HeroSearchPrimaryBand>
      ) : (
        <>
          {hero ? <HeroSlot>{hero}</HeroSlot> : null}
          <SearchRow>
            <SearchRowCenter>
              <SearchBar
                enterSearch={onSearch}
                placeholder={searchPlaceholder}
                variant={searchBarVariant}
                value={searchValue}
                onValueChange={onSearchValueChange}
                accessory={searchBarAccessory}
              />
            </SearchRowCenter>
            {searchBarRightSlot ? (
              <SearchRowRight>{searchBarRightSlot}</SearchRowRight>
            ) : null}
          </SearchRow>
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
