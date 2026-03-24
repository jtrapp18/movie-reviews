import { useState, useEffect } from 'react';
import { CardContainer } from '@styles';
import MovieCard from '@components/cards/MovieCard';
import MotionWrapper from '@styles/MotionWrapper';
import Carousel from '@components/shared-sections/Carousel';
import Loading from '@components/ui/Loading';
import { getMovieRatings } from '@helper';

function Movies({ showMovies, cardSize = 'default' }) {
  const [ratingsMap, setRatingsMap] = useState({});

  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = await getMovieRatings(showMovies);
      setRatingsMap(ratings);
    };
    fetchRatings();
  }, [showMovies]);

  // Handle null or undefined showMovies
  if (!showMovies || !Array.isArray(showMovies)) {
    return (
      <CardContainer>
        <Loading text="Loading movies" compact={true} />
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <Carousel noResultsMessage="No movies found">
        {showMovies.map((movie, index) => {
          const movieData = movie.externalId
            ? ratingsMap[movie.externalId]
            : ratingsMap[movie.id];
          const rating = movieData?.rating ?? null;
          const hasReview = Boolean(movieData);
          const localId = movieData?.local_id;
          const movieWithCorrectId = localId ? { ...movie, id: localId } : movie;

          return (
            <MotionWrapper key={movie.title} index={index}>
              <div
                style={{
                  margin: '0',
                  width: cardSize === 'small' ? '150px' : '200px',
                  height: '100%',
                  flexShrink: 0,
                }}
              >
                <MovieCard
                  movie={movieWithCorrectId}
                  rating={rating}
                  hasReview={hasReview}
                  size={cardSize}
                />
              </div>
            </MotionWrapper>
          );
        })}
      </Carousel>
    </CardContainer>
  );
}

export default Movies;
