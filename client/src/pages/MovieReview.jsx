import { useContext } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer } from '@styles';
import { CoverHeader, LikeButton } from '@features/reviews';
import { useMovieReview } from '@features/reviews/useMovieReview';
import { Movies } from '@features/movies';
import ReviewForm from '@forms/ReviewForm';
import CommentList from '@components/comments/CommentList';
import DirectorCard from '@components/cards/DirectorCard';
import SEOHead from '@components/shared-sections/SEOHead';
import { UserContext } from '@context/userProvider';
import { getGradingLabel } from '@utils/gradingTiers';
import {
  generateMovieReviewStructuredData,
  generateBreadcrumbStructuredData,
} from '@utils/seoUtils';
import EntityDetailState from '@components/layout/EntityDetailState';
import {
  DetailContentCard,
  LikeBar,
  RelatedSection,
  RelatedHeading,
} from '@components/layout/detailPageStyles';

const SuggestionsLayout = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const DirectorTeaserColumn = styled.div`
  flex: 0 0 260px;
  max-width: 260px;

  @media (max-width: 768px) {
    flex: 0 0 auto;
    max-width: 100%;
  }
`;

const SuggestionsDivider = styled.div`
  width: 1px;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.16);

  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
  }
`;

const DirectorMoviesColumn = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
`;

const DirectorMoviesTitle = styled.p`
  margin: 0;
  font-style: italic;
  color: var(--font-color-2);
`;

const DirectorMoviesCarouselWrap = styled.div`
  width: 100%;
`;

function MovieReview() {
  const { user } = useContext(UserContext);
  const { movies = [], directors = [] } = useOutletContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const movieId = parseInt(id);
  const { movie, loading, error } = useMovieReview(movieId);

  return (
    <EntityDetailState
      loading={loading}
      loadingText="Loading movie details"
      error={error}
      missing={!movie}
      missingMessage="Movie not found"
    >
      {movie && (
        <MovieReviewBody
          movie={movie}
          movies={movies}
          directors={directors}
          user={user}
          navigate={navigate}
        />
      )}
    </EntityDetailState>
  );
}

function MovieReviewBody({ movie, movies, directors, user, navigate }) {
  const review = movie.reviews.length === 0 ? null : movie.reviews[0];
  const reviewBackdropUrl =
    review?.backdrop && review?.id
      ? `/api/reviews/${review.id}/backdrop/view?v=${encodeURIComponent(review.backdrop)}`
      : null;
  const coverImageUrl = reviewBackdropUrl || movie.backdrop || null;
  const releaseYear = (movie.releaseDate || '').slice(0, 4);
  const movieTitleLine = releaseYear ? `${movie.title} (${releaseYear})` : movie.title;
  const directorName =
    (typeof movie.director === 'object' ? movie.director?.name : movie.director) ||
    null;
  const directorId =
    typeof movie.director === 'object' && movie.director?.id ? movie.director.id : null;
  const directorLine = directorName ? `Directed by ${directorName}` : null;
  const resolvedDirector = (() => {
    if (directorId) {
      const byId = directors.find((d) => d.id === directorId);
      if (byId) return byId;
    }
    if (movie?.director && typeof movie.director === 'object') {
      return movie.director;
    }
    return null;
  })();
  const relatedMoviesByDirector = (() => {
    if (!directorId || !Array.isArray(movies)) return [];
    return movies.filter((m) => {
      if (!m || m.id === movie.id) return false;
      const matchesDirector =
        m.directorId === directorId || m.director?.id === directorId;
      const hasReview = Array.isArray(m.reviews) && m.reviews.length > 0;
      return matchesDirector && hasReview;
    });
  })();

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
        <DetailContentCard>
          <CoverHeader
            imageUrl={coverImageUrl}
            pretitle="A James Trapp Movie Review"
            title={movieTitleLine}
            subtitle={directorLine}
            subtitleAsTitle
            subtitleLink={directorId ? `/directors/${directorId}` : null}
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
        </DetailContentCard>
        {review && <CommentList reviewId={review.id} />}
        {(resolvedDirector || relatedMoviesByDirector.length > 0) && (
          <RelatedSection>
            <RelatedHeading>
              {directorName ? `More from ${directorName}` : 'Suggested Next'}
            </RelatedHeading>
            <SuggestionsLayout>
              {resolvedDirector && resolvedDirector.id && (
                <DirectorTeaserColumn>
                  <DirectorCard
                    director={resolvedDirector}
                    onClick={() => navigate(`/directors/${resolvedDirector.id}`)}
                  />
                </DirectorTeaserColumn>
              )}

              {resolvedDirector &&
                resolvedDirector.id &&
                relatedMoviesByDirector.length > 0 && <SuggestionsDivider />}

              {relatedMoviesByDirector.length > 0 && (
                <DirectorMoviesColumn>
                  <DirectorMoviesTitle>James Trapp Movie Reviews</DirectorMoviesTitle>
                  <DirectorMoviesCarouselWrap>
                    <Movies showMovies={relatedMoviesByDirector} cardSize="small" />
                  </DirectorMoviesCarouselWrap>
                </DirectorMoviesColumn>
              )}
            </SuggestionsLayout>
          </RelatedSection>
        )}
      </StyledContainer>
    </>
  );
}

export default MovieReview;
