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

/**
 * Anchored band from mid-card to bottom so we can pin the title’s last line
 * to a fixed row above the tag strip (extra title lines grow upward; may clip at top).
 */
const ArticleCardContent = styled(CardContent)`
  z-index: 3;
  top: 34%;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  box-sizing: border-box;
`;

const ArticleTitleArea = styled.div`
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  overflow: hidden;
`;

const ArticleTagStrip = styled(TagContainer)`
  flex-shrink: 0;
  min-height: 2.25rem;
  padding-bottom: 4px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const ArticleCardOverlay = styled(CardOverlay)`
  z-index: 4;
`;

const ArticleTag = styled(Tag)`
  background: rgba(0, 0, 0, 0.65);
  color: var(--card-font);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 500;
`;

const ArticleCardDate = styled(CardDate)`
  z-index: 3;
`;

const LikeCount = styled.span`
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 3;
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

  const tags = article.tags ?? [];

  return (
    <MediaCard $fillGridCell={fillGridCell} onClick={handleClick}>
      <img src={backdrop} alt="article backdrop" />

      <ArticleCardDate>{formatDate(article.dateAdded)}</ArticleCardDate>
      {(article.likeCount ?? 0) > 0 && (
        <LikeCount aria-label={`${article.likeCount} likes`}>
          ♡ {article.likeCount}
        </LikeCount>
      )}

      <ArticleCardContent>
        <ArticleTitleArea>
          <CardTitle>{article.title || 'Untitled Article'}</CardTitle>
        </ArticleTitleArea>
        <ArticleTagStrip>
          {tags.length > 0 ? (
            <>
              {tags.slice(0, 3).map((tag, index) => (
                <ArticleTag key={tag.id || index}>{tag.name}</ArticleTag>
              ))}
              {tags.length > 3 && <ArticleTag>+{tags.length - 3}</ArticleTag>}
            </>
          ) : null}
        </ArticleTagStrip>
      </ArticleCardContent>
      <ArticleCardOverlay>
        <p>{article.description || 'No description available'}</p>
      </ArticleCardOverlay>
    </MediaCard>
  );
}

export default ArticleCard;
