import React from 'react';
import { CardContainer } from '@styles';
import Loading from '@components/ui/Loading';
import PostsGrid from './PostsGrid';

function RecentPosts({ posts }) {
  if (!posts) {
    return (
      <CardContainer>
        <Loading text="Loading posts" compact={true} />
      </CardContainer>
    );
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <CardContainer>
        <p>No posts yet.</p>
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <PostsGrid posts={posts} />
    </CardContainer>
  );
}

export default RecentPosts;
