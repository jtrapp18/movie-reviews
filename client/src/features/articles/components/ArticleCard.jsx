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
  font-size: 0.8rem;
  color: var(--font-color-2);
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
`;

const backdrop = '/images/card-backdrop.jpeg';

function ArticleCard({ article }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <MediaCard onClick={handleClick}>
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
