import styled from 'styled-components';

/**
 * Generic dropdown panel with a vertical scale expand/collapse animation.
 * Apply "open" or "closed" className to control visibility.
 */
const DropdownPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  background: var(--background-tertiary);
  border: 1px solid var(--border);
  border-bottom: 3px double var(--border);
  overflow: hidden;
  transform-origin: top;
  transform: scaleY(0);
  transition: transform 0.25s ease-in-out;

  &.open {
    transform: scaleY(1);
  }

  &.closed {
    transform: scaleY(0);
  }
`;

export default DropdownPanel;
