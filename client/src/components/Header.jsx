import React, {useContext} from 'react';
import NavBar from "./NavBar"
import MobileNavBar from './MobileNavBar';
import {WindowWidthContext} from "../context/windowSize";
import Headroom from 'react-headroom';
import styled from 'styled-components';
import Logo from './Logo';
import {UserContext} from '../context/userProvider'

const StyledHeader = styled.div`
  width: 100%;
  height: var(--height-header);
  margin: 0;
  display: flex;
  justify-content: space-between;
  background: white;
  padding: 1% 5%;
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
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    color: var(--cinema-black);
    margin: 0;
    line-height: 1.1;
  }
  
  .subtitle {
    font-family: inherit;
    font-size: 0.75rem;
    color: #5c3c3c;
    margin-top: 1px;
    font-weight: 400;
    font-style: italic;
  }
`

const VintagePhotoRoll = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--height-header);
  background-image: url('/images/vintage-photo-roll.jpg');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.4;
  filter: blur(1px);
  z-index: 0;
`

const Header = () => {
  const { isMobile } = useContext(WindowWidthContext);
  const { user } = useContext(UserContext);
    
    return (
        <Headroom>
          <StyledHeader>
            <VintagePhotoRoll />
            <LeftSection>
              <Logo />
              <HeaderTitle>
                <h1>Movie Articles by Jamie Trapp</h1>
                <div className="subtitle">Film Criticism & Analysis</div>
              </HeaderTitle>
            </LeftSection>
            {isMobile ? <MobileNavBar /> : <NavBar />}
          </StyledHeader>
        </Headroom>
    );
}

export default Header;
