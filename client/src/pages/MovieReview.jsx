import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer } from '@styles';
import { CoverHeader, LikeButton } from '@features/reviews';
import { useMovieReview } from '@features/reviews/useMovieReview';
import ReviewForm from '@forms/ReviewForm';
import CommentList from '@components/comments/CommentList';
import SEOHead from '@components/shared-sections/SEOHead';
import Loading from '@components/ui/Loading';
import { UserContext } from '@context/userProvider';
import { getGradingLabel } from '@utils/gradingTiers';
import {
  generateMovieReviewStructuredData,
  generateBreadcrumbStructuredData,
} from '@utils/seoUtils';

const MovieContainer = styled.div`
  margin: 1rem 0 2rem 0;
  width: 100%;
  background: var(--background-secondary);
  border-radius: 8px;
  overflow: hidden;
`;

const LikeBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

function MovieReview() {
  const { user } = useContext(UserContext);
  const { id } = useParams();
  const movieId = parseInt(id);
  const { movie, loading, error } = useMovieReview(movieId);

  if (loading) {
    return (
      <StyledContainer>
        <Loading text="Loading movie details" size="large" />
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
  const reviewBackdropUrl =
    review?.backdrop && review?.id
      ? `/api/reviews/${review.id}/backdrop/view?v=${encodeURIComponent(review.backdrop)}`
      : null;
  const coverImageUrl = reviewBackdropUrl || movie.backdrop || null;

  // Generate SEO data
  const ratingLabel = review?.rating ? getGradingLabel(review.rating) : null;
  const seoTitle = review
    ? `${movie.title} Review${ratingLabel ? ` - ${ratingLabel}` : ''}`
    : `${movie.title} - Movie Review`;
  const seoDescription = review
    ? `${movie.title} movie review: ${review.reviewText.substring(0, 150)}...`
    : `Read our detailed review of ${movie.title} (${movie.releaseDate}). ${movie.overview.substring(0, 100)}...`;

  const structuredData = generateMovieReviewStructuredData(movie, review);
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: window.location.origin + '/#/' },
    { name: 'Movies', url: window.location.origin + '/#/search_movies' },
    { name: movie.title, url: window.location.href },
  ]);

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${movie.title}, movie review, ${movie.originalLanguage}, ${movie.releaseDate}, film analysis`}
        image={coverImageUrl ?? undefined}
        url={`/#/movies/${movie.id}`}
        type="article"
        structuredData={[structuredData, breadcrumbData].filter(Boolean)}
      />
      <StyledContainer>
        <MovieContainer>
          <CoverHeader
            imageUrl={coverImageUrl}
            title={movie.title}
            subtitle={review?.title}
            rating={review?.rating}
            publishDate={review?.dateAdded || review?.date_added}
          />
          {review && (
            <LikeBar>
              <LikeButton
                type="review"
                id={review.id}
                likeCount={review.likeCount ?? 0}
                likedByMe={review.likedByMe ?? false}
                disabled={!user}
                onUpdate={(liked, likeCount) => {
                  // Optimistically update the local movie state returned by the hook
                  if (!movie?.reviews?.length) return;
                  movie.reviews[0] = {
                    ...movie.reviews[0],
                    likedByMe: liked,
                    likeCount,
                  };
                }}
              />
            </LikeBar>
          )}
          <ReviewForm initObj={review} />
        </MovieContainer>
        {review && <CommentList reviewId={review.id} />}
      </StyledContainer>
    </>
  );
}

export default MovieReview;
