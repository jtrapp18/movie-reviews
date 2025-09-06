import React from 'react';
import styled from 'styled-components';

const TagContainer = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.backgroundColor || '#007bff'};
  color: ${props => props.textColor || '#ffffff'};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  margin: 2px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  border: 1px solid ${props => props.borderColor || 'transparent'};
  height: 28px;
  line-height: 1;
  white-space: nowrap;

  &:hover {
    ${props => props.clickable && `
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `}
  }

  .tag-remove {
    margin-left: 6px;
    font-size: 0.9rem;
    font-weight: bold;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const Tag = ({ 
  children, 
  backgroundColor, 
  textColor, 
  borderColor,
  clickable = false, 
  onRemove, 
  onClick,
  ...props 
}) => {
  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <TagContainer
      backgroundColor={backgroundColor}
      textColor={textColor}
      borderColor={borderColor}
      clickable={clickable}
      onClick={handleClick}
      {...props}
    >
      {children}
      {onRemove && (
        <span className="tag-remove" onClick={handleRemove}>
          ×
        </span>
      )}
    </TagContainer>
  );
};

export default Tag;
