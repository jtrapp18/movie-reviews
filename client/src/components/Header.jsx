import React, {useContext} from 'react';
import NavBar from "./NavBar"
import MobileNavBar from './MobileNavBar';
import {WindowWidthContext} from "../context/windowSize";
import Headroom from 'react-headroom';
import styled from 'styled-components';
import Logo from './Logo';
import {UserContext} from '../context/userProvider'

const StyledHeadRoom = styled(Headroom)`

  .headroom {
    #logged-in {
      position: absolute;
      right: 10vw;
      top: 0;
      color: var(--honey);
    }

  }
`

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
        <StyledHeadRoom>
          <StyledHeader>
            <VintagePhotoRoll />
            <Logo />
            {isMobile ? <MobileNavBar /> : <NavBar />}
          </StyledHeader>
            {user && !isMobile && <span id='logged-in'>{`Logged in as ${user.username}`}</span>}
        </StyledHeadRoom>
    );
}

export default Header;
