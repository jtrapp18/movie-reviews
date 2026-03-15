import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PostCard from '@components/cards/PostCard';
import { Button } from '@styles';
import { formatDate } from '@utils/formatting';
import MotionWrapper from '@styles/MotionWrapper';

const GridContainer = styled.div`
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 700px;
  margin: 0 auto;
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const PostsGrid = ({ posts, initialCount = 5 }) => {
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
    if (post.movieId) {
      navigate(`/movies/${post.movieId}`);
    } else {
      navigate(`/articles/${post.id}`);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((count) => Math.min(count + initialCount, sortedPosts.length));
  };

  return (
    <GridContainer>
      <StyledGrid>
        {visiblePosts.map((post, index) => {
          const title = post.title || post.movie?.title || 'Untitled';
          const date = formatDate(post.dateAdded);

          const stripHtml = (str) =>
            typeof str === 'string' ? str.replace(/<[^>]+>/g, '') : str;

          const rawDescription =
            post.description ||
            post.shortText ||
            (post.reviewText ? `${post.reviewText.slice(0, 140)}...` : '');

          const description = stripHtml(rawDescription);

          const photo = post.backdrop
            ? `/api/articles/${post.id}/backdrop/view?v=${encodeURIComponent(
                post.backdrop
              )}`
            : (post.movie?.backdrop ?? null);

          return (
            <MotionWrapper key={post.id} index={index}>
              <PostCard
                photo={photo}
                title={title}
                date={date}
                description={description}
                onClick={() => handleCardClick(post)}
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
