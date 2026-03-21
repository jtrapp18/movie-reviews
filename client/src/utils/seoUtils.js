// Utility functions for SEO and structured data

import { getGradingLabel } from '@utils/gradingTiers';

export const generateMovieReviewStructuredData = (movie, review) => {
  if (!movie || !review) return null;

  const baseUrl = window.location.origin;
  const reviewUrl = `${baseUrl}/#/movies/${movie.id}`;

  // Calculate average rating if multiple reviews exist
  const reviews = movie.reviews || [];
  const ratings = reviews.filter((r) => r.rating).map((r) => r.rating);
  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : review.rating;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Movie',
      name: movie.title,
      datePublished: movie.releaseDate,
      image: movie.coverPhoto,
      description: movie.overview,
      genre: movie.genres || [],
      actor: movie.cast || [],
      director: movie.director || 'Unknown',
      duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
      inLanguage: movie.originalLanguage,
      url: reviewUrl,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 10,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: 'Movie Reviews Hub',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Movie Reviews Hub',
      url: baseUrl,
    },
    datePublished: review.dateAdded,
    headline: review.title || `Review of ${movie.title}`,
    reviewBody: review.reviewText,
    url: reviewUrl,
  };

  // Add aggregate rating if multiple reviews exist
  if (ratings.length > 1) {
    structuredData.itemReviewed.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: ratings.length,
      bestRating: 10,
      worstRating: 1,
    };
  }

  return structuredData;
};

export const generateArticleStructuredData = (article) => {
  if (!article) return null;

  const baseUrl = window.location.origin;
  const articleUrl = `${baseUrl}/#/articles/${article.id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || article.title,
    image: article.image || `${baseUrl}/default-article-image.jpg`,
    author: {
      '@type': 'Person',
      name: 'Movie Reviews Hub',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Movie Reviews Hub',
      url: baseUrl,
    },
    datePublished: article.dateAdded,
    dateModified: article.dateAdded,
    url: articleUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };
};

export const generateWebsiteStructuredData = () => {
  const baseUrl = window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Movie Reviews Hub',
    url: baseUrl,
    description:
      'Discover detailed movie reviews, ratings, and insights from our comprehensive movie database.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/#/search_movies?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
};

export const generateBreadcrumbStructuredData = (items) => {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

// --- Detail pages: breadcrumbs + SEOHead copy (DRY entry points for Article / MovieReview) ---

function siteOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

function breadcrumbHome() {
  return { name: 'Home', url: `${siteOrigin()}/#/` };
}

function breadcrumbArticlesIndex() {
  return { name: 'Articles', url: `${siteOrigin()}/#/articles` };
}

function breadcrumbMoviesSearch() {
  return { name: 'Movies', url: `${siteOrigin()}/#/search_movies` };
}

/**
 * Breadcrumb JSON-LD for article detail (Home → Articles → title).
 */
export function buildArticleDetailBreadcrumbJsonLd(article) {
  if (!article) return null;
  return generateBreadcrumbStructuredData([
    breadcrumbHome(),
    breadcrumbArticlesIndex(),
    {
      name: article.title,
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  ]);
}

/**
 * Breadcrumb JSON-LD for movie review detail (Home → Movies search → title).
 */
export function buildMovieReviewDetailBreadcrumbJsonLd(movie) {
  if (!movie) return null;
  return generateBreadcrumbStructuredData([
    breadcrumbHome(),
    breadcrumbMoviesSearch(),
    {
      name: movie.title,
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  ]);
}

/** Combined Article + BreadcrumbList for SEOHead `structuredData` prop. */
export function buildArticleDetailPageStructuredData(article) {
  return [
    generateArticleStructuredData(article),
    buildArticleDetailBreadcrumbJsonLd(article),
  ].filter(Boolean);
}

/** Combined Review + BreadcrumbList for SEOHead `structuredData` prop. */
export function buildMovieReviewDetailPageStructuredData(movie, review) {
  return [
    generateMovieReviewStructuredData(movie, review),
    buildMovieReviewDetailBreadcrumbJsonLd(movie),
  ].filter(Boolean);
}

/** Title, description, keywords, hash path for article detail pages. */
export function buildArticleDetailSeoCopy(article) {
  if (!article) {
    return {
      title: '',
      description: '',
      keywords: '',
      canonicalPath: '',
    };
  }
  return {
    title: article.title,
    description: article.description || article.title,
    keywords: `${article.title}, movie article, film analysis, cinema`,
    canonicalPath: `/#/articles/${article.id}`,
  };
}

/** Title, description, keywords, hash path for movie review detail pages. */
export function buildMovieReviewDetailSeoCopy(movie, review) {
  if (!movie) {
    return {
      title: '',
      description: '',
      keywords: '',
      canonicalPath: '',
    };
  }
  const ratingLabel = review?.rating ? getGradingLabel(review.rating) : null;
  const title = review
    ? `${movie.title} Review${ratingLabel ? ` - ${ratingLabel}` : ''}`
    : `${movie.title} - Movie Review`;
  const description = review
    ? `${movie.title} movie review: ${review.reviewText.substring(0, 150)}...`
    : `Read our detailed review of ${movie.title} (${movie.releaseDate}). ${movie.overview.substring(0, 100)}...`;
  return {
    title,
    description,
    keywords: `${movie.title}, movie review, ${movie.originalLanguage}, ${movie.releaseDate}, film analysis`,
    canonicalPath: `/#/movies/${movie.id}`,
  };
}
