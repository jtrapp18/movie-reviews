import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Tag from '../components/Tag';

const ArticleCardContainer = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 5%;
  width: 200px;
  height: 280px;
  background: white;
  border: px solid #e9ecef;
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
  height: 50%;
  color: var(--cinema-black);
  // background: var(--cinema-gold-dark);
  line-height: 1.3;
  font-size: clamp(1rem, 2.8vw, 1.5rem);
  font-weight: bold;
  border-bottom: 3px double black;
  margin-bottom: 8px;
  // text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
`;

const ArticleContent = styled.div`
  height: 23%;
  color: var(--cinema-black);
  font-size: clamp(0.7rem, 2vw, 0.9rem);
  line-height: 1.4;
  overflow: hidden;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-end;
`;

const ArticleDate = styled.div`
  position: absolute;
  top: 1%;
  right: 1%;
  color: var(--cinema-gray);
  font-size: 9px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const TagContainer = styled.div`
  height: 10%;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-end;
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

      <ArticleDate>
        {formatDate(article.dateAdded)}
      </ArticleDate>  
      
      <ArticleTitle>
        {article.title || 'Untitled Article'}
      </ArticleTitle>
      
      <ArticleContent>
        {article.description || 'No description available'}
      </ArticleContent>
      
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
