import styled, { keyframes } from 'styled-components';
import { NavLink } from "react-router-dom";

const filmStripMove = keyframes`
  0% { transform: translateX(-100px); }
  100% { transform: translateX(calc(100vw + 100px)); }
`;

const spotlight = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
`;


const StyledContainer = styled.div`
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
  overflow: hidden;

  /* Background image */
  background-image: url('/images/swarm.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* Film grain overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, transparent 20%, rgba(0,0,0,0.1) 21%, rgba(0,0,0,0.1) 34%, transparent 35%),
      radial-gradient(circle at 80% 20%, transparent 20%, rgba(0,0,0,0.1) 21%, rgba(0,0,0,0.1) 34%, transparent 35%),
      radial-gradient(circle at 40% 40%, transparent 20%, rgba(0,0,0,0.1) 21%, rgba(0,0,0,0.1) 34%, transparent 35%);
    background-size: 3px 3px, 2px 2px, 4px 4px;
    opacity: 0.3;
    pointer-events: none;
  }

  .film-strip {
    position: absolute;
    top: 20px;
    width: 60px;
    height: 8px;
    background: repeating-linear-gradient(
      90deg,
      #000 0px,
      #000 8px,
      #fff 8px,
      #fff 12px,
      #000 12px,
      #000 20px
    );
    animation: ${filmStripMove} 8s linear infinite;
  }

  .film-strip:nth-child(2) {
    top: calc(100vh - 28px);
    animation-delay: 2s;
  }


  .content {
    padding: 2%;
    text-align: center;
    position: relative;
    z-index: 3;

    .spotlight {
      position: absolute;
      top: -50%;
      left: -50%;
      right: -50%;
      bottom: -50%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: ${spotlight} 3s ease-in-out infinite;
      pointer-events: none;
    }

    h3 {
      font-size: clamp(3.5rem, 5vw, 5.5rem);
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      margin-bottom: 20px;
      background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: ${spotlight} 2s ease-in-out infinite;
    }

    .subtitle {
      font-size: clamp(1.2rem, 2vw, 1.8rem);
      color: #ccc;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      margin-bottom: 30px;
      font-style: italic;
    }

    a {
      font-size: clamp(2rem, 2.5vw, 3rem);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      color: #0096FF;
      text-decoration: none;
      padding: 15px 30px;
      border: 2px solid #0096FF;
      border-radius: 8px;
      transition: all 0.3s ease;
      display: inline-block;
    }

    a:hover {
      background-color: #0096FF;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,150,255,0.3);
    }
  }
`;

function ErrorPage() {
  return (
    <StyledContainer>
      <div className="film-strip"></div>
      <div className="film-strip"></div>
      
      <div className="content">
        <div className="spotlight"></div>
        <h3>404: Scene Not Found</h3>
        <NavLink to="/" className="nav-link">
          Return to the Main Feature
        </NavLink>
      </div>
    </StyledContainer>
  );
}

export default ErrorPage;