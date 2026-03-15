import React from 'react';
import styled from 'styled-components';
import MotionWrapper from '@styles/MotionWrapper';

const AboutSectionContainer = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
`;

const AboutSectionTitle = styled.h2`
  margin-bottom: 1rem;
  text-align: left;
`;

const AboutSectionContent = styled.div`
  width: 100%;
`;

const AboutSection = ({ title, children }) => {
  return (
    <AboutSectionContainer>
      {title != null && title !== '' && (
        <MotionWrapper index={1}>
          <AboutSectionTitle>{title}</AboutSectionTitle>
        </MotionWrapper>
      )}
      <MotionWrapper index={2}>
        <AboutSectionContent>{children}</AboutSectionContent>
      </MotionWrapper>
    </AboutSectionContainer>
  );
};

export default AboutSection;
