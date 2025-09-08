import React from 'react';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper';
import SearchBar from './SearchBar';

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-bottom: 20px;
`;

const Section = ({ 
  title, 
  subtitle, 
  searchPlaceholder, 
  onSearch, 
  showSearch = true,
  children 
}) => {
  return (
    <SectionContainer>
      <MotionWrapper index={1}>
        <h1>{title}</h1>
      </MotionWrapper>
      {subtitle && (
        <MotionWrapper index={2}>
          <h3>{subtitle}</h3>
        </MotionWrapper>
      )}
      {showSearch && (
        <MotionWrapper index={3}>
          <SearchBar 
            enterSearch={onSearch} 
            placeholder={searchPlaceholder}
          />
        </MotionWrapper>
      )}
      {children}
    </SectionContainer>
  );
};

export default Section;