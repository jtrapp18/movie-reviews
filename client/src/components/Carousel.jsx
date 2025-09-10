import React from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CarouselContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  height: 300px;
  overflow: hidden;
`;

const CarouselStyles = styled.div`
  .slick-slide > div {
    margin: 0 6px;
  }
  
  /* Arrow styles */
  .slick-prev,
  .slick-next {
    z-index: 10;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 2px solid #333;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .slick-prev {
    left: 10px;
  }
  
  .slick-next {
    right: 10px;
  }
  
  .slick-prev:hover,
  .slick-next:hover {
    background-color: var(--cinema-gold);
    border-color: var(--cinema-gold);
    box-shadow: 0 4px 12px rgba(var(--cinema-gold), 0.3);
    transition: all 0.2s ease;
  }
  
  .slick-prev:before,
  .slick-next:before {
    font-size: 18px;
    color: #333;
    font-weight: bold;
  }
  
  .slick-prev:hover:before,
  .slick-next:hover:before {
    color: white;
  }
  
  .slick-disabled {
    opacity: 0.3;
  }
`;

const Carousel = ({ children, settings = {} }) => {
  const defaultSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    centerMode: false,
    variableWidth: true,
    adaptiveHeight: false,
    arrows: true,
  };

  const finalSettings = { ...defaultSettings, ...settings };

  return (
    <CarouselContainer>
      <CarouselStyles>
        <Slider {...finalSettings}>
          {children}
        </Slider>
      </CarouselStyles>
    </CarouselContainer>
  );
};

export default Carousel;
