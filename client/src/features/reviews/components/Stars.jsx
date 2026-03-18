import styled from 'styled-components';
import { getAllGradingTiers, getGradingLabel } from '@utils/gradingTiers';

const GradeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--soft-white);
  font-weight: 600;
  white-space: nowrap;
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

const Stars = ({ rating, handleStarClick }) => {
  const tiers = getAllGradingTiers();

  // Edit/select mode (used by ReviewForm)
  if (typeof handleStarClick === 'function') {
    const value = rating ? String(rating) : '';
    return (
      <Select
        value={value}
        onChange={(e) => handleStarClick(e.target.value === '' ? '' : Number(e.target.value))}
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
    <GradeBadge>
      {label} <TierNumber>Tier {Math.round(rating)}</TierNumber>
    </GradeBadge>
  );
};

export default Stars;
