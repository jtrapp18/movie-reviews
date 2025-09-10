import styled from 'styled-components';

const StyledPageContainer = styled.div`
  min-height: calc(100vh - var(--height-header) - 4px);
  padding: 20px;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
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
