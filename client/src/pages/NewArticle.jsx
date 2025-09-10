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


function NewArticle() {
  const navigate = useNavigate();
  // Pass null to indicate this is a new article, not an existing one
  const [newArticle] = useState(null);


  return (
    <PageContainer>
      <ArticleHeader>
        <ArticleTitle>Create New Article</ArticleTitle>
      </ArticleHeader>

      <ArticleForm initObj={newArticle} />
    </PageContainer>
  );
}

export default NewArticle;