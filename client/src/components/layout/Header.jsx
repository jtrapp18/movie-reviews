import { useContext } from 'react';
import NavBar from './NavBar';
import MobileNavBar from './MobileNavBar';
import { WindowWidthContext } from '@context/windowSize';
import Headroom from 'react-headroom';
import styled from 'styled-components';
import Logo from '@components/ui/Logo';
import { UserContext } from '@context/userProvider';

const StyledHeader = styled.div`
  width: 100%;
  height: var(--height-header);
  margin: 0;
  display: flex;
  justify-content: space-between;
  background: var(--background-secondary);
  border-bottom: 1px solid rgba(0, 17, 61, 0.1);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.02);
  padding-top: 1.5%;
  padding-bottom: 0.5%;
  padding-right: clamp(1rem, 4vw, 3.5rem);
  padding-left: clamp(0.75rem, 3vw, 2.75rem);
  align-items: end;
  position: relative;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  z-index: 1;
  min-width: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1;
`;

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  transform: translateY(2px);
  z-index: 1;
  min-width: 0;

  h1 {
    font-family: 'Caveat', cursive, 'Brush Script MT', 'Lucida Handwriting', sans-serif;
    font-size: clamp(1.1rem, 2.3vw, 1.5rem);
    font-weight: 500;
    // color: var(--font-color-1);
    margin: 0;
    line-height: 1;
    transform: rotate(-1deg);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
  }

  .subtitle {
    font-family: inherit;
    font-size: clamp(0.6rem, 1.35vw, 0.75rem);
    color: var(--cinema-maroon);
    margin-top: 0;
    line-height: 1.1;
    font-weight: 400;
    font-style: italic;
    white-space: nowrap;
  }
`;

const Header = () => {
  const { isMobile } = useContext(WindowWidthContext);
  useContext(UserContext);

  return (
    <Headroom style={{ zIndex: 900 }}>
      <StyledHeader>
        {/* <VintagePhotoRoll
              src={vintagePhotoRoll}
              alt="Vintage film strip background"
            /> */}
        <LeftSection>
          <Logo />
          <HeaderTitle>
            <h1>James Trapp</h1>
            <div className="subtitle">Film Criticism & Analysis</div>
          </HeaderTitle>
        </LeftSection>
        <RightSection>{isMobile ? <MobileNavBar /> : <NavBar />}</RightSection>
      </StyledHeader>
    </Headroom>
  );
};

export default Header;
