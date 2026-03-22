import styled, { css } from 'styled-components';

const Root = styled.section`
  width: 100%;
  text-align: center;
  padding: 0.25rem 0 0;

  ${({ $onPrimary }) =>
    $onPrimary &&
    css`
      padding-top: 0;
    `}
`;

/** Not an h1 — page title stays “Recent Posts” on Home */
const Title = styled.p`
  margin: 0 0 0.35rem;
  font-size: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.2;
  font-weight: 600;
  color: var(--font-color-1);

  ${({ $onPrimary }) =>
    $onPrimary &&
    css`
      color: var(--soft-white);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    `}
`;

const Tagline = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.45;
  color: var(--font-color-2);

  ${({ $onPrimary }) =>
    $onPrimary &&
    css`
      color: rgba(248, 249, 250, 0.9);
    `}
`;

/**
 * Hero strip for the home page — sits above the unified search bar via SearchPageFrame `hero`.
 * `onPrimary` is set automatically when using `heroSearchPrimaryBand` on SearchPageFrame.
 */
function HomeHero({ onPrimary = false }) {
  return (
    <Root $onPrimary={onPrimary} aria-labelledby="home-hero-title">
      <Title id="home-hero-title" $onPrimary={onPrimary}>
        Movie Reviews Hub
      </Title>
      <Tagline $onPrimary={onPrimary}>
        Discover reviews, articles, and directors in one place.
      </Tagline>
    </Root>
  );
}

export default HomeHero;
