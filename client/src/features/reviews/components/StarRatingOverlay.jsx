import styled from 'styled-components';
import { getGradingLabel } from '@utils/gradingTiers';

const InlineRatingContainer = styled.span`
  color: var(--cinema-gold);
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
`;

const Star = styled.span`
  color: var(--cinema-gold);
  font-size: 0.9rem;
`;

const RatingNumber = styled.span`
  font-size: 0.75rem;
  opacity: 0.9;
`;

const StarRatingOverlay = ({ rating }) => {
  if (!rating || rating <= 0) return null;

  const label = getGradingLabel(rating);
  const displayTier = Math.round(rating);

  return (
    <InlineRatingContainer>
      <Star>{label || 'Tier'}</Star>
      <RatingNumber>Tier {displayTier}</RatingNumber>
    </InlineRatingContainer>
  );
};

export default StarRatingOverlay;
