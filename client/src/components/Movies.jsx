import React from 'react';
import SearchBar from './SearchBar';
import { CardContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Movies({ showMovies, enterSearch }) {
  // Slick carousel settings
  const settings = {
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

  // Handle null or undefined showMovies
  if (!showMovies || !Array.isArray(showMovies)) {
    return (
      <CardContainer>
        <SearchBar enterSearch={enterSearch} />
        <div className="text-center p-4">
          <h3>Loading movies...</h3>
          <p>Please wait while we fetch the latest movies.</p>
        </div>
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <MotionWrapper index={0}>
        <SearchBar enterSearch={enterSearch} />
      </MotionWrapper>

      {/* React Slick Carousel - UNCOMMENTED */}
      <div style={{ width: '100%', margin: '0 auto', height: '300px', overflow: 'hidden' }}>
        <style>
          {`
            .slick-slide > div {
              margin: 0 6px;
            }
          `}
        </style>
        <Slider {...settings}>
          {showMovies.map((movie, index) => (
            <MotionWrapper key={movie.title} index={index}>
              <div style={{ 
                margin: '0',
                width: '200px',
                height: '100%',
                flexShrink: 0
              }}>
                <MovieCard movie={movie} />
              </div>
            </MotionWrapper>
          ))}
        </Slider>
      </div>
    </CardContainer>
  );
}

export default Movies;