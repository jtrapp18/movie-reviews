import styled from "styled-components";
import { useState, useRef, useEffect, useContext } from "react";
import { StyledNavLink } from "../MiscStyling";
import { scrollToTop } from "../helper";
import { UserContext } from '../context/userProvider';
import { AdminContext } from '../context/adminProvider';
import { userLogout } from "../helper";

const StyledMobileLink = styled(StyledNavLink)`
  color: var(--cinema-gold-dark);

  &.active {
    color: var(--cinema-gold);
  }
`
const StyledDiv = styled.div`
    height: var(--height-header);
    position: relative;
    background: white;
    display: flex;
`
const LinkContainer = styled.div`
  position: fixed;
  top: calc(var(--height-header) + 3px);
  height: 100vh;
  
  left: 0;
  z-index: 2000;
  width: 100vw;
  text-decoration: none;
  text-align: right;
  background: black;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Ensures smooth animation */
  transform-origin: top; /* Animation starts at the top */
  transform: scaleY(0); /* Initially collapsed */
  transition: transform 0.3s ease-in-out; /* Smooth fold-out animation */

  a {
    height: 8.5vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(1.5rem, 3vw, 1.75rem);
  }

  &.open {
    transform: scaleY(1); /* Fully expanded */
  }

  &.closed {
    transform: scaleY(0); /* Fully collapsed */
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 1000;
  position: absolute; /* Position it within the header */
  right: 0;
  bottom: 0;
  width: 40px;
  height: 30px;

  @media (max-width: 768px) {
    display: block;
  }

  &.open {
    span:first-child {
      transform: rotate(45deg) translate(6px, 6px);
      width: 30px;
    }
    
    span:last-child {
      transform: rotate(-45deg) translate(4px, -4px);
      width: 30px;
    }
  }

  span {
    display: block;
    height: 3px;
    background-color: black;
    border-radius: 2px;
    transition: all 0.3s ease;
    position: absolute;
    right: 0; /* Align lines to the right */
  }

  span:first-child {
    width: 30px; /* Longer top line */
    top: 7px;
  }

  span:last-child {
    width: 20px; /* Shorter bottom line */
    top: 20px;
  }
`;

// MobileNavBar Component
const MobileNavBar = () => {
  const { user, setUser } = useContext(UserContext);
  const { isAdmin, logoutAdmin } = useContext(AdminContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef(null); // Create a reference to the card element

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleClick = () => {
    scrollToTop();
    setIsMenuOpen(false); // Close menu after navigation
  };

  const handleAdminLogout = () => {
    if (isAdmin) {
      logoutAdmin();
      setUser(null);
      setIsMenuOpen(false);
    }
    handleClick()
  }

  return (
    <StyledDiv
      ref={cardRef}
    >
      <LinkContainer 
        className={isMenuOpen ? "open" : "closed"}
      >
        <StyledMobileLink
          to="/"
          className="nav-link"
          onClick={handleClick}
        >
          Home
        </StyledMobileLink>
        <StyledMobileLink
          to="/search_movies"
          className="nav-link"
          onClick={handleClick}
        >
          Search Movies
        </StyledMobileLink>
        <StyledMobileLink
          to="/about"
          className="nav-link"
          onClick={handleClick}
        >
          About
        </StyledMobileLink>
        {isAdmin && (
          <>
            <StyledMobileLink
              to="/account_details"
              className="nav-link"
              onClick={handleClick}
            >
              Account Details
            </StyledMobileLink>
            <StyledMobileLink
              to="/"
              className="nav-link"
              onClick={handleAdminLogout}
            >
              Logout Admin
            </StyledMobileLink>
          </>
        )}
      </LinkContainer>
      <HamburgerButton 
        className={isMenuOpen ? "open" : ""} 
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        <span></span>
        <span></span>
      </HamburgerButton>
    </StyledDiv>
  );
};

export default MobileNavBar;