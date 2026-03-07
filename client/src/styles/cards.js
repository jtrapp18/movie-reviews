import styled from 'styled-components';

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
`;

const Tag = styled.div`
  background: gray;
  border-radius: 5px;
  padding: 5px;
  color: white;
  width: fit-content;
`;

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

const MediaCard = styled.article`
  position: relative;
  width: 200px;
  height: 280px;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,0,0,.4);
  transition: transform .2s ease, box-shadow .2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(0,0,0,.6);
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
    filter: grayscale(80%);
  }

  /* readability gradient */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0,0,0,.85),
      rgba(0,0,0,.3),
      transparent
    );
    z-index: 1;
  }
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 10px;
  color: white;
`;

const CardOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  background: rgba(0,0,0,.85);
  opacity: 0;
  padding: 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: opacity .25s ease;

  ${MediaCard}:hover & {
    opacity: 1;
  }
`;

const CardDate = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  color: var(--cinema-gold);
  font-size: 9px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.65);
  padding: 3px 6px;
  border-radius: 4px;
`;

const CardTitle = styled.h2`
  margin: 0;
  line-height: 1.2;
  font-weight: bold;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  // padding: 10% 5%;
`;

export { BorderGlow, Tag, DocumentContent, MediaCard, CardContent, CardOverlay, CardDate, CardTitle };
