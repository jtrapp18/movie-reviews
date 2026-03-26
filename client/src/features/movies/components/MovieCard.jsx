import { useNavigate, useOutletContext } from 'react-router-dom';
import { MediaCard, CardContent, CardOverlay, CardDate } from '@styles/cards';
import { useAdmin } from '@hooks/useAdmin';
import useCrudStateDB from '@hooks/useCrudStateDB';
import { RatingOverlay } from '@features/reviews';
import { prefetchEntity } from '@features/cache/prefetchEntity';
import styled from 'styled-components';

const MetadataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardPrimaryLine = styled.div`
  font-size: clamp(0.66rem, 1.65vw, 0.74rem);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--card-font);
  opacity: 0.78;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
  text-align: center;
  width: 100%;

  ${({ $isTitle }) =>
    $isTitle
      ? `
    letter-spacing: 0.06em;
    opacity: 0.86;
  `
      : ''}
`;

function MovieCard({
  movie,
  rating = null,
  hasReview = false,
  clickable = true,
  size = 'default',
}) {
  const { originalLanguage, originalTitle, overview, title, releaseDate, coverPhoto } =
    movie;
  const directorName =
    typeof movie?.director === 'object' ? movie.director?.name : movie?.director;
  const year = releaseDate ? String(releaseDate).slice(0, 4) : '';
  const titleWithYear = year ? `${title} (${year})` : title;

  const navigate = useNavigate();
  const { setMovies } = useOutletContext();
  const { isAdmin } = useAdmin();
  const { addItem } = useCrudStateDB(setMovies, 'movies');

  const handleClick = async () => {
    if (hasReview) {
      navigate(`/movies/${movie.id}`);
      return;
    }

    if (!isAdmin) {
      alert(`No reviews available for "${title}".`);
      return;
    }

    const confirmed = window.confirm(`Do you want to add a review for "${title}"?`);
    if (confirmed) {
      const newId = await addItem({ ...movie });
      navigate(`/movies/${newId}`);
    }
  };

  const cardStyle = size === 'small' ? { zoom: 0.7 } : undefined;

  return (
    <MediaCard
      onClick={clickable ? handleClick : undefined}
      onMouseEnter={() => {
        if (movie?.id != null) {
          prefetchEntity('movieReview', 'movies', movie.id);
        }
      }}
      style={cardStyle}
    >
      <img src={coverPhoto} alt={`${title} poster`} />

      {directorName ? <CardDate>{directorName}</CardDate> : null}

      <CardContent>
        {/* Title intentionally hidden for this card style */}
        <CardPrimaryLine $isTitle>{titleWithYear}</CardPrimaryLine>
        {rating ? <RatingOverlay rating={rating} /> : null}
      </CardContent>

      <CardOverlay>
        <MetadataContainer>
          <p>
            <b>Original Title:</b> {originalTitle}
          </p>
          <p>
            <b>Original Language:</b> {originalLanguage}
          </p>
        </MetadataContainer>
        <p>{overview || 'No overview available'}</p>
      </CardOverlay>
    </MediaCard>
  );
}

export default MovieCard;
