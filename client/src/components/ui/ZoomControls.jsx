import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

const FloatingAnchor = styled.div`
  position: fixed;
  bottom: max(20px, env(safe-area-inset-bottom, 0px));
  right: max(20px, env(safe-area-inset-right, 0px));
  z-index: 100;

  @media (max-width: 768px) {
    bottom: max(10px, env(safe-area-inset-bottom, 0px));
    right: max(10px, env(safe-area-inset-right, 0px));
  }
`;

const ZoomControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem;
  border-radius: 25px;
  background: var(--background-tertiary);

  ${(props) =>
    props.$inline
      ? `
    justify-content: center;
    margin: 1rem 0;
  `
      : `
    box-shadow: var(--shadow);
    backdrop-filter: blur(10px);

    @media (max-width: 768px) {
      padding: 0.4rem;
      gap: 0.2rem;
    }
  `}
`;

const BubbleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: var(--background-tertiary);
  color: var(--font-color-1);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  transition:
    transform 0.2s ease,
    background 0.2s ease;
  position: relative;

  svg {
    width: 1.15rem;
    height: 1.15rem;
  }

  &:hover {
    transform: scale(1.06);
    background: var(--background-secondary);
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const ZoomDeltaDot = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cinema-gold, #ffd700);
  border: 2px solid var(--background-tertiary);
`;

const ZoomButton = styled.button`
  background: var(--background-secondary);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    cursor: pointer;
    background: var(--font-color-1);
    color: var(--background);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    background: rgba(255, 215, 0, 0.3);
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
`;

const ZoomLevel = styled.span`
  font-weight: 600;
  min-width: 40px;
  text-align: center;
  padding: 0 0.5rem;

  @media (max-width: 768px) {
    min-width: 35px;
    padding: 0 0.3rem;
  }
`;

const ZoomControls = ({
  zoomLevel = 1,
  onZoomIn,
  onZoomOut,
  onReset,
  minZoom = 0.7,
  maxZoom = 2,
  showReset = true,
  style = 'floating', // 'floating' or 'inline'
}) => {
  const [expanded, setExpanded] = useState(false);
  const anchorRef = useRef(null);
  const zoomPercentage = Math.round(zoomLevel * 100);
  const zoomIsDefault = Math.abs(zoomLevel - 1) < 0.001;

  useEffect(() => {
    if (style !== 'floating' || !expanded) return undefined;
    const onDocMouseDown = (e) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [style, expanded]);

  useEffect(() => {
    if (style !== 'floating' || !expanded) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [style, expanded]);

  const controlBar = (
    <ZoomControlsContainer $inline={style === 'inline'}>
      <ZoomButton onClick={onZoomOut} disabled={zoomLevel <= minZoom} title="Zoom out">
        −
      </ZoomButton>
      <ZoomLevel>{zoomPercentage}%</ZoomLevel>
      <ZoomButton onClick={onZoomIn} disabled={zoomLevel >= maxZoom} title="Zoom in">
        +
      </ZoomButton>
      {showReset && (
        <ZoomButton onClick={onReset} title="Reset zoom">
          ↺
        </ZoomButton>
      )}
      {style === 'floating' && (
        <ZoomButton
          type="button"
          onClick={() => setExpanded(false)}
          title="Close"
          aria-label="Close text size controls"
        >
          ×
        </ZoomButton>
      )}
    </ZoomControlsContainer>
  );

  if (style === 'inline') {
    return controlBar;
  }

  /* floating: collapsed bubble → expanded bar */
  return (
    <FloatingAnchor ref={anchorRef}>
      {expanded ? (
        controlBar
      ) : (
        <BubbleButton
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          aria-label="Open text size controls"
          title="Text size"
        >
          <FaSearch aria-hidden />
          {!zoomIsDefault && <ZoomDeltaDot aria-hidden />}
        </BubbleButton>
      )}
    </FloatingAnchor>
  );
};

export default ZoomControls;
