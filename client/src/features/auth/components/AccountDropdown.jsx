import styled from 'styled-components';
import { useRef } from 'react';
import { scrollToTop } from '@helper';
import { NavLink } from 'react-router-dom';
import { useAccountActions } from '@utils/account';
import DropdownPanel from '@components/ui/DropdownPanel';

const LinkContainer = styled(DropdownPanel)`
  width: 200px;
  text-decoration: none;
  text-align: right;
  display: flex;
  flex-direction: column;

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
        <>
          <StyledNavLink to="/account" className="nav-link" onClick={handleClick}>
            Account
          </StyledNavLink>
          <StyledNavLink to="/notifications" className="nav-link" onClick={handleClick}>
            Notifications
          </StyledNavLink>
        </>
      )}
      <StyledNavLink as="button" className="nav-link" onClick={handleAccountToggle}>
        {user ? 'Logout' : 'Login'}
      </StyledNavLink>
    </LinkContainer>
  );
};

export default AccountDropdown;
