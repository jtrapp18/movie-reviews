import styled, { css } from 'styled-components';
import { CONTAINER_MAX_WIDTH } from './containerMaxWidth';

const containerShell = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 1rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    padding: 0;
  }

  h1 {
    text-align: center;
  }

  hr {
    width: 100%;
  }
`;

const StyledMain = styled.main`
  min-height: calc(100vh - var(--height-header) - 4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;

  background-size: auto 40vh;
  background-position: top left;
  background-repeat: no-repeat;
`;

const StyledContainer = styled.div`
  ${containerShell}
  width: ${CONTAINER_MAX_WIDTH.narrow};
`;

/** Same shell as StyledContainer but with narrow | medium | full max width */
export const StyledSizedContainer = styled.div`
  ${containerShell}
  width: ${({ $size = 'narrow' }) =>
    CONTAINER_MAX_WIDTH[$size] ?? CONTAINER_MAX_WIDTH.narrow};
`;

const CardContainer = styled.div`
  width: 100%;
  display: grid;
  gap: 5px;
  max-width: 100vw;
  justify-items: center;

  hr {
    width: 100%;
  }
`;

const StyledDeleted = styled.div`
  width: fit-content;
  max-width: 90vw;
  padding: 50px;
  display: flex;
  flex-direction: column;

  h2 {
    padding: 5px;
    border-radius: 200px;
    text-align: center;
    color: red;
  }

  div {
    display: flex;
    border-bottom: 2px dotted gray;
    justify-content: space-between;
    margin: 10px 5px 0px 5px;
    padding: 20px 5px 0px 5px;
  }
`;

/** Horizontal inset on small screens when StyledContainer drops padding (see containerShell). */
export const MobilePageGutter = styled.div`
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;

/**
 * Bounded reading column + mobile horizontal inset. Use for static/marketing pages
 * (About, Contact, etc.). Search-driven pages use SearchPageFrame and wrap their
 * body in MobilePageGutter where needed.
 */
export function StaticPageShell({ children, ...rest }) {
  return (
    <StyledContainer {...rest}>
      <MobilePageGutter>{children}</MobilePageGutter>
    </StyledContainer>
  );
}

export { StyledMain, StyledContainer, CardContainer, StyledDeleted };
