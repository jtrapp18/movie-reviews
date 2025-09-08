import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { CardContainer } from '../MiscStyling';
import ArticleCard from '../cards/ArticleCard';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AddButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const AddNewButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);

  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

function Articles({ showArticles, enterSearch }) {
  const navigate = useNavigate();
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

  // Handle null or undefined showArticles
  if (!showArticles || !Array.isArray(showArticles)) {
    return (
      <CardContainer>
        <SearchBar 
          enterSearch={enterSearch} 
          placeholder="Search articles by title, content, or tags..."
        />
        <div className="text-center p-4">
          <h3>Loading articles...</h3>
          <p>Please wait while we fetch the latest articles.</p>
        </div>
      </CardContainer>
    );
  }

  const handleAddNew = () => {
    navigate('/articles/new');
  };

  return (
    <CardContainer>
      <AddButtonContainer>
        <MotionWrapper index={0}>
          <SearchBar 
            enterSearch={enterSearch} 
            placeholder="Search articles by title, content, or tags..."
          />
        </MotionWrapper>
        <AddNewButton onClick={handleAddNew}>
          + Add New Article
        </AddNewButton>
      </AddButtonContainer>

      {/* React Slick Carousel */}
      <div style={{ width: '100%', margin: '0 auto', height: '300px', overflow: 'hidden' }}>
        <style>
          {`
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
        </style>
        <Slider {...settings}>
          {showArticles.map((article, index) => (
            <MotionWrapper key={article.id} index={index}>
              <div style={{ 
                margin: '0',
                width: '200px',
                height: '100%',
                flexShrink: 0
              }}>
                <ArticleCard article={article} />
              </div>
            </MotionWrapper>
          ))}
        </Slider>
      </div>
    </CardContainer>
  );
}

export default Articles;
