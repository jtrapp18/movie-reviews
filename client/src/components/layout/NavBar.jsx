import { useState } from 'react';
import NavLinks from './NavLinks';
import styled from 'styled-components';
import { AccountDropdown } from '@features/auth';

const StyledNavBar = styled.nav`
  color: black;
  display: flex;
  align-items: center;
  height: fit-content;

  & .nav-link {
    font-size: clamp(1.5rem, 1.5vw, 2.5rem);
  }
`;

function NavBar() {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  return (
    <StyledNavBar>
      <NavLinks setIsMenuOpen={setIsAccountMenuOpen} />
      <AccountDropdown
        isMenuOpen={isAccountMenuOpen}
        setIsMenuOpen={setIsAccountMenuOpen}
      />
    </StyledNavBar>
  );
}

export default NavBar;
