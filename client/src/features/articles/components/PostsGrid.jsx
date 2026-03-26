import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { PostCard } from '@features/articles';
import { Button } from '@styles';
import { formatDate } from '@utils/formatting';
import MotionWrapper from '@styles/MotionWrapper';
import { prefetchEntity } from '@features/cache/prefetchEntity';
import { appendContinueReading, pathForPost } from '@features/sidePanel';
import { resolveMovieReviewCoverUrl } from '@utils/movieReviewBackdrop';

const GridContainer = styled.div`
  width: 100%;
  padding: ${({ $fillColumn }) => ($fillColumn ? '0' : '0 20px')};
  box-sizing: border-box;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: ${({ $fillColumn }) => ($fillColumn ? '100%' : '700px')};
  margin: ${({ $fillColumn }) => ($fillColumn ? '0' : '0 auto')};
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const PostsGrid = ({ posts, initialCount = 5, fillColumn = false }) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const sortedPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    return [...posts].sort(
      (a, b) => new Date(b.dateAdded ?? 0) - new Date(a.dateAdded ?? 0)
    );
  }, [posts]);

  if (!sortedPosts.length) {
    return null;
  }

  const visiblePosts = sortedPosts.slice(0, visibleCount);

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

  const handleLoadMore = () => {
    setVisibleCount((count) => Math.min(count + initialCount, sortedPosts.length));
  };

  return (
    <GridContainer $fillColumn={fillColumn}>
      <StyledGrid $fillColumn={fillColumn}>
        {visiblePosts.map((post, index) => {
          const title = post.title || post.movie?.title || 'Untitled';
          const date = formatDate(post.dateAdded);

          const stripHtml = (str) =>
            typeof str === 'string' ? str.replace(/<[^>]+>/g, '') : str;

          const movieId = post.movieId ?? post.movie?.id;
          const isMovieReview = movieId != null && movieId !== '';
          const description = isMovieReview
            ? post.movie?.overview?.trim() || 'No overview available'
            : stripHtml(post.description || '');
          let photo;
          if (isMovieReview) {
            photo = resolveMovieReviewCoverUrl({ review: post, movie: post.movie });
          } else if (post.backdrop) {
            photo = `/api/articles/${post.id}/backdrop/view?v=${encodeURIComponent(post.backdrop)}`;
          } else {
            photo = null;
          }

          const releaseRaw = post.movie?.release_date ?? post.movie?.releaseDate;
          const releaseYear = releaseRaw ? String(releaseRaw).slice(0, 4) : null;

          return (
            <MotionWrapper key={post.id} index={index}>
              <PostCard
                photo={photo}
                title={title}
                date={date}
                description={description}
                isMovieReview={Boolean(post.movieId)}
                movieTitle={post.movie?.title}
                releaseYear={releaseYear}
                onClick={() => handleCardClick(post)}
                onMouseEnter={() => {
                  if (post.movieId) {
                    prefetchEntity('movieReview', 'movies', post.movieId);
                  } else {
                    prefetchEntity('article', 'articles', post.id);
                  }
                }}
              />
            </MotionWrapper>
          );
        })}
      </StyledGrid>

      {visibleCount < sortedPosts.length && (
        <LoadMoreContainer>
          <Button onClick={handleLoadMore}>Load more</Button>
        </LoadMoreContainer>
      )}
    </GridContainer>
  );
};

export default PostsGrid;
