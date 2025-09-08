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

      <Carousel>
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
      </Carousel>
    </CardContainer>
  );
}

export default Articles;
