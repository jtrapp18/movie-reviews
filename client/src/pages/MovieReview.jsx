import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import { getJSON } from '../helper';
import ReviewForm from '../forms/ReviewForm';

const MovieContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
`;

function MovieReview() {
  const [movie, setMovie] = useState(null);
  const { id } = useParams();
  const movieId = parseInt(id);

  useEffect(() => {
    const fetchMovie = async () => {
      const movie = await getJSON('movies', movieId);
      setMovie(movie);
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