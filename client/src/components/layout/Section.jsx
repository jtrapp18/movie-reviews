import styled from 'styled-components';
import { Link } from 'react-router-dom';
import MotionWrapper from '@styles/MotionWrapper';
import { SearchBar } from '@components/sections/SearchBar';

/** Global `a { font-size: … }` would shrink the title; inherit heading sizing explicitly */
export const SectionTitleLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  line-height: inherit;
  letter-spacing: inherit;

  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
    border-radius: 2px;
  }
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-bottom: 20px;
`;

const Section = ({
  title,
  /** When set, section title is a client route link (e.g. home carousel headers) */
  titleTo,
  titleHint,
  subtitle,
  searchPlaceholder,
  onSearch,
  showSearch = true,
  children,
}) => {
  return (
    <SectionContainer>
      {title ? (
        <MotionWrapper index={1}>
          <h1>
            {titleTo ? (
              <SectionTitleLink to={titleTo} title={titleHint}>
                {title}
              </SectionTitleLink>
            ) : (
              title
            )}
          </h1>
        </MotionWrapper>
      ) : null}
      {subtitle && (
        <MotionWrapper index={2}>
          <h3>
            <i>{subtitle}</i>
          </h3>
        </MotionWrapper>
      )}
      {showSearch && (
        <MotionWrapper index={3}>
          <SearchBar enterSearch={onSearch} placeholder={searchPlaceholder} />
        </MotionWrapper>
      )}
      {children}
    </SectionContainer>
  );
};

export default Section;
