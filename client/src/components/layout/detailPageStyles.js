import styled from 'styled-components';
import { MobilePageGutter } from '@styles';

/** Card wrapper for review/article detail body (hero + engagement + form) */
export const DetailContentCard = styled.div`
  margin: 1rem 0 2rem 0;
  width: 100%;
  background: var(--background-secondary);
  border-radius: 8px;
  overflow: hidden;
`;

/** Centered row for like button under the cover */
export const LikeBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

/** Comments + related under the main card */
export const DetailBelowFold = styled(MobilePageGutter)`
  display: flex;
  flex-direction: column;
`;

/** Section below main content (more articles, director suggestions, etc.) */
export const RelatedSection = styled.section`
  margin-top: 1.25rem;
  width: 100%;
`;

export const RelatedHeading = styled.h2`
  margin-bottom: 0.75rem;
`;

/** Consistent error / not-found messaging for entity detail pages */
export const EntityErrorMessage = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
`;
