import React from 'react';
import { CardContainer, Button } from '../MiscStyling';
import ArticleCard from '../cards/ArticleCard';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper';
import Carousel from './Carousel';
import { useNavigate } from 'react-router-dom';

const AddButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;


function Articles({ showArticles, enterSearch }) {
  const navigate = useNavigate();

  console.log('📰 Articles component RENDERED');
  console.log('📰 Articles component received showArticles:', showArticles);
  console.log('📰 Articles component received enterSearch:', typeof enterSearch);
  console.log('📰 Articles component props changed - showArticles reference:', showArticles);
  console.log('📰 Articles component props changed - enterSearch reference:', enterSearch);
  console.log('📰 showArticles length:', showArticles?.length);
  if (showArticles) {
    console.log('📰 Article IDs in showArticles:', showArticles.map(a => a.id));
    console.log('📰 Article titles in showArticles:', showArticles.map(a => a.title));
    
    // Check for duplicates
    const ids = showArticles.map(a => a.id);
    const uniqueIds = [...new Set(ids)];
    if (ids.length !== uniqueIds.length) {
      console.warn('⚠️ DUPLICATE IDs IN showArticles!');
      console.warn('Total articles:', ids.length);
      console.warn('Unique IDs:', uniqueIds.length);
      console.warn('Duplicate IDs:', ids.filter((id, index) => ids.indexOf(id) !== index));
    }
  }

  // Handle null or undefined showArticles
  if (!showArticles || !Array.isArray(showArticles)) {
    return (
      <CardContainer>
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
        <Button onClick={handleAddNew}>
          + Add New Article
        </Button>
      </AddButtonContainer>

      <Carousel settings={{
        infinite: showArticles.length > 1, // Only enable infinite scroll if more than 1 item
        autoplay: showArticles.length > 1, // Only autoplay if more than 1 item
      }}>
        {showArticles.map((article, index) => {
          console.log(`🎬 RENDERING article ${index}: ID=${article.id}, Title="${article.title}"`);
          return (
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
          );
        })}
      </Carousel>
    </CardContainer>
  );
}

export default Articles;
