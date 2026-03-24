import styled from 'styled-components';
import DOMPurify from 'dompurify';
import {
  isWordPipelineDebugEnabled,
  getEnrichHtmlMarkers,
  logWordPipeline,
} from '@utils/enrichedDocCache';

const RichTextContainer = styled.div`
  /* Enhanced typography for better readability */
  font-family:
    'NotoSerif', 'Calibri', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: calc(clamp(1rem, 2.2vw, 1.2rem) * var(--zoom-multiplier, 1));
  line-height: 1.7;
  color: var(--rich-text-primary);
  max-width: 100%;
  min-width: 0;

  /* Enhanced spacing and typography for headers */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1.8em 0 0.8em 0;
    line-height: 1.3;
    font-weight: 400;
    color: var(--rich-text-header);
    font-family:
      'NotoSerif', 'Calibri', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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

  h4,
  h5,
  h6 {
    font-size: calc(clamp(1rem, 2.2vw, 1.2rem) * var(--zoom-multiplier, 1));
    color: var(--rich-text-primary);
  }

  h1:first-child,
  h2:first-child,
  h3:first-child {
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

  /* Enhanced list styling */
  ul,
  ol {
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

  /* Full-bleed into ContentBody padding only (same --content-inline-padding as .content-body). */
  img {
    display: block;
    height: auto;
    box-sizing: border-box;
    /* Percent width is the column width; grow by horizontal padding and pull back with negative margin */
    width: calc(100% + 2 * var(--content-inline-padding, 1rem));
    max-width: calc(100% + 2 * var(--content-inline-padding, 1rem));
    margin-left: calc(-1 * var(--content-inline-padding, 1rem));
    margin-right: calc(-1 * var(--content-inline-padding, 1rem));
    margin-top: 0;
    margin-bottom: 0;
  }

  /* Server-enriched Word sections (review_html_enricher.py) */
  .cast-grid {
    display: grid;
    grid-template-columns: 1fr;
    column-gap: 1.5rem;
    row-gap: 0;
    margin: 0.5em 0 1em 0;
    width: 100%;
  }

  /* Viewport-based: reliable vs container queries + overflow:hidden ancestors */
  @media (min-width: 36rem) {
    .cast-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  p.cast-line {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35em 0.45em;
    margin: 0;
    padding: 0.45em 0;
    min-width: 0;
    border-bottom: none;
    background-image: var(--rich-text-dotted-divider-bg);
    background-repeat: repeat-x;
    background-position: bottom left;
    background-size: var(--rich-text-dotted-dot-repeat) 1px;
    text-align: left;
    hyphens: none;
    white-space: normal;
    overflow-x: visible;
  }

  .cast-actor {
    font-weight: 600;
    flex: 0 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .cast-as {
    flex-shrink: 0;
    font-size: 0.82em;
    font-style: italic;
    font-weight: 400;
    text-transform: lowercase;
    color: var(--rich-text-primary);
    opacity: 0.7;
  }

  .cast-role {
    flex: 1 1 auto;
    min-width: 0;
    font-style: italic;
    overflow-wrap: anywhere;
  }

  /*
   * Line notes: parent grid aligns chip column to widest chip (subgrid).
   * Each .line-note spans full width; dotted rule is on the row (full bleed under chip + text).
   */
  .line-notes-group {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    /* Space between chip column and vertical rule + body (subgrid inherits this gap) */
    column-gap: 0.75rem;
    row-gap: 0;
    align-items: start;
    margin: 0.65em 0;
    text-align: left;
  }

  .line-notes-group .line-note {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: 0.75rem;
    align-items: center;
    margin: 0;
    padding: 0.4em 0;
    border-bottom: none;
    background-image: var(--rich-text-dotted-divider-bg);
    background-repeat: repeat-x;
    background-position: bottom left;
    background-size: var(--rich-text-dotted-dot-repeat) 1px;
  }

  @supports (grid-template-columns: subgrid) {
    .line-notes-group .line-note {
      grid-template-columns: subgrid;
    }
  }

  .line-note {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: 0.75rem;
    align-items: center;
    margin: 0.65em 0;
    padding: 0.4em 0;
    border-bottom: none;
    background-image: var(--rich-text-dotted-divider-bg);
    background-repeat: repeat-x;
    background-position: bottom left;
    background-size: var(--rich-text-dotted-dot-repeat) 1px;
    text-align: left;
  }

  /* Timestamp / Opens chips: CHIP_VARIANT_SECONDARY (see styles/chipVariants.js) */
  .line-note-tag {
    grid-column: 1;
    justify-self: start;
    display: inline-block;
    max-width: 100%;
    background-color: var(--background-tertiary);
    color: var(--font-color-1);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: calc(var(--default-font-size) * var(--zoom-multiplier, 1));
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1.35;
    border: 1px solid transparent;
    box-sizing: border-box;
  }

  .line-note-body {
    grid-column: 2;
    min-width: 0;
    padding-left: 1rem;
    border-left: 1px solid var(--rich-text-divider-color);
    text-align: left;
    hyphens: none;
    line-height: 1.6;
  }

  p.verdict {
    margin-top: 1.75em;
    padding: 0.75em 0;
    border-top: none;
    background-image: var(--rich-text-dotted-divider-bg);
    background-repeat: repeat-x;
    background-position: top left;
    background-size: var(--rich-text-dotted-dot-repeat) 1px;
    font-weight: 600;
    text-align: left;
    hyphens: none;
    color: var(--rich-text-header);
  }

  /* Enhanced link styling */
  a {
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease;
  }

  a:hover {
    color: var(--rich-text-header);
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

  th,
  td {
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
  strong,
  b {
    color: var(--rich-text-header);
    font-weight: 600;
  }

  em,
  i {
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
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'a',
      'img',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
  });

  if (isWordPipelineDebugEnabled()) {
    const before = getEnrichHtmlMarkers(content);
    const after = getEnrichHtmlMarkers(sanitizedContent);
    if (
      before.castLine !== after.castLine ||
      before.lineNote !== after.lineNote ||
      before.castGrid !== after.castGrid ||
      before.verdict !== after.verdict
    ) {
      logWordPipeline('RichTextDisplay DOMPurify changed markers', { before, after });
    }
  }

  return <RichTextContainer dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};

export default RichTextDisplay;
