import React from 'react';
import styled from 'styled-components';
import DOMPurify from 'dompurify';

const RichTextContainer = styled.div`
  line-height: 1.6;
  font-size: 1rem;
  
  /* Ensure proper spacing for rich text elements */
  h1, h2, h3, h4, h5, h6 {
    margin: 1.5em 0 0.5em 0;
    line-height: 1.3;
  }
  
  h1:first-child, h2:first-child, h3:first-child {
    margin-top: 0;
  }
  
  p {
    margin: 1em 0;
  }
  
  p:first-child {
    margin-top: 0;
  }
  
  p:last-child {
    margin-bottom: 0;
  }
  
  ul, ol {
    margin: 1em 0;
    padding-left: 2em;
  }
  
  blockquote {
    margin: 1.5em 0;
    padding-left: 1em;
    border-left: 4px solid #ddd;
    font-style: italic;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1em 0;
  }
  
  img {
    max-width: 100%;
    height: auto;
    margin: 1em 0;
  }
  
  a {
    color: #007bff;
    text-decoration: underline;
  }
  
  a:hover {
    color: #0056b3;
  }
`;

const RichTextDisplay = ({ content, className = "rich-text" }) => {
  if (!content || !content.trim()) {
    return null;
  }

  // Sanitize HTML content using DOMPurify for security
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
    ALLOW_DATA_ATTR: false
  });

  return (
    <RichTextContainer 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default RichTextDisplay;
