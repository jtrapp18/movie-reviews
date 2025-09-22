import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer } from '../styles';
import MovieCard from '../cards/MovieCard';
import { getJSON, snakeToCamel } from '../helper';
import ReviewForm from '../forms/ReviewForm';
import SEOHead from '../components/SEOHead';
import Loading from '../components/ui/Loading';
import { generateMovieReviewStructuredData, generateBreadcrumbStructuredData } from '../utils/seoUtils';

const MovieContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
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

  @media (max-width: 768px) {
    padding: 0;
    background-color: transparent;
    border: none;
    box-shadow: none;
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
        <Loading text="Loading movie details" compact={true} />
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

  // Generate SEO data
  const seoTitle = review ? `${movie.title} Review - ${review.rating}/10` : `${movie.title} - Movie Review`;
  const seoDescription = review 
    ? `${movie.title} movie review: ${review.reviewText.substring(0, 150)}...` 
    : `Read our detailed review of ${movie.title} (${movie.releaseDate}). ${movie.overview.substring(0, 100)}...`;
  
  const structuredData = generateMovieReviewStructuredData(movie, review);
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: window.location.origin + '/#/' },
    { name: 'Movies', url: window.location.origin + '/#/search_movies' },
    { name: movie.title, url: window.location.href }
  ]);

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${movie.title}, movie review, ${movie.originalLanguage}, ${movie.releaseDate}, film analysis`}
        image={movie.coverPhoto}
        url={`/#/movies/${movie.id}`}
        type="article"
        structuredData={[structuredData, breadcrumbData].filter(Boolean)}
      />
      <StyledContainer>
        <MovieContainer>
          <MovieCard movie={movie} clickable={false} />
        </MovieContainer>
        
        <ReviewForm initObj={review} />
      </StyledContainer>
    </>
  );
}

export default MovieReview;