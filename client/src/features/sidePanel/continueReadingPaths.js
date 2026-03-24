/**
 * Canonical route for a review/article row — must match appendContinueReading + navigate().
 */
export function pathForPost(post) {
  if (post == null) return '';
  const movieId = post.movieId ?? post.movie?.id;
  if (movieId != null && movieId !== '') {
    return `/movies/${movieId}`;
  }
  return `/articles/${post.id}`;
}

export function normalizePath(path) {
  if (typeof path !== 'string') return '';
  return path.trim().replace(/\/+$/, '') || '';
}
