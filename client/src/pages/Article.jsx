import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getJSON, snakeToCamel } from '../helper';
import ArticleForm from '../forms/ArticleForm';
import PageContainer from '../components/PageContainer';
import SEOHead from '../components/SEOHead';
import { generateArticleStructuredData, generateBreadcrumbStructuredData } from '../utils/seoUtils';

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

  // Generate SEO data
  const seoTitle = article.title;
  const seoDescription = article.description || article.title;
  const structuredData = generateArticleStructuredData(article);
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: window.location.origin + '/#/' },
    { name: 'Articles', url: window.location.origin + '/#/articles' },
    { name: article.title, url: window.location.href }
  ]);

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${article.title}, movie article, film analysis, cinema`}
        url={`/#/articles/${article.id}`}
        type="article"
        structuredData={[structuredData, breadcrumbData].filter(Boolean)}
      />
      <PageContainer>
        <ArticleForm initObj={article} />
      </PageContainer>
    </>
  );
}

export default Article;