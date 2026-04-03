import { useState } from 'react';
import { ArticleForm } from '@features/articles';
import { StyledContainer } from '@styles';

function NewArticle() {
  const [newArticle] = useState(null);

  return (
    <StyledContainer>
      <ArticleForm initObj={newArticle} />
    </StyledContainer>
  );
}

export default NewArticle;
