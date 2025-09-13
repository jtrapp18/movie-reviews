import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import { getJSON, snakeToCamel } from '../helper';
import ReviewForm from '../forms/ReviewForm';

const MovieContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  border: 1px solid var(--cinema-gold);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
`;

function MovieReview() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const movieId = parseInt(id);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const movieData = await getJSON('movies', movieId);
        setMovie(snakeToCamel(movieData));
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  if (loading) {
    return (
      <StyledContainer>
        <h1>Loading movie details...</h1>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <h1>Error: {error}</h1>
      </StyledContainer>
    );
  }

  if (!movie) {
    return (
      <StyledContainer>
        <h1>Movie not found</h1>
      </StyledContainer>
    );
  }

  const review = movie.reviews.length === 0 ? null : movie.reviews[0];

  return (
    <StyledContainer>
      <MovieContainer>
        <MovieCard movie={movie} />
      </MovieContainer>
      
      <ReviewForm initObj={review} />
    </StyledContainer>
  );
}

export default MovieReview;