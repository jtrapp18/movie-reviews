import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Tag from '../components/Tag';

const ArticleCardContainer = styled.article`
  position: relative;
  width: 200px;
  height: 280px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;

const ArticleTitle = styled.h2`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  color: var(--cinema-black);
  background: none;
  padding: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  z-index: 1000;
`;

const ArticleContent = styled.div`
  position: absolute;
  top: 60px;
  left: 12px;
  right: 12px;
  bottom: 60px;
  color: var(--cinema-black);
  font-size: 11px;
  line-height: 1.4;
  overflow: hidden;
`;

const ArticleDate = styled.div`
  position: absolute;
  bottom: 30px;
  left: 12px;
  right: 12px;
  color: var(--cinema-black);
  font-size: 9px;
  font-weight: 500;
  text-align: center;
`;

const TagContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
`;


const DocumentIndicator = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  color: var(--cinema-black);
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 600;
  z-index: 1001;
`;

function ArticleCard({ article }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  const formatDate = (dateString) => {
    console.log('Article date field:', dateString, 'Type:', typeof dateString);
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
    <ArticleCardContainer onClick={handleClick}>
      <ArticleTitle>
        {article.title || 'Untitled Article'}
      </ArticleTitle>
      
      <ArticleContent>
        {article.description || 'No description available'}
      </ArticleContent>
      
      <ArticleDate>
        {formatDate(article.dateAdded)}
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
    </ArticleCardContainer>
  );
}

export default ArticleCard;
