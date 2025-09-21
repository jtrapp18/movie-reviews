import { Button } from '../MiscStyling'
import DocumentViewer from './DocumentViewer'
import Stars from './Stars'
import { useAdmin } from '../hooks/useAdmin'
import RichTextDisplay from './RichTextDisplay'
import ZoomableContent from './ZoomableContent'
import styled from 'styled-components'

const ContentDisplayContainer = styled.div`
  width: 100%;
`;

const ContentHeader = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
  margin-left: auto;
  margin-right: auto;

  border-bottom: 2px dotted gray;
`;

const ContentTitle = styled.h1`
  margin: 0;
  padding: 0.5rem;
`;

const ContentMeta = styled.div`
  color: #666;
  font-size: 1rem;
  margin-bottom: 20px;
`;

const PublishDate = styled.span`
  color: #666;
`;

const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tag = styled.span`
  background-color: var(--cinema-gold);
  color: var(--cinema-black);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ContentBody = styled.div`
  width: 100%;
  padding: 2rem 1rem;
  margin-bottom: 2rem;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-left: 3px solid var(--cinema-gold-dark);
`;

const ContentDisplay = ({ formValues, setIsEditing, reviewId, onRemoveDocument }) => {
  const { isAdmin } = useAdmin();
  const isReview = formValues.movieId !== null && formValues.movieId !== undefined;
  const hasRating = isReview && formValues.rating && formValues.rating > 0;
  const hasContent = formValues.reviewText && formValues.reviewText.trim();
  const hasDocument = formValues.hasDocument && formValues.documentFilename && reviewId;
  
  // Check if document is a Word document
  const isWordDocument = hasDocument && formValues.documentType && 
    (formValues.documentType.toLowerCase() === 'docx' || formValues.documentType.toLowerCase() === 'doc');

  // Determine if there's any content to display
  const hasAnyContent = hasContent || hasDocument;

  return (
    <ContentDisplayContainer className="content-display">
      <ContentHeader>
        <ContentTitle>{formValues.title}</ContentTitle>
        
        {hasRating && (
          <StarsContainer>
            <Stars rating={formValues.rating} />
          </StarsContainer>
        )}
        
        <ContentMeta>
          {(formValues.dateAdded || formValues.date_added) && (
            <PublishDate>Published on {new Date(formValues.dateAdded || formValues.date_added).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</PublishDate>
          )}
        </ContentMeta>

        {(formValues.tags || formValues.tag) && (formValues.tags || formValues.tag).length > 0 && (
          <TagsContainer className="tags-container">
            {(formValues.tags || formValues.tag).map((tag, index) => (
              <Tag key={index}>
                {typeof tag === 'string' ? tag : tag.name}
              </Tag>
            ))}
          </TagsContainer>
        )}
      </ContentHeader>
      
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