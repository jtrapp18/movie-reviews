import styled from 'styled-components';
import { useRef } from 'react';
import { scrollToTop } from '@helper';
import { NavLink } from 'react-router-dom';
import { useAccountActions } from '@utils/account';

const LinkContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  width: 200px;
  text-decoration: none;
  text-align: right;
  background: var(--background-tertiary);
  border: 1px solid var(--border);
  border-bottom: 3px double var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Ensures smooth animation */
  transform-origin: top; /* Animation starts at the top */
  transform: scaleY(0); /* Initially collapsed */
  transition: transform 0.3s ease-in-out; /* Smooth fold-out animation */

  &.open {
    transform: scaleY(1); /* Fully expanded */
  }

  &.closed {
    transform: scaleY(0); /* Fully collapsed */
  }

  #exit {
    background: var(--gray);
    span {
      cursor: pointer;
      padding: 5px;
    }
  }
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  position: relative;
  cursor: pointer;
  padding: 10px;
  font-size: clamp(1.2rem, 1.5vw, 2.2rem);

  height: 10vh;
  justify-content: end;
  align-items: center;
  display: flex;

  &.active {
    text-decoration: overline;
    text-decoration-thickness: 2px;
  }

  &:hover {
    color: var(--background-tertiary);
    background: var(--font-color-1);
  }
`;

const AccountDropdown = ({ isMenuOpen, setIsMenuOpen }) => {
  const { user, handleAccount } = useAccountActions();
  const cardRef = useRef(null);

  const handleAccountToggle = () => {
    handleAccount(() => {
      setIsMenuOpen(false);
    });
  };

  const handleClick = () => {
    scrollToTop();
    setIsMenuOpen(false); // Close menu after navigation
  };

  return (
    <LinkContainer
      ref={cardRef}
      onMouseOver={() => setIsMenuOpen(true)}
      onMouseOut={() => setIsMenuOpen(false)}
      className={isMenuOpen ? 'open' : 'closed'}
    >
      {user && (
        <StyledNavLink to="/account" className="nav-link" onClick={handleClick}>
          Account
        </StyledNavLink>
      )}
      <StyledNavLink as="button" className="nav-link" onClick={handleAccountToggle}>
        {user ? 'Logout' : 'Login'}
      </StyledNavLink>
    </LinkContainer>
  );
};

export default AccountDropdown;
