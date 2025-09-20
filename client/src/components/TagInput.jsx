import React, { useState } from 'react';
import styled from 'styled-components';
import Tag from './Tag';
import {Button} from '../MiscStyling';

const TagInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--cinema-gold-dark);
  border-radius: 8px;
  background-color: var(--cinema-gray-dark);
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TagsDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
`;

const Input = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  padding: 4px 8px;
  min-width: 120px;
  flex: 1;
  color: var(--cinema-black);

  &::placeholder {
    color: var(--cinema-gray);
  }
`;

const AddButton = styled(Button)`
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const TagInput = ({ 
  tags = [], 
  onTagsChange, 
  placeholder = "Add tags...",
  maxTags = 10 
}) => {
  const [inputValue, setInputValue] = useState('');

  const predefinedColors = [
    { bg: '#007bff', text: '#ffffff' },
    { bg: '#28a745', text: '#ffffff' },
    { bg: '#ffc107', text: '#212529' },
    { bg: '#dc3545', text: '#ffffff' },
    { bg: '#6f42c1', text: '#ffffff' },
    { bg: '#fd7e14', text: '#ffffff' },
    { bg: '#20c997', text: '#ffffff' },
    { bg: '#e83e8c', text: '#ffffff' },
    { bg: '#6c757d', text: '#ffffff' },
    { bg: '#17a2b8', text: '#ffffff' }
  ];

  const getRandomColor = () => {
    return predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
  };

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && tags.length < maxTags && !tags.some(tag => tag.name === trimmedValue)) {
      const color = getRandomColor();
      const newTag = {
        id: Date.now(), // Simple ID generation
        name: trimmedValue,
        backgroundColor: color.bg,
        textColor: color.text
      };
      onTagsChange([...tags, newTag]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagId) => {
    onTagsChange(tags.filter(tag => tag.id !== tagId));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <TagInputContainer>
      <InputRow>
        {tags.length < maxTags && (
          <>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
            />
            <AddButton 
              onClick={handleAddTag}
              disabled={!inputValue.trim() || tags.length >= maxTags}
            >
              Add
            </AddButton>
          </>
        )}
        
        {tags.length >= maxTags && (
          <span>
            Maximum {maxTags} tags reached
          </span>
        )}
      </InputRow>
      
      <TagsDisplay>
        {tags.map(tag => (
          <Tag
            key={tag.id}
            backgroundColor={tag.backgroundColor}
            textColor={tag.textColor}
            onRemove={() => handleRemoveTag(tag.id)}
          >
            {tag.name}
          </Tag>
        ))}
      </TagsDisplay>
    </TagInputContainer>
  );
};

export default TagInput;
