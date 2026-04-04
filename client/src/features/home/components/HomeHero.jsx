import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import HeroTextStack from '@components/sections/HeroTextStack';

const Root = styled.section`
  width: 100%;
  text-align: center;
  padding: 0.5rem 0 0;

  ${({ $onPrimary }) =>
    $onPrimary &&
    css`
      padding-top: 0;
    `}
`;

const Eyebrow = styled.p`
  margin: 0 0 0.65rem;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: clamp(0.65rem, 1.5vw, 0.75rem);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  line-height: 1.4;
  color: rgba(248, 249, 250, 0.72);

  ${({ $onPrimary }) =>
    !$onPrimary &&
    css`
      color: var(--font-color-2);
    `}
`;

/** Not an h1 — page title stays “Recent Posts” on Home */
const Name = styled.p`
  margin: 0 0 0.85rem;
  font-family: var(--signature-font), 'Georgia', serif;
  font-size: clamp(3rem, 7vw, 4.5rem);
  // font-weight: 400;
  line-height: 1.08;
  letter-spacing: 0.02em;
  color: var(--font-color-1);

  ${({ $onPrimary }) =>
    $onPrimary &&
    css`
      color: var(--soft-white);
      text-shadow:
        0 2px 24px rgba(0, 0, 0, 0.45),
        0 1px 2px rgba(0, 0, 0, 0.35);
    `}
`;

const Categories = styled.p`
  margin: 0 0 2rem;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: clamp(0.7rem, 1.65vw, 0.82rem);
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.5;
  color: rgba(248, 249, 250, 0.78);

  ${({ $onPrimary }) =>
    !$onPrimary &&
    css`
      color: var(--font-color-2);
    `}
`;

/** Same typography as surrounding line; only hover/focus differ from plain text */
const CategoryLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  font: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  border-radius: 2px;

  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
`;

const PillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  margin: 0;
  padding: 0 0 0.15rem;
`;

const Pill = styled.button`
  margin: 0;
  padding: 0.32rem 0.7rem;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: clamp(0.64rem, 1.35vw, 0.74rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  ${({ $active }) =>
    $active
      ? css`
          background: rgba(248, 249, 250, 0.22);
          color: var(--soft-white);
          border-color: rgba(255, 255, 255, 0.35);
        `
      : css`
          background: rgba(12, 14, 18, 0.35);
          color: rgba(248, 249, 250, 0.92);
          border-color: rgba(255, 255, 255, 0.18);

          &:hover {
            background: rgba(248, 249, 250, 0.1);
            border-color: rgba(255, 255, 255, 0.28);
          }
        `}
`;

const HERO_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'essays', label: 'Essays' },
  { id: 'directors', label: 'Directors' },
  { id: '1970s', label: '1970s' },
  { id: 'cinematography', label: 'Cinematography' },
];

/**
 * Filter chips under the home hero search bar.
 */
export function HomeHeroFilterPills({ activeFilter = 'all', onSelectFilter }) {
  return (
    <PillsRow>
      {HERO_FILTERS.map((f) => (
        <Pill
          key={f.id}
          type="button"
          onClick={() => onSelectFilter?.(f.id)}
          $active={f.id === activeFilter}
        >
          {f.label}
        </Pill>
      ))}
    </PillsRow>
  );
}

/**
 * Hero strip for the home page — sits above the unified search bar via SearchPageFrame `hero`.
 * `onPrimary` is set automatically when using `heroSearchPrimaryBand` on SearchPageFrame.
 */
function HomeHero({ onPrimary = false }) {
  return (
    <Root $onPrimary={onPrimary} aria-labelledby="home-hero-title">
      <HeroTextStack
        eyebrowNode={
          <Eyebrow $onPrimary={onPrimary}>Film criticism &amp; analysis</Eyebrow>
        }
        titleNode={
          <Name id="home-hero-title" $onPrimary={onPrimary}>
            James Trapp
          </Name>
        }
        subtitleNode={
          <Categories $onPrimary={onPrimary}>
            <CategoryLink to="/search_movies" title="Browse movie reviews and search films">
              Reviews
            </CategoryLink>
            {' · '}
            <CategoryLink to="/articles" title="Browse articles and essays">
              Essays
            </CategoryLink>
            {' · '}
            <CategoryLink to="/directors" title="Browse film directors">
              Directors
            </CategoryLink>
          </Categories>
        }
        showDivider
        size="inherit"
        tone={onPrimary ? 'onPrimary' : 'inherit'}
      />
    </Root>
  );
}

export default HomeHero;
