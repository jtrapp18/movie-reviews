import { useState } from 'react';
import styled from 'styled-components';
import ArticleForm from '../forms/ArticleForm';
import { useNavigate } from 'react-router-dom';
import { StyledContainer} from '../MiscStyling';

function NewArticle() {
  const navigate = useNavigate();
  // Pass null to indicate this is a new article, not an existing one
  const [newArticle] = useState(null);


  return (
    <StyledContainer>
      <ArticleForm initObj={newArticle} />
    </StyledContainer>
  );
}

export default NewArticle;