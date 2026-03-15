import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getJSON, snakeToCamel } from '@helper';
import ArticleForm from '@forms/ArticleForm';
import CommentList from '@components/comments/CommentList';
import SEOHead from '@components/shared-sections/SEOHead';
import CoverHeader from '@components/shared-sections/CoverHeader';
import LikeButton from '@components/shared-sections/LikeButton';
import { UserContext } from '@context/userProvider';
import { generateArticleStructuredData, generateBreadcrumbStructuredData } from '@utils/seoUtils';
import Loading from '@components/ui/Loading';
import { StyledContainer } from '@styles';

const DEFAULT_ARTICLE_BACKDROP = "/images/default-article.jpeg";

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

const LikeBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

function Article() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getJSON(`reviews/${id}`);
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
      <StyledContainer>
        <Loading text="Loading article" size="large" />
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

  // Generate SEO data
  const seoTitle = article.title;
  const seoDescription = article.description || article.title;
  const structuredData = generateArticleStructuredData(article);
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: window.location.origin + '/#/' },
    { name: 'Articles', url: window.location.origin + '/#/articles' },
    { name: article.title, url: window.location.href }
  ]);

  const coverImageUrl =
    article.backdrop
      ? `/api/articles/${article.id}/backdrop/view?v=${encodeURIComponent(
          article.backdrop
        )}`
      : DEFAULT_ARTICLE_BACKDROP;

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
      <StyledContainer>
        <CoverHeader
          imageUrl={coverImageUrl}
          title={article.movie?.title || article.title}
          subtitle={article.movie?.title ? article.title : undefined}
          rating={article.rating}
          publishDate={article.dateAdded || article.date_added}
        />
        <LikeBar>
          <LikeButton
            type="review"
            id={article.id}
            likeCount={article.likeCount ?? 0}
            likedByMe={article.likedByMe ?? false}
            disabled={!user}
            onUpdate={(liked, likeCount) => {
              setArticle((prev) => (prev ? { ...prev, likedByMe: liked, likeCount } : prev));
            }}
          />
        </LikeBar>
        <ArticleForm initObj={article} />
        <CommentList reviewId={article.id} />
      </StyledContainer>
    </>
  );
}

export default Article;