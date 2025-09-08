import { NavLink } from "react-router-dom";
import styled, {css} from "styled-components";
import { Link } from "react-scroll";

const StyledMenuItem = css`
  text-decoration: none;
  position: relative;
  padding-left: 3vw;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const StyledNavigation = css`
  ${StyledMenuItem}
  
  &.active {
    text-decoration: overline;
    text-decoration-thickness: 2px;
    color: var(--cinema-gold);
  }

  &:hover {
    color: var(--cinema-gold);
  }
`;

const StyledNavLink = styled(NavLink)`
  ${StyledNavigation}
`

const StyledLink = styled(Link)`
  ${StyledNavigation}
`

const StyledMain = styled.main`
  min-height: var(--size-body);
  display: flex;
  flex-direction: column;
  align-items: center;

  /* Background image */
  background-image: ${(props) => props.isMobile ? 'none' : `url('/images/grid_left.png')`};
  background-size: auto 40vh;
  background-position: top left;
  background-repeat: no-repeat;
`;

const StyledForm = styled.form`
  width: 600px;
  max-width: 75vw;
  padding: 2%;
  overflow-y: visible;
  display: flex;
  flex-direction: column;

  h1 {
    padding: 5px;
    border-radius: 200px;
    text-align: center;
  }

  input, textarea, select, option {
    width: 100%;
    background: var(--cinema-gold);
    color: black;
    padding: 5px;
  }

  textarea:hover, input:hover, select:hover {
    background: var(--cinema-gold-dark);
  }

  div:not(:last-child) {
    margin-bottom: 12px;
  }

  span {
    color: gray;
  }

  .submit-error {
    cursor: pointer;
  }
`

const StyledSubmit = styled.div`
  width: 650px;
  max-width: 75vw;
  padding: 2%;
  display: flex;
  flex-direction: column;

  h1 {
    padding: 5px;
    border-radius: 200px;
    text-align: center;
  }

  p {
    color: var(--cinema-gold);
  }

  div {
    display: flex;
    flex-direction: column;
    border-bottom: 2px dotted gray;
    margin: 10px 5px 15px 5px;
    padding: 20px 5px 10px 5px;
  }
`

const StyledDeleted = styled.div`
  width: fit-content;
  max-width: 90vw;
  padding: 50px;
  display: flex;
  flex-direction: column;

  h2 {
    padding: 5px;
    border-radius: 200px;
    text-align: center;
    color: red;
  }

  div {
    display: flex;
    border-bottom: 2px dotted gray;
    justify-content: space-between;
    margin: 10px 5px 0px 5px;
    padding: 20px 5px 0px 5px;
  }
`

const CardContainer = styled.div`
  width: 100%;
  display: grid;
  gap: 10px;
  max-width: 100vw;
  justify-items: center;

  hr {
    width: 100%;
  }
`

const BorderGlow = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 10px;

  /* Radial gradient for glow */
  background: radial-gradient(
    circle, 
    rgba(0, 0, 0, 0) 5%,
    rgba(0, 0, 0, 0.9) 60%,
    rgba(0, 0, 0, 1) 100%
  );

  opacity: 0;
  animation: fadeIn 0.8s ease-in-out forwards;
`

const Button = styled.button`
  color: black;
  background: var(--cinema-gold);
  min-width: 100px;
  height: fit-content;

  &:hover {
    background: var(--cinema-gold-dark);
    font-weight: bold;
  }
`

const StyledCard = styled.article`
  position: relative;
  // width: 100%;
  width: 200px;
  height: 280px;
  max-height: 90vh;
  cursor: pointer;

  h2 {
    position: absolute;
    top: 1%;
    left: 0;
    color: black;
    z-index: 1000;
  }

  img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .movie-details {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    padding: 3%;
    align-items: start;

    .movie-metadata {
      padding: 0;
      align-items: start;

      p {
        margin: 0;
      }
    }
  }

  &:hover .movie-details {
    opacity: 1;
    background: rgba(0, 0, 0, .7);
  }
`

const StyledContainer = styled.div`
    width: 1000px;
    max-width: 98vw;
    margin: 0;
    padding: 0% 5%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h1 {
      text-align: center;
      padding-top: 2vh;
    }

    hr {
      width: 100%;
    }
`

const Tag = styled.div`
  background: gray;
  border-radius: 5px;
  padding: 5px;
  color: white;
  width: fit-content;
`

export { StyledMenuItem, StyledNavLink, StyledLink, StyledMain, StyledForm, 
  StyledSubmit, StyledDeleted, CardContainer, BorderGlow, Button, Tag,
  StyledCard, StyledContainer }