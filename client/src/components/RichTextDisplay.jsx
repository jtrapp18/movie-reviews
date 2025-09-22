import React from 'react';
import styled from 'styled-components';
import DOMPurify from 'dompurify';

const RichTextContainer = styled.div`
  /* Enhanced typography for better readability */
  font-family: 'NotoSerif', 'Calibri', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: calc(clamp(1rem, 2.2vw, 1.2rem) * var(--zoom-multiplier, 1));
  line-height: 1.7;
  color: var(--rich-text-primary);
  max-width: 100%;
  
  /* Enhanced spacing and typography for headers */
  h1, h2, h3, h4, h5, h6 {
    margin: 1.8em 0 0.8em 0;
    line-height: 1.3;
    font-weight: 400;
    color: var(--rich-text-header);
    font-family: 'NotoSerif', 'Calibri', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  }
  
  h1 {
    font-size: calc(clamp(1.4rem, 3.5vw, 1.8rem) * var(--zoom-multiplier, 1));
    color: var(--rich-text-header);
    border-bottom: 2px solid var(--cinema-gray);
    padding-bottom: 0.3em;
  }
  
  h2 {
    font-size: calc(clamp(1.2rem, 3vw, 1.5rem) * var(--zoom-multiplier, 1));
    color: var(--rich-text-primary);
  }
  
  h3 {
    font-size: calc(clamp(1.1rem, 2.5vw, 1.3rem) * var(--zoom-multiplier, 1));
    color: var(--rich-text-primary);
  }
  
  h4, h5, h6 {
    font-size: calc(clamp(1rem, 2.2vw, 1.2rem) * var(--zoom-multiplier, 1));
    color: var(--rich-text-primary);
  }
  
  h1:first-child, h2:first-child, h3:first-child {
    margin-top: 0;
  }
  
  /* Enhanced paragraph styling */
  p {
    font-size: calc(var(--default-font-size) * var(--zoom-multiplier, 1));
    line-height: 1.7;
    margin: 1.2em 0;
    color: var(--rich-text-primary);
    text-align: justify;
    hyphens: auto;
  }
  
  p:first-child {
    margin-top: 0;
  }
  
  p:last-child {
    margin-bottom: 0;
  }
  
  /* Enhanced list styling */
  ul, ol {
    margin: 1.2em 0;
    padding-left: 2.2em;
    color: var(--rich-text-primary);
  }
  
  li {
    margin: 0.5em 0;
    line-height: 1.6;
  }
  
  /* Enhanced blockquote styling */
  blockquote {
    margin: 2em 0;
    padding: 1.2em 1.5em;
    border-left: 4px solid var(--cinema-gold);
    background-color: var(--rich-text-blockquote-bg);
    font-style: italic;
    color: var(--rich-text-primary);
    border-radius: 0 8px 8px 0;
  }
  
  /* Enhanced code styling */
  code {
    background-color: var(--rich-text-code-bg);
    color: var(--rich-text-header);
    padding: 0.3em 0.6em;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: calc(clamp(0.85rem, 1.8vw, 0.95rem) * var(--zoom-multiplier, 1));
    border: 1px solid var(--rich-text-code-border);
  }
  
  pre {
    background-color: var(--rich-text-blockquote-bg);
    color: var(--rich-text-primary);
    padding: 1.5em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5em 0;
    border: 1px solid var(--rich-text-code-border);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }
  
  pre code {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
  }
  
  /* Enhanced image styling */
  img {
    max-width: 100%;
    height: auto;
    margin: 1.5em 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  /* Enhanced link styling */
  a {
    color: var(--cinema-gold);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease;
  }
  
  a:hover {
    color: var(--rich-text-header);
    border-bottom: 1px solid var(--cinema-gold);
  }
  
  /* Enhanced table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
    background-color: var(--rich-text-table-bg);
    border-radius: 8px;
    overflow: hidden;
  }
  
  th, td {
    padding: 0.8em 1em;
    text-align: left;
    border-bottom: 1px solid var(--rich-text-table-border);
    color: var(--rich-text-primary);
  }
  
  th {
    background-color: var(--rich-text-table-header-bg);
    font-weight: 600;
    color: var(--rich-text-header);
  }
  
  /* Enhanced emphasis styling */
  strong, b {
    color: var(--rich-text-header);
    font-weight: 600;
  }
  
  em, i {
    color: var(--rich-text-primary);
    font-style: italic;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: calc(var(--default-font-size) * var(--zoom-multiplier, 1));
    line-height: 1.4;
    
    blockquote {
      margin: 1.5em 0;
      padding: 1em;
    }
    
    pre {
      padding: 1em;
      font-size: calc(clamp(0.8rem, 1.6vw, 0.9rem) * var(--zoom-multiplier, 1));
    }
  }
`;

const RichTextDisplay = ({ content }) => {
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
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default RichTextDisplay;
