import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getJSON, snakeToCamel } from '../helper';
import ArticleForm from '../forms/ArticleForm';

const StyledContainer = styled.div`
  min-height: calc(100vh - var(--height-header) - 4px);
  padding: 20px;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

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

const ArticleMeta = styled.div`
  color: #666;
  font-size: 1rem;
  margin-bottom: 20px;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tag = styled.span`
  background-color: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

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
        console.log('Fetching article with ID:', id);
        const data = await getJSON(`articles/${id}`);
        console.log('Article data received:', data);
        if (data.error) {
          setError(data.error);
        } else {
          const transformedData = snakeToCamel(data);
          console.log('Transformed article data:', transformedData);
          console.log('hasDocument:', transformedData.hasDocument);
          console.log('documentFilename:', transformedData.documentFilename);
          console.log('documentType:', transformedData.documentType);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <StyledContainer>
        <LoadingMessage>Loading article...</LoadingMessage>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </StyledContainer>
    );
  }

  if (!article) {
    return (
      <StyledContainer>
        <ErrorMessage>Article not found</ErrorMessage>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <ArticleHeader>
        <ArticleTitle>{article.title || 'Untitled Article'}</ArticleTitle>
        <ArticleMeta>
          Published on {formatDate(article.dateAdded)}
        </ArticleMeta>
        
        {article.tags && article.tags.length > 0 && (
          <TagContainer>
            {article.tags.map((tag, index) => (
              <Tag key={index}>{tag.name}</Tag>
            ))}
          </TagContainer>
        )}
      </ArticleHeader>

      <ArticleForm initObj={article} />
    </StyledContainer>
  );
}

export default Article;
