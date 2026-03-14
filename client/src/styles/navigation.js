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
  color: var(--font-color-1);
  white-space: nowrap;
`;

const StyledNavigation = css`
  ${StyledMenuItem}
  
  &.active {
    text-decoration: overline;
    text-decoration-thickness: 2px;
    // color: var(--font-color-2);
    font-weight: bold;
  }

  &:hover {
    color: var(--font-color-2);
    font-weight: bold;
  }
`;

const StyledNavLink = styled(NavLink)`
  ${StyledNavigation}
`;

const StyledLink = styled(Link)`
  ${StyledNavigation}
`;

export { StyledNavigation, StyledMenuItem, StyledNavLink, StyledLink };
