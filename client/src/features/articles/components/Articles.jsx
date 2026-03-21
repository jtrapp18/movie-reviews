import { CardContainer, Button } from '@styles';
import ArticleCard from '@components/cards/ArticleCard';
import styled from 'styled-components';
import Carousel, { ArticleCarouselSlide } from '@components/shared-sections/Carousel';
import Loading from '@components/ui/Loading';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@hooks/useAdmin';

const AddButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 2% auto 20px auto;
  flex-wrap: wrap;
`;

function Articles({ showArticles }) {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

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
        {showArticles.map((article) => (
          <ArticleCarouselSlide key={article.id}>
            <ArticleCard article={article} />
          </ArticleCarouselSlide>
        ))}
      </Carousel>

      {isAdmin && (
        <AddButtonContainer>
          <Button onClick={handleAddNew}>+ Add New Article</Button>
        </AddButtonContainer>
      )}
    </CardContainer>
  );
}

export default Articles;
