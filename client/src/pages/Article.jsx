import { useContext } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { useArticle } from '@features/articles/useArticle';
import { Articles as ArticlesCarousel } from '@features/articles';
import ArticleForm from '@forms/ArticleForm';
import CommentList from '@components/comments/CommentList';
import SEOHead from '@components/shared-sections/SEOHead';
import { CoverHeader, LikeButton } from '@features/reviews';
import { UserContext } from '@context/userProvider';
import {
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
} from '@utils/seoUtils';
import Loading from '@components/ui/Loading';
import { StyledContainer } from '@styles';

const DEFAULT_ARTICLE_BACKDROP = '/images/default-article.jpeg';

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
  justify-content: center;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

const ArticleContainer = styled.div`
  margin: 1rem 0 2rem 0;
  width: 100%;
  background: var(--background-secondary);
  border-radius: 8px;
  overflow: hidden;
`;

const MoreArticlesSection = styled.section`
  margin-top: 1.25rem;
  width: 100%;
`;

const MoreArticlesHeading = styled.h2`
  margin-bottom: 0.75rem;
`;

function Article() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const { articles = [] } = useOutletContext();
  const reviewId = id ? parseInt(id, 10) : null;
  const { article, loading, error, setArticle } = useArticle(reviewId);

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
    { name: article.title, url: window.location.href },
  ]);

  const coverImageUrl = article.backdrop
    ? `/api/articles/${article.id}/backdrop/view?v=${encodeURIComponent(
        article.backdrop
      )}`
    : DEFAULT_ARTICLE_BACKDROP;
  const relatedArticles = Array.isArray(articles)
    ? articles.filter((candidate) => candidate?.id !== article.id).slice(0, 12)
    : [];

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
        <ArticleContainer>
          <CoverHeader
            imageUrl={coverImageUrl}
            pretitle="A James Trapp Article"
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
                setArticle((prev) =>
                  prev ? { ...prev, likedByMe: liked, likeCount } : prev
                );
              }}
            />
          </LikeBar>
          <ArticleForm initObj={article} />
        </ArticleContainer>
        <CommentList reviewId={article.id} />
        {relatedArticles.length > 0 && (
          <MoreArticlesSection>
            <MoreArticlesHeading>More Articles</MoreArticlesHeading>
            <ArticlesCarousel showArticles={relatedArticles} />
          </MoreArticlesSection>
        )}
      </StyledContainer>
    </>
  );
}

export default Article;
