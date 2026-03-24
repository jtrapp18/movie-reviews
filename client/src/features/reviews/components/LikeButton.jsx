import { useState } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  cursor: ${(p) => (p.$disabled ? 'default' : 'pointer')};
  padding: 0.25rem 0.5rem;
  font-size: clamp(1rem, 1.5vw, 1.1rem);
  color: var(--font-color-2);
  opacity: ${(p) => (p.$disabled ? 0.7 : 1)};

  &:hover:not(:disabled) {
    color: var(--cinema-gold);
  }

  &:disabled {
    cursor: default;
  }
`;

const Heart = styled.span`
  font-size: inherit;
  line-height: 1;
`;

const Count = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: inherit;
`;

/**
 * Reusable like button for comments or reviews.
 * @param {string} type - 'comment' | 'review'
 * @param {number} id - comment_id or review_id
 * @param {number} likeCount - current like count
 * @param {boolean} likedByMe - whether current user has liked
 * @param {boolean} disabled - e.g. when not logged in
 * @param {function} onUpdate - (liked, likeCount) => void after toggle
 */
function LikeButton({
  type,
  id,
  likeCount = 0,
  likedByMe = false,
  disabled = false,
  onUpdate,
}) {
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(likeCount);
  const [loading, setLoading] = useState(false);

  const endpoint =
    type === 'comment' ? `/api/comments/${id}/like` : `/api/reviews/${id}/like`;

  const handleClick = async () => {
    if (disabled || loading) return;
    setLoading(true);
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount((c) => (liked ? c - 1 : c + 1));
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        if (data.error) console.warn(data.error);
        return;
      }
      const newLiked = data.liked ?? !prevLiked;
      const newCount = data.like_count ?? count;
      setLiked(newLiked);
      setCount(newCount);
      onUpdate?.(newLiked, newCount);
    } catch (err) {
      console.error(err);
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  const isLiked = liked;

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      $disabled={disabled}
      aria-pressed={isLiked}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart aria-hidden>{isLiked ? '♥' : '♡'}</Heart>
      <Count>{count}</Count>
    </Button>
  );
}

export default LikeButton;
