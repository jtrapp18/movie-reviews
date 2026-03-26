import styled from 'styled-components';

const StyledCard = styled.article`
  width: 100%;
  max-width: 800px;
  gap: 12px;
  background-color: var(--background-secondary);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  img {
    width: 100%;
    height: 300px;
    max-height: 80vh;
    object-fit: cover;
    border-radius: 10px 10px 0 0;
    flex-shrink: 0;
    filter: grayscale(90%);
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    gap: 4px;
    text-align: left;
  }

  .content h2 {
    margin: 0;
    font-family: var(--title-font);
    font-weight: bold;
    text-align: left;
  }

  .content .description {
    margin: 0;
    line-height: 1.45;
    text-align: left;
  }

  /* --- compact (side rail): wide image on top, text below (backdrop-friendly) --- */
  ${({ $compact }) =>
    $compact &&
    `
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    border-radius: 8px;
    overflow: hidden;

    &:hover {
      transform: none;
      box-shadow: var(--shadow);
    }

    img {
      width: 100%;
      height: auto;
      max-height: none;
      min-height: 104px;
      aspect-ratio: 16 / 9;
      border-radius: 6px 6px 0 0;
      object-fit: cover;
    }

    .content {
      flex: 1;
      min-width: 0;
      padding: 0.55rem 0.65rem 0.65rem;
      justify-content: flex-start;
      gap: 4px;
    }

    .content h2 {
      font-size: 0.9rem;
      line-height: 1.3;
      font-weight: 600;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .content .description {
      font-size: 0.78rem;
      line-height: 1.4;
      color: var(--font-color-2);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    small {
      font-size: 0.72rem;
      opacity: 0.88;
    }
  `}
`;

const DEFAULT_POST_IMAGE_JPEG = '/images/default-article.jpeg';
const DEFAULT_POST_IMAGE_WEBP = '/images/default-article.webp';

const AUTHOR = 'James Trapp';

function extractYearFromTitle(titleText) {
  const m = /\((\d{4})\)\s*$/.exec((titleText || '').trim());
  return m ? m[1] : null;
}

/**
 * When there’s no excerpt: frame the card as James’s work.
 * Movie reviews: “…analysis of *Film* (year)…” — articles: shorter essay line.
 */
function buildDescriptionFallback({
  isMovieReview,
  displayTitle,
  movieTitle,
  releaseYear,
}) {
  const film = (movieTitle || displayTitle || 'this film').trim();
  const year =
    releaseYear || (!isMovieReview ? null : extractYearFromTitle(displayTitle));

  if (isMovieReview) {
    const yearPart = year ? ` (${year})` : '';
    return `Analysis of ${film}${yearPart} by ${AUTHOR}.`;
  }

  return `Essay by ${AUTHOR} — open to read the full piece.`;
}

function PostCard({
  photo,
  title,
  description,
  date,
  onClick,
  onMouseEnter,
  /** default = grid card; compact = side rail (wide image + text) */
  size = 'default',
  /** When true, use movie-review style fallback (title + year + author) */
  isMovieReview = false,
  /** Prefer nested movie title when present */
  movieTitle,
  /** Four-digit year from API when available */
  releaseYear,
}) {
  const compact = size === 'compact';
  const trimmed = typeof description === 'string' ? description.trim() : '';
  const body = trimmed
    ? trimmed
    : buildDescriptionFallback({
        isMovieReview,
        displayTitle: title,
        movieTitle,
        releaseYear,
      });

  return (
    <StyledCard $compact={compact} onClick={onClick} onMouseEnter={onMouseEnter}>
      {photo ? (
        <img src={photo} alt={title} />
      ) : (
        <picture>
          <source srcSet={DEFAULT_POST_IMAGE_WEBP} type="image/webp" />
          <img src={DEFAULT_POST_IMAGE_JPEG} alt={title} />
        </picture>
      )}
      <div className="content">
        <h2>{title}</h2>
        {date && <small>{date}</small>}
        <p className="description">{body}</p>
      </div>
    </StyledCard>
  );
}

export default PostCard;
