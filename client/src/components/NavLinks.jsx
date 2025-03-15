import { StyledMenuItem, StyledNavLink } from "../MiscStyling";
import { FaUserAlt } from 'react-icons/fa'; // Import icons
import styled from "styled-components";

const StyledAccountIcon = styled.div`
  ${StyledMenuItem}
  position: relative;
  z-index: 1000;
`

function NavLinks({ handleClick, setIsMenuOpen }) {

  return (
    <>
      <StyledNavLink
        to="/about"
        className="nav-link"
        onClick={handleClick}
      >
        About
      </StyledNavLink>
      <StyledNavLink
        to="/search_movies"
        className="nav-link"
        onClick={handleClick}
      >
        Search Movies
      </StyledNavLink>
      <StyledAccountIcon
        className="nav-link"
        onMouseOver={()=>setIsMenuOpen(true)}
        onMouseOut={()=>setIsMenuOpen(false)}
      >
        <FaUserAlt />
      </StyledAccountIcon> 
  </>
  );
};

export default NavLinks;