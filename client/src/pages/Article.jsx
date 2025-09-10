import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getJSON, snakeToCamel } from '../helper';
import ArticleForm from '../forms/ArticleForm';
import PageContainer from '../components/PageContainer';

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
`;

function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getJSON(`articles/${id}`);
        if (data.error) {
          setError(data.error);
        } else {
          const transformedData = snakeToCamel(data);
          setArticle(transformedData);
        }
      } catch (err) {
        setError('Failed to load article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);


  if (loading) {
    return (
      <PageContainer>
        <LoadingMessage>Loading article...</LoadingMessage>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </PageContainer>
    );
  }

  if (!article) {
    return (
      <PageContainer>
        <ErrorMessage>Article not found</ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ArticleForm initObj={article} />
    </PageContainer>
  );
}

export default Article;