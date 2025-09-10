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
  
  /* Hide arrows */
  .slick-prev,
  .slick-next {
    display: none;
  }
  
  /* Dots styling */
  .slick-dots {
    width: 100vw;
  }
  
  .slick-dots li {
    position: relative;
    width: 20px;
    height: 20px;
    margin: 0 5px;
    padding: 0;
    cursor: pointer;
  }
  
  .slick-dots li button:before {
    color: var(--cinema-gold);
    opacity: 0.5;
  }
  
  .slick-dots li.slick-active button:before {
    opacity: 1;
    color: var(--cinema-gold);
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
    arrows: false,
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
