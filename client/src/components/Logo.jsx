import styled from "styled-components";
import { NavLink } from "react-router-dom";

const LogoContainer = styled.div` 
  height: fit-content;
  display: flex;
  align-items: end;

  img {
    height: clamp(1.5rem, 5vw, 3rem);
    transition: transform 0.3s ease-in-out;

    &:hover {
      transform: rotate(-15deg);
    }
  }
`

function Logo() {


  return (
      <LogoContainer>
        <NavLink
          to="/"
          className="home"
        >
          <img src={`images/clapperboard.png`} alt="clapperboard"/>
        </NavLink>
      </LogoContainer>
  );
};

export default Logo;