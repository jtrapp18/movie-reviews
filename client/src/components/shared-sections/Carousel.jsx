import React from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';
import { FaSearch } from 'react-icons/fa';
import MotionWrapper from '@styles/MotionWrapper';
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

  /* Hide arrows unless $showArrows */
  ${(p) =>
    !p.$showArrows &&
    `
  .slick-prev,
  .slick-next {
    display: none;
  }
  `}

  ${(p) =>
    p.$showArrows &&
    `
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
    background-color: #007bff !important;
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
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
  `}

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

/** Fixed-width slide shell for article cards in carousels (list + detail “more” rows). */
export const ArticleCarouselSlide = styled.div`
  margin: 0;
  width: 200px;
  height: 100%;
  flex-shrink: 0;
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

const Carousel = ({
  children,
  settings = {},
  noResultsMessage = 'No results found',
  /** When true, slick arrows are shown and styled (articles index page). */
  showArrows = false,
}) => {
  const childCount = React.Children.count(children);

  const defaultSettings = {
    dots: childCount > 1,
    /* react-slick infinite mode clones slides; with a single slide that shows duplicates */
    infinite: childCount > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: childCount > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    centerMode: false,
    variableWidth: true,
    adaptiveHeight: false,
    arrows: false,
  };

  const finalSettings = {
    ...defaultSettings,
    ...settings,
    ...(showArrows ? { arrows: true } : {}),
  };

  if (childCount <= 1) {
    finalSettings.infinite = false;
    finalSettings.autoplay = false;
  }

  const hasChildren = childCount > 0;

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
      <CarouselStyles $showArrows={showArrows}>
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
