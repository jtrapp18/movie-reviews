import React from 'react';
import styled from 'styled-components';

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    background: var(--cinema-gray);
    margin: 0.5rem 0;
    padding: 0.75rem 1.25rem;
    border-left: 4px solid var(--cinema-gold);
    border-radius: 4px;
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--cinema-light-gray);
      transform: translateX(0.3rem);
    }
  }
`;

const List = ({ items, className }) => {
  return (
    <StyledList className={className}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </StyledList>
  );
};

export default List;
