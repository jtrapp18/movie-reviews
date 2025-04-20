import React from 'react';
import SearchBar from './SearchBar';
import { CardContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS

function Movies({ showMovies, enterSearch }) {
  return (
    <CardContainer>
      <SearchBar enterSearch={enterSearch} />

      {/* Bootstrap Carousel */}
      <div id="movieCarousel" className="carousel slide" data-bs-ride="carousel">
        {/* Carousel Inner */}
        <div className="carousel-inner">
          {/* Wrap each set of 5 cards in a carousel-item */}
          <div className="carousel-item active">
            <div className="d-flex">
              {showMovies.slice(0, 5).map((movie, index) => (
                <MotionWrapper key={movie.title} index={index}>
                  <div className="mx-2">
                    <MovieCard movie={movie} />
                  </div>
                </MotionWrapper>
              ))}
            </div>
          </div>

          {/* Next Slide */}
          <div className="carousel-item">
            <div className="d-flex">
              {showMovies.slice(5, 10).map((movie, index) => (
                <MotionWrapper key={movie.title} index={index}>
                  <div className="mx-2">
                    <MovieCard movie={movie} />
                  </div>
                </MotionWrapper>
              ))}
            </div>
          </div>

          {/* Add more items here if needed */}
        </div>

        {/* Carousel controls (next and prev buttons) */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#movieCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#movieCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </CardContainer>
  );
}

export default Movies;