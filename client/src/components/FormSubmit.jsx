import { StyledSubmit, Button } from '../MiscStyling'
import DocumentViewer from './DocumentViewer'
import Stars from './Stars'
import { useAdmin } from '../hooks/useAdmin'
import RichTextDisplay from './RichTextDisplay'
import styled from 'styled-components'

const ContentHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
`;

const ContentTitle = styled.h1`
  margin: 0 0 10px 0;
  color: var(--cinema-gold);
  font-size: 2rem;
`;

const ContentMeta = styled.div`
  color: #666;
  font-size: 1rem;
  margin-bottom: 20px;
`;

const PublishDate = styled.span`
  color: #666;
`;

const Rating = styled.span`
  color: var(--cinema-gold);
  font-weight: bold;
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

const ContentDisplay = ({ formValues, setIsEditing, reviewId, onRemoveDocument }) => {
  const { isAdmin } = useAdmin();
  const isReview = formValues.contentType === 'review';
  const hasRating = isReview && formValues.rating && formValues.rating > 0;
  const hasContent = formValues.reviewText && formValues.reviewText.trim();
  const hasDocument = formValues.hasDocument && formValues.documentFilename && reviewId;
  
  // Check if document is a Word document
  const isWordDocument = hasDocument && formValues.documentType && 
    (formValues.documentType.toLowerCase() === 'docx' || formValues.documentType.toLowerCase() === 'doc');

  return (
    <StyledSubmit>
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
      <div className="content-body">
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

      </div>

      {isAdmin && (
        <Button 
          type="button" 
          onClick={() => setIsEditing(true)}
        >
          Edit
        </Button>
      )}
    </StyledSubmit>
  );
};

export default ContentDisplay;