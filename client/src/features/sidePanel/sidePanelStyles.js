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
 * Titled block inside the side panel — no separate surface (inherits sidebar bg).
 */
export const SidePanelBlockRoot = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
  flex: ${({ $fill }) => ($fill ? '1' : '0 0 auto')};
  padding: 0.35rem 0;
  background: transparent;
  color: var(--font-color-1, #1a1a1a);
`;

export const SidePanelBlockTitle = styled.h3`
  margin: 0;
  padding-top: 0.55rem;
  font-size: 0.95rem;
  font-weight: 300;
  text-align: left;
  width: 100%;
  line-height: 1.2;
  color: var(--font-color-2, #555);
`;

/**
 * Uppercase rail section label — use for CONTINUE READING, RECENT ACTIVITY, etc.
 */
export const SidePanelHeadingLabel = styled.span`
  display: inline-block;
  letter-spacing: 0.04em;
  font-size: inherit;
  font-weight: inherit;
  text-transform: uppercase;
`;

/** Default body slot while sections are stubbed / empty */
export const SidePanelPlaceholder = styled.div`
  min-height: 120px;
  border-radius: 4px;
  border: 1px dashed var(--font-color-3);
  width: 100%;
  box-sizing: border-box;
`;
