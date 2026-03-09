import styled from 'styled-components';
import MovieCard from '../cards/MovieCard';

const TimelineContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: auto 200px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 24px minmax(0, 1fr);
    grid-template-rows: auto auto;
    row-gap: 8px;
  }
`;

const YearColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: var(--font-color-3);
`;

const YearDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cinema-gold);
`;

const YearLine = styled.div`
  flex: 1;
  width: 2px;
  background: var(--border-subtle, rgba(255, 255, 255, 0.06));
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

        return (
          <TimelineItem key={movie.id || movie.externalId || idx}>
            <YearColumn>
              <YearDot />
              <span>{year}</span>
              <YearLine />
            </YearColumn>
            <MovieCard movie={movie} />
            <MovieInfo>
              <MovieTitle>{movie.title}</MovieTitle>
              <p style={{ margin: 0 }}>{overview}</p>
            </MovieInfo>
          </TimelineItem>
        );
      })}
    </TimelineContainer>
  );
}

export default DirectorTimeline;

