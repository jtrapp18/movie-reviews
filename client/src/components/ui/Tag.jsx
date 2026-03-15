import React from 'react';
import styled from 'styled-components';

const TagContainer = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.backgroundColor || '#007bff'};
  color: ${props => props.textColor || '#ffffff'};
  padding: ${props => props.size === 'small' ? '2px 6px' : '4px 12px'};
  border-radius: ${props => props.size === 'small' ? '12px' : '20px'};
  font-size: ${props => props.size === 'small' ? '0.7rem' : '0.85rem'};
  font-weight: 500;
  margin: 2px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  border: 1px solid ${props => props.borderColor || 'transparent'};
  height: ${props => props.size === 'small' ? '20px' : '28px'};
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
    color: ${props => props.textColor || 'white'};
    cursor: pointer;
    
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
  size = 'normal',
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
      size={size}
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
