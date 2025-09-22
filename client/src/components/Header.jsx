import React, {useContext} from 'react';
import NavBar from "./NavBar"
import MobileNavBar from './MobileNavBar';
import {WindowWidthContext} from "../context/windowSize";
import Headroom from 'react-headroom';
import styled from 'styled-components';
import Logo from './Logo';
import {UserContext} from '../context/userProvider';
// Import image from public directory
const vintagePhotoRoll = '/images/vintage-photo-roll.jpg';

const StyledHeader = styled.div`
  width: 100%;
  height: var(--height-header);
  margin: 0;
  display: flex;
  justify-content: space-between;
  background: white;
  padding: 1.5% 5% 0.5%;
  align-items: end;
  position: relative;
`

const LeftSection = styled.div`
  display: flex;
  align-items: end;
  gap: 1rem;
  z-index: 1;
`

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 1;
  
  h1 {
    font-family: 'Caveat', cursive, 'Brush Script MT', 'Lucida Handwriting', sans-serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--cinema-black);
    margin: 0;
    line-height: 1.1;
    transform: rotate(-1deg);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .subtitle {
    font-family: inherit;
    font-size: 0.75rem;
    color: var(--cinema-maroon);
    margin-top: 1px;
    font-weight: 400;
    font-style: italic;
  }
`

const VintagePhotoRoll = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  opacity: 0.4;
  z-index: 0;
`;

const Header = () => {
  const { isMobile } = useContext(WindowWidthContext);
  const { user } = useContext(UserContext);
    
    return (
        <Headroom>
          <StyledHeader>
            <VintagePhotoRoll
              src={vintagePhotoRoll} 
              alt="Vintage film strip background"
            />
            <LeftSection>
              <Logo />
              <HeaderTitle>
                <h1>Jamie Trapp</h1>
                <div className="subtitle">Film Criticism & Analysis</div>
              </HeaderTitle>
            </LeftSection>
            {isMobile ? <MobileNavBar /> : <NavBar />}
          </StyledHeader>
        </Headroom>
    );
}

export default Header;
