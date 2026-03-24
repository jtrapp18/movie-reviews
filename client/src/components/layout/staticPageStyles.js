import styled from 'styled-components';

export const StaticPageHeader = styled.header`
  text-align: center;
  width: 100%;
  margin-top: clamp(0.75rem, 2.5vw, 1.25rem);
  margin-bottom: clamp(1.5rem, 3vw, 2rem);

  h1 {
    margin-bottom: 0.5rem;
  }
`;

export const StaticPageSubtitle = styled.h3`
  margin: 0;
  font-style: italic;
  color: var(--font-color-3);
`;
