/**
 * Pick hero/card image for a movie review when both movie (TMDb URL) and review (S3) backdrops may exist.
 *
 * @param {object} params
 * @param {object|null|undefined} params.review — review row (camelCase); needs `id`, `backdrop`, `showReviewBackdrop`
 * @param {object|null|undefined} params.movie — movie row with `backdrop` URL or null
 * @param {boolean|undefined} params.preferReview — when set, overrides `review.showReviewBackdrop`
 */
export function resolveMovieReviewCoverUrl({ review, movie, preferReview }) {
  const reviewUrl =
    review?.backdrop && review?.id
      ? `/api/reviews/${review.id}/backdrop/view?v=${encodeURIComponent(review.backdrop)}`
      : null;
  const movieUrl = movie?.backdrop || null;

  const prefer =
    typeof preferReview === 'boolean'
      ? preferReview
      : review?.showReviewBackdrop !== false;

  if (prefer && reviewUrl) return reviewUrl;
  if (movieUrl) return movieUrl;
  return reviewUrl || null;
}
