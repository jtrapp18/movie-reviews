import { useNavigate } from "react-router-dom";
import { StyledCard } from '../MiscStyling';
import styled from 'styled-components';

const TagContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.span`
  background-color: rgba(0, 123, 255, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
`;

const ArticleTitle = styled.h2`
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  color: white;
  background-color: rgba(0, 0, 0, 0.9);
  padding: 8px 10px;
  border-radius: 6px;
  z-index: 1000;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
  max-height: 50px;
  overflow: hidden;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
`;

const ArticleContent = styled.div`
  position: absolute;
  top: 50px;
  left: 10px;
  right: 10px;
  bottom: 60px;
  color: black;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ArticleDate = styled.div`
  position: absolute;
  bottom: 50px;
  left: 10px;
  right: 10px;
  color: #333;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-style: italic;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DocumentIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 4px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

function ArticleCard({ article }) {
  const navigate = useNavigate();

  // Debug logging to see what data we're receiving
  console.log('ArticleCard - article data:', article);

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'dateString:', dateString);
      return 'Invalid date';
    }
  };

  return (
    <StyledCard onClick={handleClick} style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <ArticleTitle>{article.title || 'Untitled Article'}</ArticleTitle>
      
      {article.has_document && (
        <DocumentIndicator>
          📄 {article.document_type?.toUpperCase() || 'DOC'}
        </DocumentIndicator>
      )}
      
      <ArticleContent>
        {article.review_text ? 
          (article.review_text.length > 100 ? 
            article.review_text.substring(0, 100) + '...' : 
            article.review_text
          ) : 
          'No content available'
        }
      </ArticleContent>
      
      <ArticleDate>
        {formatDate(article.date_added)}
      </ArticleDate>
      
      {article.tags && article.tags.length > 0 && (
        <TagContainer>
          {article.tags.slice(0, 3).map((tag, index) => (
            <Tag key={index}>{tag.name}</Tag>
          ))}
          {article.tags.length > 3 && (
            <Tag>+{article.tags.length - 3}</Tag>
          )}
        </TagContainer>
      )}
    </StyledCard>
  );
}

export default ArticleCard;
