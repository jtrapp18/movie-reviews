import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Tag from '../components/Tag';

const ArticleCardContainer = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  width: 200px;
  height: 280px;
  background: linear-gradient(145deg, var(--cinema-bg-darker, rgba(10, 10, 10, 0.95)) 0%, var(--cinema-bg-lighter, rgba(30, 30, 30, 0.9)) 100%);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, var(--cinema-gold) 0%, var(--cinema-gold-dark) 100%);
    transition: height 0.3s ease;
  }

  &:hover {
    box-shadow: 
      0 16px 40px rgba(0, 0, 0, 0.9),
      0 8px 24px rgba(0, 0, 0, 0.7),
      0 0 0 2px rgba(255, 255, 255, 0.1);
    background: linear-gradient(145deg, var(--cinema-bg-hover-darker, rgba(12, 12, 12, 0.98)) 0%, var(--cinema-bg-hover-lighter, rgba(32, 32, 32, 0.95)) 100%);
    border-color: transparent;

    &::before {
      height: 6px;
    }
  }
`;

const ArticleTitle = styled.h2`
  height: 85%;
  color: var(--cinema-text-light, #f0f0f0);
  line-height: 1.3;
  font-size: clamp(1.2rem, 2.3vw, 1.7rem);
  font-weight: bold;
  border-bottom: 3px double var(--cinema-gold);
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;

  ${ArticleCardContainer}:hover & {
    opacity: 0;
  }
`;

const ArticleDate = styled.div`
  position: absolute;
  top: 1%;
  right: 1%;
  color: var(--cinema-gold);
  font-size: 9px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const TagContainer = styled.div`
  height: 15%;
  display: flex;
  flex-wrap: nowrap;
  gap: 3px;
  align-items: flex-end;
  padding: 4px 6px 4px 4px;
  border-radius: 4px;
  overflow: hidden;
  transition: opacity 0.3s ease;

  ${ArticleCardContainer}:hover & {
    opacity: 0;
  }
`;

const ArticleOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 6px;

  ${ArticleCardContainer}:hover & {
    opacity: 1;
  }

  p {
    font-size: clamp(0.8rem, 2vw, 0.9rem);
    line-height: 1.5;
    padding: 1px;
    margin: 0;
    
    @media (max-width: 768px) {
      padding: 4px 8px;
    }
  }
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

      <ArticleOverlay>
        <p>{article.description || 'No description available'}</p>
      </ArticleOverlay>

    </ArticleCardContainer>
  );
}

export default ArticleCard;
