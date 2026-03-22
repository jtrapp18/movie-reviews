import styled from 'styled-components';
import { CardContainer } from '@styles';
import Loading from '@components/ui/Loading';
import PostsGrid from './PostsGrid';

/** Same as CardContainer but left-aligns grid when beside side panel (Home) */
const RecentPostsOuter = styled.div`
  width: 100%;
  display: grid;
  gap: 5px;
  max-width: 100vw;
  justify-items: ${({ $fillColumn }) => ($fillColumn ? 'stretch' : 'center')};

  hr {
    width: 100%;
  }
`;

function RecentPosts({ posts, fillColumn = false }) {
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

  if (fillColumn) {
    return (
      <RecentPostsOuter $fillColumn>
        <PostsGrid posts={posts} fillColumn />
      </RecentPostsOuter>
    );
  }

  return (
    <CardContainer>
      <PostsGrid posts={posts} />
    </CardContainer>
  );
}

export default RecentPosts;
