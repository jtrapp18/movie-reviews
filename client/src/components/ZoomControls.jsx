import React from 'react';
import styled from 'styled-components';

const ZoomControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem;
  border-radius: 25px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  
  ${props => props.floating ? `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(26, 26, 26, 0.95);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    z-index: 1000;
    
    @media (max-width: 768px) {
      bottom: 10px;
      right: 10px;
      padding: 0.4rem;
      gap: 0.2rem;
    }
  ` : `
    justify-content: center;
    margin: 1rem 0;
    background-color: rgba(255, 215, 0, 0.05);
  `}
`;

const ZoomButton = styled.button`
  background: var(--cinema-gold);
  color: var(--cinema-black);
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
    background: var(--cinema-gold-dark);
    transform: scale(1.1);
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
  color: var(--cinema-gold);
  font-weight: 600;
  font-size: 0.8rem;
  min-width: 40px;
  text-align: center;
  padding: 0 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
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
  style = 'floating' // 'floating' or 'inline'
}) => {
  const zoomPercentage = Math.round(zoomLevel * 100);

  return (
    <ZoomControlsContainer floating={style === 'floating'}>
      <ZoomButton 
        onClick={onZoomOut}
        disabled={zoomLevel <= minZoom}
        title="Zoom Out"
      >
        −
      </ZoomButton>
      <ZoomLevel>{zoomPercentage}%</ZoomLevel>
      <ZoomButton 
        onClick={onZoomIn}
        disabled={zoomLevel >= maxZoom}
        title="Zoom In"
      >
        +
      </ZoomButton>
      {showReset && (
        <ZoomButton 
          onClick={onReset}
          title="Reset Zoom"
        >
          ↺
        </ZoomButton>
      )}
    </ZoomControlsContainer>
  );
};

export default ZoomControls;
