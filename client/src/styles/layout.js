import styled from 'styled-components';

const StyledMain = styled.main`
  min-height: calc(100vh - var(--height-header) - 4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;

  /* Background image */
  // background-image: ${(props) => props.isMobile ? 'none' : `url('/images/grid_left.png')`};
  background-size: auto 40vh;
  background-position: top left;
  background-repeat: no-repeat;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: min(900px, 90vw);
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 2.5rem) clamp(1rem, 4vw, 1.25rem);
  line-height: 1.6;

  @media (max-width: 768px) {
    width: 98vw;
  }

  h1 {
    text-align: center;
    padding-top: 2vh;
  }

  hr {
    width: 100%;
  }
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

export { StyledMain, StyledContainer, CardContainer, StyledDeleted };
