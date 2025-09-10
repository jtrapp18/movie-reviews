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

  zoom: 0.5;

  &:hover {
    zoom: 1;
  }
`;

function MovieReview() {
  const [movie, setMovie] = useState(null);
  const { id } = useParams();
  const movieId = parseInt(id);

  useEffect(() => {
    const fetchMovie = async () => {
      const movie = await getJSON('movies', movieId);
      setMovie(snakeToCamel(movie));
    };
    
    fetchMovie();
  }, [movieId]);

  if (!movie) {
    return (
      <StyledContainer>
        <h1>Loading...</h1>
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