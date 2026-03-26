import { StyledNavLink } from '@styles';
import styled from 'styled-components';
import { useAdmin } from '@hooks/useAdmin';
import { UserAvatar } from '@features/auth';
import { NotificationBell } from '@features/notifications';

const NavRow = styled.div`
  display: flex;
  align-items: center;
  --nav-gap: clamp(1.25rem, 3vw, 2.75rem);
`;

const TabsRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--nav-gap);

  /* Tabs should be spaced by flex gap, not left-padding. */
  & > a.nav-link {
    padding-left: 0;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const Divider = styled.div`
  width: 1px;
  height: 1.6rem;
  background: rgba(0, 17, 61, 0.18);
  margin: 0 var(--nav-gap);
  flex: 0 0 auto;
`;

const StyledAccountIcon = styled.div`
  position: relative;
  z-index: 1000;
  display: flex;
  align-items: center;
  color: var(--font-color-1);
  padding-left: 0; /* override nav link spacing so bell+avatar stay grouped */
`;

function NavLinks({ handleClick, setIsMenuOpen }) {
  useAdmin();

  return (
    <NavRow>
      <TabsRow>
        <StyledNavLink to="/" className="nav-link" onClick={handleClick}>
          Home
        </StyledNavLink>
        <StyledNavLink to="/search_movies" className="nav-link" onClick={handleClick}>
          Search Movies
        </StyledNavLink>
        <StyledNavLink to="/directors" className="nav-link" onClick={handleClick}>
          Directors
        </StyledNavLink>
        <StyledNavLink to="/about" className="nav-link" onClick={handleClick}>
          About
        </StyledNavLink>
      </TabsRow>

      <Divider aria-hidden />

      <ActionsRow>
        <NotificationBell />
        <StyledAccountIcon
          className="nav-link"
          onMouseOver={() => setIsMenuOpen(true)}
          onMouseOut={() => setIsMenuOpen(false)}
        >
          <UserAvatar />
        </StyledAccountIcon>
      </ActionsRow>
    </NavRow>
  );
}

export default NavLinks;
