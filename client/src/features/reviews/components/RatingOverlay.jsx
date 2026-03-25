import { useState } from 'react';
import styled from 'styled-components';
import GradingModal from '@components/about/GradingModal';
import { getGradingLabel } from '@utils/gradingTiers';

const InlineRatingContainer = styled.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  white-space: normal;
  flex-shrink: 0;
  margin-top: 2px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const RatingLabel = styled.i`
  color: var(--cinema-gold);
  width: 100%;
  text-align: center;
  font-size: clamp(0.72rem, 1.65vw, 0.88rem);
  line-height: 1.1;
  text-wrap: balance;
  overflow-wrap: anywhere;
`;

const RatingOverlay = ({ rating }) => {
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  if (!rating || rating <= 0) return null;

  const label = getGradingLabel(rating);

  return (
    <>
      <InlineRatingContainer
        type="button"
        title="Click to view rating system"
        aria-label="Open rating system guidelines"
        onClick={(e) => {
          e.stopPropagation();
          setIsGuidelinesOpen(true);
        }}
      >
        <RatingLabel>{label || 'Tier'}</RatingLabel>
      </InlineRatingContainer>
      <GradingModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />
    </>
  );
};

export default RatingOverlay;
