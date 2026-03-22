import styled from 'styled-components';

/**
 * Optional inner stack for multiple SidePanelBlocks (gap only).
 * The outer chrome (flush sidebar, border) lives on the page layout (e.g. Home).
 */
export const SidePanelStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

/**
 * White inner card — use for Continue reading, Activity, etc.
 */
export const SidePanelBlockRoot = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
  flex: ${({ $fill }) => ($fill ? '1' : '0 0 auto')};
  padding: 0.65rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--font-color-1, #1a1a1a);
`;

export const SidePanelBlockTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
  width: 100%;
`;

/** Default body slot while sections are stubbed / empty */
export const SidePanelPlaceholder = styled.div`
  min-height: 120px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
  width: 100%;
`;
