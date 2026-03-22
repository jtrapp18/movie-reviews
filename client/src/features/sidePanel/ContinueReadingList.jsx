import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PostCard from '@components/cards/PostCard';
import { formatDate } from '@utils/formatting';
import { prefetchEntity } from '@features/cache/prefetchEntity';
import { appendContinueReading, useContinueReading } from '@features/sidePanel';
import { normalizePath, pathForPost } from './continueReadingPaths';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  min-width: 0;
`;

/**
 * Compact post cards for the CONTINUE rail — only MRU entries that resolve to
 * a row in `posts` (no substitute content).
 */
function ContinueReadingList({ posts = [], limit = 5 }) {
  const navigate = useNavigate();
  const { items: continueEntries } = useContinueReading();

  const items = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [];

    const seen = new Set();
    const ordered = [];

    for (const entry of continueEntries) {
      const want = normalizePath(entry.path);
      const post = posts.find((p) => normalizePath(pathForPost(p)) === want);
      if (post && !seen.has(post.id)) {
        seen.add(post.id);
        ordered.push(post);
      }
      if (ordered.length >= limit) break;
    }

    return ordered;
  }, [posts, limit, continueEntries]);

  const handleCardClick = (post) => {
    const title = post.title || post.movie?.title || 'Untitled';
    const path = pathForPost(post);
    const movieId = post.movieId ?? post.movie?.id;
    appendContinueReading({
      path,
      title,
      kind: movieId != null && movieId !== '' ? 'movieReview' : 'article',
    });
    navigate(path);
  };

  const stripHtml = (str) =>
    typeof str === 'string' ? str.replace(/<[^>]+>/g, '') : '';

  if (items.length === 0) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: '0.9rem',
          color: 'var(--font-color-2)',
        }}
      >
        Nothing here yet — open a review or article from the site and it will show up
        here.
      </p>
    );
  }

  return (
    <List>
      {items.map((post) => {
        const title = post.title || post.movie?.title || 'Untitled';
        const date = formatDate(post.dateAdded);
        const description = stripHtml(post.description || '');
        const movieId = post.movieId ?? post.movie?.id;
        const isMovieReview = movieId != null && movieId !== '';
        const photo = post.backdrop
          ? isMovieReview
            ? `/api/reviews/${post.id}/backdrop/view?v=${encodeURIComponent(post.backdrop)}`
            : `/api/articles/${post.id}/backdrop/view?v=${encodeURIComponent(post.backdrop)}`
          : (post.movie?.backdrop ?? null);
        const releaseRaw = post.movie?.release_date ?? post.movie?.releaseDate;
        const releaseYear = releaseRaw ? String(releaseRaw).slice(0, 4) : null;

        return (
          <PostCard
            key={post.id}
            size="compact"
            photo={photo}
            title={title}
            date={date}
            description={description}
            isMovieReview={isMovieReview}
            movieTitle={post.movie?.title}
            releaseYear={releaseYear}
            onClick={() => handleCardClick(post)}
            onMouseEnter={() => {
              if (isMovieReview) {
                prefetchEntity('movieReview', 'movies', movieId);
              } else {
                prefetchEntity('article', 'articles', post.id);
              }
            }}
          />
        );
      })}
    </List>
  );
}

export default ContinueReadingList;
