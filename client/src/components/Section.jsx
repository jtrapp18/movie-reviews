import React from 'react';
import styled from 'styled-components';

const StyledSection = styled.div`
  margin-bottom: 2.5rem;
  
  h2 {
    color: var(--cinema-gold);
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin-bottom: 1.25rem;
    border-bottom: 2px solid var(--cinema-gold);
    padding-bottom: 0.625rem;
  }
  
  h3 {
    color: var(--cinema-silver);
    font-size: clamp(1.1rem, 3vw, 1.3rem);
    margin: 1.25rem 0 0.625rem 0;
  }
  
  p {
    margin-bottom: 0.9375rem;
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    line-height: 1.6;
  }
`;

const Section = ({ title, children, className }) => {
  return (
    <StyledSection className={className}>
      {title && <h2>{title}</h2>}
      {children}
    </StyledSection>
  );
};

export default Section;
