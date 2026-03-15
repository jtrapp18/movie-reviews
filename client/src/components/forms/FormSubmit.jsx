import { Button } from '@styles';
import DocumentViewer from './DocumentViewer';
import { useAdmin } from '@hooks/useAdmin';
import RichTextDisplay from './RichTextDisplay';
import ZoomableContent from '@components/ui/ZoomableContent';
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
  padding: .5rem;
  background: var(--background-secondary);
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
  width: 100%;
  padding: 2rem 1rem;
  margin-bottom: 2rem;
  background: var(--background-secondary);

  @media (max-width: 768px) {
    padding: 1rem 0rem;
  }
`;

const ContentDisplay = ({
  formValues,
  setIsEditing,
  reviewId,
  onRemoveDocument,
}) => {
  const { isAdmin } = useAdmin();
  const hasContent = formValues.reviewText && formValues.reviewText.trim();
  const hasDocument = formValues.hasDocument && formValues.documentFilename && reviewId;

  // Check if document is a Word document
  const isWordDocument = hasDocument && formValues.documentType &&
    (formValues.documentType.toLowerCase() === 'docx' || formValues.documentType.toLowerCase() === 'doc');

  // Determine if there's any content to display
  const hasAnyContent = hasContent || hasDocument;

  return (
    <ContentDisplayContainer className="content-display">
      {(formValues.tags || formValues.tag) &&
        (formValues.tags || formValues.tag).length > 0 && (
          <TagsContainer className="tags-container">
            {(formValues.tags || formValues.tag).map((tag, index) => (
              <Tag key={index}>
                {typeof tag === 'string' ? tag : tag.name}
              </Tag>
            ))}
          </TagsContainer>
        )}

      {hasAnyContent ? (
        <ZoomableContent>
          <ContentBody className="content-body">
            {/* Display logic: Word doc -> DocumentViewer, else -> RichTextDisplay */}
            {isWordDocument ? (
              <DocumentViewer
                className="word-document-viewer"
                documentUrl={`/api/view_document/${reviewId}`}
                documentType={formValues.documentType}
                filename={formValues.documentFilename}
                hasDocument={formValues.hasDocument}
              />
            ) : (
              hasContent && (
                <RichTextDisplay
                  content={formValues.reviewText}
                />
              )
            )}

            {/* Show PDF documents using DocumentViewer ONLY if no text content is available */}
            {hasDocument && !isWordDocument && !hasContent && formValues.documentType && formValues.documentType.toLowerCase() === 'pdf' && (
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
        <Button
          type="button"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </Button>
      )}
    </ContentDisplayContainer>
  );
};

export default ContentDisplay;
