import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { getJSON, snakeToCamel } from './helper';
import ArticleForm from '../forms/ArticleForm';
import { StyledContainer } from '../MiscStyling';

function ArticleReview() {
  const { id } = useParams();
  const { setMovies } = useOutletContext();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const articleData = await getJSON(`articles/${id}`);
        if (articleData) {
          setArticle(snakeToCamel(articleData));
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  if (loading) {
    return <h1>Loading article...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  if (!article) {
    return <h1>Article not found</h1>;
  }

  return (
    <StyledContainer>
      <ArticleForm initObj={article} />
    </StyledContainer>
  );
}

export default ArticleReview;
