import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { snakeToCamel } from '../../helper';
import { UserContext } from '../../context/userProvider';
import Comment from './Comment';
import CommentForm from './CommentForm';
import Loading from '../ui/Loading';

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
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    if (!reviewId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`);
      if (!res.ok) {
        setError('Failed to load comments');
        return;
      }
      const data = await res.json();
      const camel = snakeToCamel(data);
      setComments(buildCommentTree(camel));
    } catch (err) {
      console.error(err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  if (!reviewId) return null;

  return (
    <Section>
      <Title>Comments</Title>
      {loading && <Loading text="Loading comments" size="small" />}
      {error && <Empty>{error}</Empty>}
      {!loading && !error && comments.length === 0 && !user && (
        <Empty>No comments yet. Log in to leave the first comment.</Empty>
      )}
      {!loading && !error && comments.length === 0 && user && (
        <Empty>No comments yet. Be the first to comment.</Empty>
      )}
      {!loading && !error && user && (
        <CommentForm reviewId={reviewId} onSuccess={fetchComments} />
      )}
      {!loading && !error && !user && (
        <LoginPrompt>Log in to comment.</LoginPrompt>
      )}
      {!loading && !error && comments.length > 0 && (
        <>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              reviewId={reviewId}
              onReplySuccess={fetchComments}
            />
          ))}
        </>
      )}
    </Section>
  );
}

export default CommentList;
