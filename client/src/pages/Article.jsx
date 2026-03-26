import { useContext } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useArticle } from '@features/articles/useArticle';
import { Articles as ArticlesCarousel } from '@features/articles';
import { ArticleForm } from '@features/articles';
import { CommentList } from '@features/comments';
import SEOHead from '@components/shared-sections/SEOHead';
import { CoverHeader, LikeButton } from '@features/reviews';
import { UserContext } from '@context/userProvider';
import {
  buildArticleDetailPageStructuredData,
  buildArticleDetailSeoCopy,
} from '@utils/seoUtils';
import { StyledContainer } from '@styles';
import EntityDetailState from '@components/layout/EntityDetailState';
import {
  DetailContentCard,
  DetailBelowFold,
  LikeBar,
  RelatedSection,
  RelatedHeading,
} from '@components/layout/detailPageStyles';

const DEFAULT_ARTICLE_BACKDROP = '/images/default-article.jpeg';

function Article() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const { articles = [] } = useOutletContext();
  const reviewId = id ? parseInt(id, 10) : null;
  const { article, loading, error, setArticle } = useArticle(reviewId);

  return (
    <EntityDetailState
      loading={loading}
      loadingText="Loading article"
      error={error}
      missing={!article}
      missingMessage="Article not found"
    >
      {article && (
        <ArticleBody
          article={article}
          articles={articles}
          user={user}
          setArticle={setArticle}
        />
      )}
    </EntityDetailState>
  );
}

function ArticleBody({ article, articles, user, setArticle }) {
  const seo = buildArticleDetailSeoCopy(article);
  const structuredData = buildArticleDetailPageStructuredData(article);
  const coverImageUrl = article.backdrop
    ? `/api/articles/${article.id}/backdrop/view?v=${encodeURIComponent(article.backdrop)}`
    : DEFAULT_ARTICLE_BACKDROP;
  const relatedArticles = Array.isArray(articles)
    ? articles.filter((candidate) => candidate?.id !== article.id).slice(0, 12)
    : [];

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={seo.canonicalPath}
        type="article"
        structuredData={structuredData}
      />
      <StyledContainer>
        <DetailContentCard>
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
        </DetailContentCard>
        <DetailBelowFold>
          <CommentList reviewId={article.id} />
          {relatedArticles.length > 0 && (
            <RelatedSection>
              <RelatedHeading>More Articles</RelatedHeading>
              <ArticlesCarousel showArticles={relatedArticles} />
            </RelatedSection>
          )}
        </DetailBelowFold>
      </StyledContainer>
    </>
  );
}

export default Article;
