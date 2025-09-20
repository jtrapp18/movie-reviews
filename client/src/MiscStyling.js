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
  min-height: calc(100vh - var(--height-header) - 4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;

  /* Background image */
  // background-image: ${(props) => props.isMobile ? 'none' : `url('/images/grid_left.png')`};
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
    /* Reset browser defaults */
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    
    /* Styled form inputs */
    width: 100%;
    background: var(--cinema-gold);
    color: black;
    padding: 5px;
    border: 1px solid var(--cinema-gold-dark);
    border-radius: 4px;
    box-sizing: border-box;
  }

  textarea:hover, input:hover, select:hover {
    background: var(--cinema-gold-dark);
  }

  div {
    margin-bottom: 12px;
  }

  span {
    color: gray;
  }

  .submit-error {
    cursor: pointer;
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
  gap: 5px;
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

const Button = styled.button.attrs(props => ({
  type: props.type || 'button'
}))`
  /* Reset browser defaults */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  /* Button styling */
  width: fit-content;
  margin: 5px;
  color: var(--cinema-black);
  background: var(--cinema-gold);
  border: 2px solid var(--cinema-gold-dark);
  border-radius: 15px;
  padding: 5px;
  min-width: 120px;
  height: fit-content;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--cinema-gold-dark);
    border-color: var(--cinema-gold-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--cinema-gold), 0.3);
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`

const DeleteButton = styled(Button)`
  background-color: var(--cinema-red);
  color: white;
  border: 2px solid var(--cinema-red-dark);

  &:hover {
    background-color: var(--cinema-red-dark);
    border-color: var(--cinema-red-dark);
  }
`

const CancelButton = styled(Button)`
  background-color: var(--cinema-gray-light);
  border: 2px solid var(--cinema-gray);

  &:hover {
    background-color: var(--cinema-gray);
    border-color: var(--cinema-gray);
  }
`

const ExtractButton = styled(Button)`
  background-color: var(--cinema-blue);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: ${props => props.isExtracting ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.isExtracting ? 0.6 : 1};

  &:hover {
    background-color: var(--cinema-blue-dark);
    border-color: var(--cinema-blue-dark);
  }
`

const StyledCard = styled.article`
  position: relative;
  width: 200px;
  height: 280px;
  max-height: 90vh;
  cursor: pointer;

  h2 {
    position: absolute;
    bottom: 0;
    width: 100%;
    color: white;
    background: rgba(0, 0, 0, 0.8);
    padding: 0.5rem;
    text-align: center;
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
    font-weight: bold;
    // z-index: 1000;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(2px);
    transition: opacity 0.3s ease;
  }

  &:hover h2 {
    opacity: 0;
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
    font-size: clamp(0.7rem, 2vw, 0.9rem);
    line-height: 1.3;

    .movie-metadata {
      padding: 0;
      align-items: start;

      p {
        margin: 0;
        font-size: clamp(0.65rem, 1.8vw, 0.8rem);
      }
    }

    p {
      font-size: clamp(0.6rem, 1.5vw, 0.75rem);
      line-height: 1.2;
    }
  }

  &:hover .movie-details {
    opacity: 1;
    zoom: 1.03;
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

const DocumentContent = styled.div`
  padding: 20px;
  line-height: 1.6;
  
  img {
    max-width: 100%;
    height: auto;
    margin: 10px 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }
  
  table, th, td {
    border: 1px solid #ddd;
  }
  
  th, td {
    padding: 8px;
    text-align: left;
  }
  
  p {
    margin: 10px 0;
  }
`;

export { StyledNavigation, StyledMenuItem, StyledNavLink, StyledLink, StyledMain, StyledForm, 
  StyledDeleted, CardContainer, BorderGlow, Button, Tag, DeleteButton, CancelButton, ExtractButton,
  StyledCard, StyledContainer, DocumentContent }