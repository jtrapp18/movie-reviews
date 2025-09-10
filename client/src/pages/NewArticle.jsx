import { useState } from 'react';
import styled from 'styled-components';
import ArticleForm from '../forms/ArticleForm';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';

const ArticleHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  max-width: 800px;
`;

const ArticleTitle = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5rem;
`;

const BackButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 20px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #5a6268;
  }
`;

function NewArticle() {
  const navigate = useNavigate();
  // Pass null to indicate this is a new article, not an existing one
  const [newArticle] = useState(null);

  const handleBack = () => {
    navigate('/articles');
  };

  return (
    <PageContainer>
      <BackButton onClick={handleBack}>
        ← Back to Articles
      </BackButton>
      
      <ArticleHeader>
        <ArticleTitle>Create New Article</ArticleTitle>
      </ArticleHeader>

      <ArticleForm initObj={newArticle} />
    </PageContainer>
  );
}

export default NewArticle;