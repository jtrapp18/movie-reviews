import { useState, useEffect, useContext, useCallback } from 'react';
import styled from 'styled-components';
import { snakeToCamel } from '@helper';
import { UserContext } from '@context/userProvider';
import Comment from './Comment';
import CommentForm from './CommentForm';
import Loading from '@components/ui/Loading';

const COMMENT_PAGE_SIZE = 5;

const Section = styled.section`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--font-color);
`;

const LoginPrompt = styled.p`
  color: var(--font-color-2);
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const Empty = styled.p`
  color: var(--font-color-2);
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const LoadMore = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--cinema-gold);
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: var(--cinema-gold-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

/** Build a tree from flat list: { id -> comment } then attach replies. */
function buildCommentTree(flatList) {
  if (!flatList?.length) return [];
  const byId = {};
  const roots = [];
  flatList.forEach((c) => {
    byId[c.id] = { ...c, replies: [] };
  });
  flatList.forEach((c) => {
    const node = byId[c.id];
    if (c.parentCommentId == null) {
      roots.push(node);
    } else {
      const parent = byId[c.parentCommentId];
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  });
  roots.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  roots.forEach((r) => {
    r.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });
  return roots;
}

function CommentList({ reviewId }) {
  const { user } = useContext(UserContext);
  const [flatComments, setFlatComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(
    async (offset, append = false) => {
      if (!reviewId) return;
      if (!append) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/reviews/${reviewId}/comments?limit=${COMMENT_PAGE_SIZE}&offset=${offset}`
        );
        if (!res.ok) {
          setError('Failed to load comments');
          return;
        }
        const data = await res.json();
        const camel = snakeToCamel(data);
        const nextFlat = camel.comments || [];
        const nextTotal = camel.total ?? 0;
        if (append) {
          setFlatComments((prev) => [...nextFlat, ...prev]);
        } else {
          setFlatComments(nextFlat);
        }
        setTotal(nextTotal);
      } catch (err) {
        console.error(err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [reviewId]
  );

  const fetchComments = useCallback(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = () => {
    const topLevelLoaded = flatComments.filter((c) => c.parentCommentId == null).length;
    if (topLevelLoaded >= total) return;
    fetchPage(topLevelLoaded, true);
  };

  useEffect(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const tree = buildCommentTree(flatComments);
  const topLevelLoaded = flatComments.filter((c) => c.parentCommentId == null).length;
  const hasMore = total > topLevelLoaded;

  if (!reviewId) return null;

  return (
    <Section>
      <Title>Comments</Title>
      {loading && <Loading text="Loading comments" size="small" />}
      {error && <Empty>{error}</Empty>}
      {!loading && !error && (
        <>
          {hasMore && tree.length > 0 && (
            <LoadMore type="button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore
                ? 'Loading…'
                : `View ${total - topLevelLoaded} earlier comment${total - topLevelLoaded !== 1 ? 's' : ''}`}
            </LoadMore>
          )}
          {tree.length === 0 && !user && (
            <Empty>No comments yet. Log in to leave the first comment.</Empty>
          )}
          {tree.length === 0 && user && (
            <Empty>No comments yet. Be the first to comment.</Empty>
          )}
          {tree.length > 0 && (
            <>
              {tree.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  reviewId={reviewId}
                  onReplySuccess={fetchComments}
                />
              ))}
            </>
          )}
          {!user && tree.length > 0 && (
            <LoginPrompt>Log in to comment.</LoginPrompt>
          )}
          {user && (
            <CommentForm reviewId={reviewId} onSuccess={fetchComments} />
          )}
        </>
      )}
    </Section>
  );
}

export default CommentList;
