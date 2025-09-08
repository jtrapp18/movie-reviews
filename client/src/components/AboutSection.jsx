import React from 'react';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper';

const AboutSectionContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
`;

const AboutSectionTitle = styled.h2`
  color: var(--cinema-gold);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: left;
`;

const AboutSection = ({ title, children }) => {
  return (
    <AboutSectionContainer>
      <MotionWrapper index={1}>
        <AboutSectionTitle>{title}</AboutSectionTitle>
      </MotionWrapper>
      <MotionWrapper index={2}>
        <div>{children}</div>
      </MotionWrapper>
    </AboutSectionContainer>
  );
};

export default AboutSection;
