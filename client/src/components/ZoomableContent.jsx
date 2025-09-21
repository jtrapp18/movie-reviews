import React, { useState } from 'react';
import styled from 'styled-components';
import ZoomControls from './ZoomControls';

const ZoomableContainer = styled.div`
  /* Apply zoom as a font-size multiplier using CSS custom property */
  --zoom-multiplier: ${props => props.zoomLevel || 1};
  width: 100%;
  transition: --zoom-multiplier 0.3s ease;
`;

const ZoomableContent = ({ 
  children, 
  minZoom = 0.7, 
  maxZoom = 2, 
  zoomStep = 0.1,
  showControls = true,
  showReset = true,
  initialZoom = 1,
  controlsStyle = 'floating' // 'floating' or 'inline'
}) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + zoomStep, maxZoom));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - zoomStep, minZoom));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(initialZoom);
  };

  return (
    <>
      {showControls && (
        <ZoomControls
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleResetZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          showReset={showReset}
          style={controlsStyle}
        />
      )}
      <ZoomableContainer zoomLevel={zoomLevel}>
        {children}
      </ZoomableContainer>
    </>
  );
};

export default ZoomableContent;
