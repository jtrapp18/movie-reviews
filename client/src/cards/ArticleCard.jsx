import { useNavigate } from "react-router-dom";
import { StyledCard } from '../MiscStyling';
import styled from 'styled-components';
import Tag from '../components/Tag';

const TagContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 6px;
`;

const TagSpan = styled.span`
  background-color: rgba(0, 123, 255, 0.8);
  color: white;
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 8px;
  font-weight: 500;
`;

const ArticleTitle = styled.h2`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  color: #2c3e50;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 10px 12px;
  border-radius: 8px;
  z-index: 1000;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  max-height: 60px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const ArticleContent = styled.div`
  position: absolute;
  top: 80px;
  left: 12px;
  right: 12px;
  bottom: 80px;
  color: #34495e;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.03);
`;

const ArticleDate = styled.div`
  position: absolute;
  bottom: 50px;
  left: 12px;
  right: 12px;
  color: #7f8c8d;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.02);
`;

const DocumentIndicator = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(52, 152, 219, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 600;
  z-index: 1001;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

function ArticleCard({ article }) {
  const navigate = useNavigate();

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
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    }}>
      <ArticleTitle>{article.title || 'Untitled Article'}</ArticleTitle>
      
      {article.has_document && (
        <DocumentIndicator>
          📄 {article.document_type?.toUpperCase() || 'DOC'}
        </DocumentIndicator>
      )}
      
      <ArticleContent>
        {article.description || 'No description available'}
      </ArticleContent>
      
      <ArticleDate>
        {formatDate(article.date_added)}
      </ArticleDate>
      
      {article.tags && article.tags.length > 0 && (
        <TagContainer>
          {article.tags.slice(0, 3).map((tag, index) => (
            <Tag 
              key={tag.id || index}
              backgroundColor={tag.backgroundColor || '#007bff'}
              textColor={tag.textColor || '#ffffff'}
              size="small"
            >
              {tag.name}
            </Tag>
          ))}
          {article.tags.length > 3 && (
            <Tag backgroundColor="#6c757d" textColor="#ffffff" size="small">
              +{article.tags.length - 3}
            </Tag>
          )}
        </TagContainer>
      )}
    </StyledCard>
  );
}

export default ArticleCard;
