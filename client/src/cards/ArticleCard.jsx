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
  background: linear-gradient(135deg, var(--cinema-gold-ultra-light) 0%, #ffffff 60%, #f8f9fa 100%);
  border-left: 4px solid var(--cinema-gold-dark);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    zoom: 1.03;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    background: #f8f9fa;
  }
`;

const ArticleTitle = styled.h2`
  height: 60%;
  color: var(--cinema-black);
  line-height: 1.3;
  font-size: clamp(1rem, 2.8vw, 1.5rem);
  font-weight: bold;
  border-bottom: 3px double var(--cinema-gold-dark);
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
`;

const ArticleContent = styled.div`
  height: 30%;
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
  color: var(--cinema-gold-dark);
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
  flex-wrap: nowrap;
  gap: 3px;
  align-items: flex-end;
  padding: 4px 6px 4px 4px;
  border-radius: 4px;
  overflow: hidden;
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
      
      <TagContainer>
        {article.tags && article.tags.length > 0 ? (
          <>
            {article.tags.slice(0, 3).map((tag, index) => (
              <Tag 
                key={tag.id || index}
                backgroundColor={tag.backgroundColor || '#6c757d'}
                textColor={tag.textColor || '#ffffff'}
                size="small"
              >
                {tag.name}
              </Tag>
            ))}
            {article.tags.length > 3 && (
              <Tag backgroundColor="#495057" textColor="#ffffff" size="small">
                +{article.tags.length - 3}
              </Tag>
            )}
          </>
        ) : null}
      </TagContainer>

    </ArticleCardContainer>
  );
}

export default ArticleCard;
