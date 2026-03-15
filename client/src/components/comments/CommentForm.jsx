import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../styles';

const Form = styled.form`
  margin-top: 0.5rem;
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--background-secondary);
  font-size: 1rem;
  color: var(--font-color);
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--cinema-gold-dark);
  }

  &::placeholder {
    color: var(--font-color-2);
  }
`;

const ErrorText = styled.p`
  color: var(--cinema-red);
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const ButtonRow = styled.div`
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

function CommentForm({ reviewId, parentCommentId = null, onSuccess, onCancel }) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = { body: trimmed };
      if (parentCommentId != null) payload.parent_comment_id = parentCommentId;
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to post comment');
        return;
      }
      setBody('');
      onSuccess?.(data);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentCommentId ? 'Write a reply...' : 'Write a comment...'}
        disabled={submitting}
      />
      {error && <ErrorText>{error}</ErrorText>}
      <ButtonRow>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Posting…' : parentCommentId ? 'Reply' : 'Comment'}
        </Button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--font-color-2)' }}>
            Cancel
          </button>
        )}
      </ButtonRow>
    </Form>
  );
}

export default CommentForm;
