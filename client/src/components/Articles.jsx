import React from 'react';
import { CardContainer, Button } from '../MiscStyling';
import ArticleCard from '../cards/ArticleCard';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper';
import Carousel from './Carousel';
import Loading from '../pages/Loading';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';

const AddButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 2% auto 20px auto;
  flex-wrap: wrap;
`;


function Articles({ showArticles, enterSearch }) {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();


  // Handle null or undefined showArticles
  if (!showArticles || !Array.isArray(showArticles)) {
    return (
      <CardContainer>
        <Loading text="Loading articles" compact={true} />
      </CardContainer>
    );
  }

  const handleAddNew = () => {
    navigate('/articles/new');
  };


  return (
    <CardContainer>
      <Carousel>
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
      
      {isAdmin && (
        <AddButtonContainer>
          <Button onClick={handleAddNew}>
            + Add New Article
          </Button>
        </AddButtonContainer>
      )}
    </CardContainer>
  );
}

export default Articles;
