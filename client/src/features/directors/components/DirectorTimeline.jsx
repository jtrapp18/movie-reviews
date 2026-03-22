import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MovieCard from '@components/cards/MovieCard';
import { getMovieRatings } from '@helper';

const TimelineContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 28px;
    width: 2px;
    background: var(--border-subtle, rgba(0, 0, 0, 0.08));
  }

  @media (max-width: 768px) {
    &::before {
      left: 22px;
    }
  }
`;

const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 44px minmax(0, 1fr);
  }
`;

const YearColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--font-color-3);
  position: relative;
  z-index: 1;
`;

const YearDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.18);
`;

const ContentColumn = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  & > *:first-child {
    flex-shrink: 0;
  }
`;

const MovieInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  font-size: 0.95rem;
  color: var(--font-color-2);
`;

const MovieTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: var(--font-color-1);
`;

function DirectorTimeline({ movies }) {
  const [ratingsMap, setRatingsMap] = useState({});

  useEffect(() => {
    const fetchRatings = async () => {
      if (!movies || !movies.length) {
        setRatingsMap({});
        return;
      }

      const ratings = await getMovieRatings(movies);
      setRatingsMap(ratings);
    };

    fetchRatings();
  }, [movies]);

  if (!movies || !movies.length) return null;

  const sorted = [...movies].sort((a, b) => {
    const aDate = a.releaseDate || '';
    const bDate = b.releaseDate || '';
    return aDate.localeCompare(bDate);
  });

  return (
    <TimelineContainer>
      {sorted.map((movie, idx) => {
        const year = (movie.releaseDate || '').slice(0, 4) || '—';
        const overview =
          movie.overview && movie.overview.length > 180
            ? `${movie.overview.slice(0, 180)}…`
            : movie.overview || 'No synopsis available.';

        const movieData = movie.externalId
          ? ratingsMap[movie.externalId]
          : movie.id
            ? ratingsMap[movie.id]
            : undefined;
        const rating = movieData?.rating ?? null;
        const hasReview = Boolean(movieData);
        const localId = movieData?.local_id;
        const movieWithCorrectId = localId ? { ...movie, id: localId } : movie;

        return (
          <TimelineItem key={movieWithCorrectId.id || movie.externalId || idx}>
            <YearColumn>
              <YearDot />
              <span>{year}</span>
            </YearColumn>
            <ContentColumn>
              <MovieCard
                movie={movieWithCorrectId}
                rating={rating}
                hasReview={hasReview}
              />
              <MovieInfo>
                <MovieTitle>{movie.title}</MovieTitle>
                <p style={{ margin: 0 }}>{overview}</p>
              </MovieInfo>
            </ContentColumn>
          </TimelineItem>
        );
      })}
    </TimelineContainer>
  );
}

export default DirectorTimeline;
