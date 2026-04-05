import { useMemo } from 'react';
import { Button } from '@styles';
import DocumentViewer from './DocumentViewer';
import { useAdmin } from '@hooks/useAdmin';
import RichTextDisplay from './RichTextDisplay';
import ZoomableContent from '@components/ui/ZoomableContent';
import { buildStructuredReviewHtml } from '@utils/structuredReviewHtml';
import styled from 'styled-components';

const ContentDisplayContainer = styled.div`
  width: 100%;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 0.5rem;
`;

const Tag = styled.span`
  background-color: var(--font-color-1);
  color: var(--background-secondary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ContentBody = styled.div`
  --content-inline-padding: 1rem;
  width: 100%;
  min-width: 0;
  /* Tighter under like bar / tags on narrow viewports; caps at 2rem on large screens */
  padding: clamp(0.75rem, 4vw, 2rem) var(--content-inline-padding) 2rem;
  margin-bottom: 2rem;
`;

const ContentDisplay = ({ formValues, setIsEditing, reviewId }) => {
  const { isAdmin } = useAdmin();
  const hasContent = formValues.reviewText && formValues.reviewText.trim();
  const hasDocument = formValues.hasDocument && formValues.documentFilename && reviewId;

  // Check if document is a Word document
  const isWordDocument =
    hasDocument &&
    formValues.documentType &&
    (formValues.documentType.toLowerCase() === 'docx' ||
      formValues.documentType.toLowerCase() === 'doc');

  const structuredBeforeWordHtml = useMemo(
    () => buildStructuredReviewHtml(formValues.mainCast, formValues.lineNotes),
    [formValues.mainCast, formValues.lineNotes]
  );

  // Determine if there's any content to display
  const hasAnyContent = hasContent || hasDocument;

  return (
    <ContentDisplayContainer className="content-display">
      {(formValues.tags || formValues.tag) &&
        (formValues.tags || formValues.tag).length > 0 && (
          <TagsContainer className="tags-container">
            {(formValues.tags || formValues.tag).map((tag, index) => (
              <Tag key={index}>{typeof tag === 'string' ? tag : tag.name}</Tag>
            ))}
          </TagsContainer>
        )}

      {hasAnyContent ? (
        <ZoomableContent>
          <ContentBody className="content-body">
            {/* Word: mammoth in DocumentViewer keeps inline images; enrich runs client-side. */}
            {isWordDocument ? (
              <DocumentViewer
                className="word-document-viewer"
                documentUrl={`/api/view_document/${reviewId}`}
                documentType={formValues.documentType}
                filename={formValues.documentFilename}
                hasDocument={formValues.hasDocument}
                prependHtml={structuredBeforeWordHtml}
              />
            ) : (
              hasContent && <RichTextDisplay content={formValues.reviewText} />
            )}

            {/* Show PDF documents using DocumentViewer ONLY if no text content is available */}
            {hasDocument &&
              !isWordDocument &&
              !hasContent &&
              formValues.documentType &&
              formValues.documentType.toLowerCase() === 'pdf' && (
                <DocumentViewer
                  className="pdf-document-viewer"
                  documentUrl={`/api/view_document/${reviewId}`}
                  documentType={formValues.documentType}
                  filename={formValues.documentFilename}
                  hasDocument={formValues.hasDocument}
                />
              )}
          </ContentBody>
        </ZoomableContent>
      ) : (
        <ContentBody>
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            No content available for this article.
          </p>
        </ContentBody>
      )}

      {isAdmin && (
        <Button type="button" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      )}
    </ContentDisplayContainer>
  );
};

export default ContentDisplay;
