import styled from 'styled-components';

const StyledPageContainer = styled.div`
  min-height: calc(100vh - var(--height-header) - 4px);
  display: flex;
  flex-direction: column;
  justify-content: center;
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

const FullHeightContainer = styled.div`
  height: var(--size-body);
  padding: 0;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PageContainer = ({ children, fullHeight = false, ...props }) => {
  const Container = fullHeight ? FullHeightContainer : StyledPageContainer;
  return <Container {...props}>{children}</Container>;
};

export default PageContainer;
