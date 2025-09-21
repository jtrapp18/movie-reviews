import { NavLink } from "react-router-dom";
import styled, { css } from "styled-components";
import { Link } from "react-scroll";

const StyledMenuItem = css`
  text-decoration: none;
  position: relative;
  padding-left: 3vw;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--cinema-black);
`;

const StyledNavigation = css`
  ${StyledMenuItem}
  
  &.active {
    text-decoration: overline;
    text-decoration-thickness: 2px;
    color: black;
    font-weight: bold;
  }

  &:hover {
    color: var(--cinema-maroon);
  }
`;

const StyledNavLink = styled(NavLink)`
  ${StyledNavigation}
`;

const StyledLink = styled(Link)`
  ${StyledNavigation}
`;

export { StyledNavigation, StyledMenuItem, StyledNavLink, StyledLink };
