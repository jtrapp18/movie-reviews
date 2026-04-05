import { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer, StyledForm } from '@styles';
import { CoverHeader, LikeButton } from '@features/reviews';
import { useMovieReview } from '@features/reviews/useMovieReview';
import { Movies } from '@features/movies';
import { ReviewForm } from '@features/reviews';
import { CommentList } from '@features/comments';
import { DirectorCard } from '@features/directors';
import MovieTmdbInspector from '@components/forms/MovieTmdbInspector';
import SEOHead from '@components/sections/SEOHead';
import { UserContext } from '@context/userProvider';
import {
  buildMovieReviewDetailPageStructuredData,
  buildMovieReviewDetailSeoCopy,
} from '@utils/seoUtils';
import EntityDetailState from '@components/layout/EntityDetailState';
import { resolveMovieReviewCoverUrl } from '@utils/movieReviewBackdrop';
import {
  DetailContentCard,
  DetailBelowFold,
  LikeBar,
  RelatedSection,
  RelatedHeading,
} from '@components/layout/detailPageStyles';
import { useAdmin } from '@hooks/useAdmin';

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

/** Live hero preview while editing — hidden in read view; cleared on save/cancel so hero matches saved choice. */
const CoverPreviewRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: -0.25rem 0 0.75rem;
  padding: 0 0.25rem;
`;

const CoverPreviewLabel = styled.span`
  font-size: 0.85rem;
  color: var(--font-color-2);
`;

const CoverPreviewBtn = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: 0.85rem;
  background: var(--background-secondary);
  color: var(--font-color);
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
`;

const MovieMetaEditor = styled.section`
  margin: 0.5rem 0 1rem;
  padding: 0.9rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--background-secondary);
`;

const MovieMetaEditorFields = styled(StyledForm).attrs({ as: 'div' })`
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
`;

const MetaEditorRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const MetaEditorField = styled.div`
  min-width: 200px;
`;

const MetaEditorActions = styled.div`
  display: flex;
  gap: 0.55rem;
  margin-top: 0.65rem;
`;

const MetaEditorBtn = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--font-color);
  cursor: pointer;
`;

const MetaEditorStatus = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.86rem;
  color: ${({ $error }) => ($error ? '#ff8a8a' : 'var(--font-color-2)')};
`;

function MovieReview() {
  const { user } = useContext(UserContext);
  const { isAdmin } = useAdmin();
  const { movies = [], directors = [] } = useOutletContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const movieId = parseInt(id);
  const { movie, loading, error, setMovie } = useMovieReview(movieId);

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
          isAdmin={isAdmin}
          setMovie={setMovie}
          navigate={navigate}
        />
      )}
    </EntityDetailState>
  );
}

