import styled from 'styled-components';

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
`;

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

export { StyledCard, BorderGlow, Tag, DocumentContent };
