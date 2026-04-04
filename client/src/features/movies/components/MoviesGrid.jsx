import { useState, useEffect } from 'react';
import { MovieCard } from '@features/movies';
import { getMovieRatings } from '@helper';
import { MediaCardGrid, MediaCardCell } from '@styles';

const MoviesGrid = ({ movies, onMovieClick }) => {
  const [ratingsMap, setRatingsMap] = useState({});
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!movies || movies.length === 0) {
        setLoading(false);
        return;
      }

      const ratings = await getMovieRatings(movies);
      setRatingsMap(ratings);
      setLoading(false);
    };

    fetchRatings();
  }, [movies]);

  return (
    <MediaCardGrid>
      {movies.map((movie) => {
        const movieData = ratingsMap[movie.externalId];
        const rating = movieData?.rating ?? null;
        const hasReview = Boolean(movieData);
        const localId = movieData?.local_id;

        // If we have a local ID, use it for navigation
        // Otherwise, keep the external ID for creating new movies
        const movieWithCorrectId = localId ? { ...movie, id: localId } : movie;

        return (
          <MediaCardCell key={movie.externalId || movie.id}>
            <MovieCard
              movie={movieWithCorrectId}
              rating={rating}
              hasReview={hasReview}
              fillGridCell
              onMovieClick={onMovieClick}
            />
          </MediaCardCell>
        );
      })}
    </MediaCardGrid>
  );
};

export default MoviesGrid;
