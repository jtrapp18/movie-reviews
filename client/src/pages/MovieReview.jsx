import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer } from '@styles';
import { CoverHeader, LikeButton } from '@features/reviews';
import { getJSON, snakeToCamel } from '@helper';
import ReviewForm from '@forms/ReviewForm';
import CommentList from '@components/comments/CommentList';
import SEOHead from '@components/shared-sections/SEOHead';
import Loading from '@components/ui/Loading';
import { UserContext } from '@context/userProvider';
import { generateMovieReviewStructuredData, generateBreadcrumbStructuredData } from '@utils/seoUtils';

const MovieContainer = styled.div`
  margin: 1rem 0 2rem 0;
  width: 100%;
`;

const LikeBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

function MovieReview() {
  const { user } = useContext(UserContext);
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
        <Loading text="Loading movie details" size='large' />
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
        image={movie.backdrop ?? undefined}
        url={`/#/movies/${movie.id}`}
        type="article"
        structuredData={[structuredData, breadcrumbData].filter(Boolean)}
      />
      <StyledContainer>
        <MovieContainer>
          <CoverHeader
            imageUrl={movie.backdrop ?? null}
            title={movie.title}
            subtitle={review?.title}
            rating={review?.rating}
            publishDate={review?.dateAdded || review?.date_added}
          />
        </MovieContainer>
        {review && (
          <LikeBar>
            <LikeButton
              type="review"
              id={review.id}
              likeCount={review.likeCount ?? 0}
              likedByMe={review.likedByMe ?? false}
              disabled={!user}
              onUpdate={(liked, likeCount) => {
                setMovie((prev) => {
                  if (!prev?.reviews?.length) return prev;
                  const next = { ...prev, reviews: [...prev.reviews] };
                  next.reviews[0] = { ...next.reviews[0], likedByMe: liked, likeCount };
                  return next;
                });
              }}
            />
          </LikeBar>
        )}
        <ReviewForm initObj={review} />
        {review && <CommentList reviewId={review.id} />}
      </StyledContainer>
    </>
  );
}

export default MovieReview;