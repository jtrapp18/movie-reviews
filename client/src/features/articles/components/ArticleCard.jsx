import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  MediaCard,
  CardContent,
  CardOverlay,
  Tag,
  TagContainer,
  CardDate,
  CardTitle,
} from '@styles/cards';
import { formatDate } from '@utils/formatting';

const LikeCount = styled.span`
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--card-font);
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(0, 0, 0, 0.65);
  padding: 3px 6px;
  border-radius: 4px;
`;

const backdrop = '/images/card-backdrop.jpeg';

function ArticleCard({ article, fillGridCell = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <MediaCard $fillGridCell={fillGridCell} onClick={handleClick}>
      <img src={backdrop} alt="article backdrop" />

      <CardDate>{formatDate(article.dateAdded)}</CardDate>
      {(article.likeCount ?? 0) > 0 && (
        <LikeCount aria-label={`${article.likeCount} likes`}>
          ♡ {article.likeCount}
        </LikeCount>
      )}

      <CardContent>
        <CardTitle>{article.title || 'Untitled Article'}</CardTitle>
        <TagContainer>
          {article.tags.length > 0 && (
            <>
              {article.tags.slice(0, 3).map((tag, index) => (
                <Tag key={tag.id || index}>{tag.name}</Tag>
              ))}
              {article.tags.length > 3 && <Tag>+{article.tags.length - 3}</Tag>}
            </>
          )}
        </TagContainer>
      </CardContent>
      <CardOverlay>
        <p>{article.description || 'No description available'}</p>
      </CardOverlay>
    </MediaCard>
  );
}

export default ArticleCard;
