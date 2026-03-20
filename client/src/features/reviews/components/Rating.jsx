import { useState } from 'react';
import styled from 'styled-components';
import GradingModal from '@components/about/GradingModal';
import { getAllGradingTiers, getGradingLabel } from '@utils/gradingTiers';

const GradeBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--soft-white);
  white-space: nowrap;
  cursor: pointer;
  font: inherit;

  &:hover {
    border-color: var(--cinema-gold);
  }
`;

const TierNumber = styled.span`
  color: var(--cinema-gold);
  font-weight: 700;
`;

const Select = styled.select`
  width: min(520px, 100%);
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--text);
`;

const Rating = ({ rating, handleStarClick }) => {
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const tiers = getAllGradingTiers();

  // Edit/select mode (used by ReviewForm)
  if (typeof handleStarClick === 'function') {
    const value = rating ? String(rating) : '';
    return (
      <Select
        value={value}
        onChange={(e) =>
          handleStarClick(e.target.value === '' ? '' : Number(e.target.value))
        }
      >
        <option value="">Select a grade…</option>
        {tiers.map((t) => (
          <option key={t.tier} value={t.tier}>
            {t.grade} (Tier {t.tier})
          </option>
        ))}
      </Select>
    );
  }

  // Display mode (used across the site)
  const label = getGradingLabel(rating);
  if (!label) return null;

  return (
    <>
      <GradeBadge
        type="button"
        title="Click to view rating system"
        aria-label="Open rating system guidelines"
        onClick={(e) => {
          e.stopPropagation();
          setIsGuidelinesOpen(true);
        }}
      >
        {label} <TierNumber>Tier {Math.round(rating)}</TierNumber>
      </GradeBadge>
      <GradingModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />
    </>
  );
};

export default Rating;