function MovieReviewBody({
  movie,
  movies,
  directors,
  user,
  isAdmin,
  setMovie,
  navigate,
}) {
  const review = movie.reviews.length === 0 ? null : movie.reviews[0];
  const reviewId = review?.id ?? null;
  const prefersReviewSaved = review?.showReviewBackdrop !== false;
  const [isEditingMovieMeta, setIsEditingMovieMeta] = useState(false);
  const [metaReleaseDate, setMetaReleaseDate] = useState(movie.releaseDate || '');
  const [metaOverview, setMetaOverview] = useState(movie.overview || '');
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaError, setMetaError] = useState('');
  const [metaMessage, setMetaMessage] = useState('');

  /** Mirrors ReviewForm isEditing — hero preview only while true. */
  const [reviewFormEditing, setReviewFormEditing] = useState(() => !review);

  /**
   * Single source of truth for which backdrop is preferred (review vs movie).
   * Shared by the hero Cover preview and the form; drives PATCH `show_review_backdrop`.
   */
  const [backdropPreference, setBackdropPreference] = useState(
    () => review?.showReviewBackdrop !== false
  );

  /** When not editing, always follow the saved review (e.g. after save/cancel or movie change). */
  useEffect(() => {
    if (!reviewFormEditing) {
      setBackdropPreference(prefersReviewSaved);
    }
  }, [reviewFormEditing, prefersReviewSaved, reviewId]);

  useEffect(() => {
    setMetaReleaseDate(movie.releaseDate || '');
    setMetaOverview(movie.overview || '');
  }, [movie.releaseDate, movie.overview]);

  /** When entering edit mode, reset the working preference from the saved review. */
  const prevReviewFormEditingRef = useRef(reviewFormEditing);
  useEffect(() => {
    const enteredEdit = !prevReviewFormEditingRef.current && reviewFormEditing;
    prevReviewFormEditingRef.current = reviewFormEditing;
    if (enteredEdit && reviewId != null) {
      setBackdropPreference(prefersReviewSaved);
    }
  }, [reviewFormEditing, reviewId, prefersReviewSaved]);

  const reviewBackdropUrl =
    review?.backdrop && review?.id
      ? `/api/reviews/${review.id}/backdrop/view?v=${encodeURIComponent(review.backdrop)}`
      : null;
  const hasBothBackdrops = Boolean(reviewBackdropUrl && movie?.backdrop);

  const coverImageUrl = resolveMovieReviewCoverUrl({
    review,
    movie,
    preferReview: reviewFormEditing ? backdropPreference : undefined,
  });

  const seoCoverImage = resolveMovieReviewCoverUrl({ review, movie });
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

  const seo = buildMovieReviewDetailSeoCopy(movie, review);
  const structuredData = buildMovieReviewDetailPageStructuredData(movie, review);

  const saveMovieMeta = async () => {
    const trimmedOverview = (metaOverview || '').trim();
    if (!metaReleaseDate) {
      setMetaError('Release date is required.');
      return;
    }
    if (!trimmedOverview) {
      setMetaError('Overview is required.');
      return;
    }

    setMetaSaving(true);
    setMetaError('');
    setMetaMessage('');
    try {
      const res = await fetch(`/api/movies/${movie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          release_date: metaReleaseDate,
          overview: trimmedOverview,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update movie details (status ${res.status}).`);
      }
      const updated = await res.json();
      const updatedMovie = {
        ...movie,
        releaseDate: updated.release_date ?? metaReleaseDate,
        overview: updated.overview ?? trimmedOverview,
      };
      setMovie(updatedMovie);
      setMetaMessage('Movie details updated.');
      setIsEditingMovieMeta(false);
    } catch (e) {
      setMetaError(e.message || 'Failed to update movie details.');
    } finally {
      setMetaSaving(false);
    }
  };

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        image={seoCoverImage ?? undefined}
        url={seo.canonicalPath}
        type="article"
        structuredData={structuredData}
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
          {review && hasBothBackdrops && reviewFormEditing && (
            <CoverPreviewRow>
              <CoverPreviewLabel>Cover preview</CoverPreviewLabel>
              <CoverPreviewBtn
                type="button"
                $active={backdropPreference}
                onClick={() => setBackdropPreference(true)}
              >
                Review
              </CoverPreviewBtn>
              <CoverPreviewBtn
                type="button"
                $active={!backdropPreference}
                onClick={() => setBackdropPreference(false)}
              >
                Movie
              </CoverPreviewBtn>
            </CoverPreviewRow>
          )}
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
          {isAdmin && reviewFormEditing && <MovieTmdbInspector movieId={movie?.id} />}
          {isAdmin && reviewFormEditing && (
            <MovieMetaEditor>
              <MetaEditorRow>
                <MetaEditorBtn
                  type="button"
                  onClick={() => {
                    setMetaError('');
                    setMetaMessage('');
                    setIsEditingMovieMeta((prev) => !prev);
                  }}
                >
                  {isEditingMovieMeta
                    ? 'Close Movie Details Editor'
                    : 'Edit Movie Details'}
                </MetaEditorBtn>
              </MetaEditorRow>

              {isEditingMovieMeta && (
                <MovieMetaEditorFields>
                  <MetaEditorField>
                    <label htmlFor="movie-meta-release-date">Release Date</label>
                    <input
                      id="movie-meta-release-date"
                      type="date"
                      value={metaReleaseDate}
                      onChange={(e) => setMetaReleaseDate(e.target.value)}
                    />
                  </MetaEditorField>
                  <MetaEditorField style={{ marginTop: '0.7rem' }}>
                    <label htmlFor="movie-meta-overview">Overview</label>
                    <textarea
                      id="movie-meta-overview"
                      value={metaOverview}
                      onChange={(e) => setMetaOverview(e.target.value)}
                    />
                  </MetaEditorField>
                  <MetaEditorActions>
                    <MetaEditorBtn
                      type="button"
                      onClick={saveMovieMeta}
                      disabled={metaSaving}
                    >
                      {metaSaving ? 'Saving...' : 'Save'}
                    </MetaEditorBtn>
                    <MetaEditorBtn
                      type="button"
                      onClick={() => {
                        setMetaReleaseDate(movie.releaseDate || '');
                        setMetaOverview(movie.overview || '');
                        setMetaError('');
                        setMetaMessage('');
                        setIsEditingMovieMeta(false);
                      }}
                      disabled={metaSaving}
                    >
                      Cancel
                    </MetaEditorBtn>
                  </MetaEditorActions>
                </MovieMetaEditorFields>
              )}

              {metaError && <MetaEditorStatus $error>{metaError}</MetaEditorStatus>}
              {!metaError && metaMessage && (
                <MetaEditorStatus>{metaMessage}</MetaEditorStatus>
              )}
            </MovieMetaEditor>
          )}
          <ReviewForm
            initObj={review}
            movie={movie}
            onEditingChange={setReviewFormEditing}
            backdropPreference={backdropPreference}
            onBackdropPreferenceChange={setBackdropPreference}
          />
        </DetailContentCard>
        {(review || resolvedDirector || relatedMoviesByDirector.length > 0) && (
          <DetailBelowFold>
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
                      <DirectorMoviesTitle>
                        James Trapp Movie Reviews
                      </DirectorMoviesTitle>
                      <DirectorMoviesCarouselWrap>
                        <Movies
                          showMovies={relatedMoviesByDirector}
                          cardSize="small"
                          carouselFullBleed={false}
                        />
                      </DirectorMoviesCarouselWrap>
                    </DirectorMoviesColumn>
                  )}
                </SuggestionsLayout>
              </RelatedSection>
            )}
          </DetailBelowFold>
        )}
      </StyledContainer>
    </>
  );
}

export default MovieReview;
