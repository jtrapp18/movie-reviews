import React from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';
import { FaSearch } from 'react-icons/fa';
import MotionWrapper from '../styles/MotionWrapper';
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
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
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
    color: var(--primary);
    opacity: 0.5;
  }
  
  .slick-dots li.slick-active button:before {
    opacity: 1;
    color: var(--primary);
  }
`;

const NoResultsPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  height: 200px;
  
  .icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.4;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #999;
  }
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #444;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    max-width: 400px;
    color: #666;
  }
`;

const Carousel = ({ children, settings = {}, noResultsMessage = "No results found" }) => {
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

  // Check if children array is empty
  const hasChildren = React.Children.count(children) > 0;

  if (!hasChildren) {
    return (
      <CarouselContainer>
        <NoResultsPlaceholder>
          <div className="icon">
            <FaSearch />
          </div>
          <h3>{noResultsMessage}</h3>
          <p>Try different search terms or browse our collection.</p>
        </NoResultsPlaceholder>
      </CarouselContainer>
    );
  }

  return (
    <CarouselContainer>
      <CarouselStyles>
        <Slider {...finalSettings}>
          {React.Children.map(children, (child, index) => (
            <MotionWrapper key={child.key ?? index} index={index}>
              {child}
            </MotionWrapper>
          ))}
        </Slider>
      </CarouselStyles>
    </CarouselContainer>
  );
};

export default Carousel;
