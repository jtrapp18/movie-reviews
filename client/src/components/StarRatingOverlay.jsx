import React from 'react';
import styled from 'styled-components';

const OverlayContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  // background: rgba(0, 0, 0, 0.8);
  color: var(--cinema-gold);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 10;
  // backdrop-filter: blur(4px);
`;

const Star = styled.span`
  color: var(--cinema-gold);
  font-size: 0.9rem;
`;

const StarRatingOverlay = ({ rating }) => {
  if (!rating || rating <= 0) return null;

  const stars = '★'.repeat(Math.round(rating));
  const displayRating = rating.toFixed(1);

  return (
    <OverlayContainer className='star-rating-overlay'>
      <Star>{stars}</Star>
      <span>{displayRating}</span>
    </OverlayContainer>
  );
};

export default StarRatingOverlay;
