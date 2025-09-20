// Utility functions for SEO and structured data

export const generateMovieReviewStructuredData = (movie, review) => {
  if (!movie || !review) return null;

  const baseUrl = window.location.origin;
  const reviewUrl = `${baseUrl}/#/movies/${movie.id}`;
  
  // Calculate average rating if multiple reviews exist
  const reviews = movie.reviews || [];
  const ratings = reviews.filter(r => r.rating).map(r => r.rating);
  const averageRating = ratings.length > 0 ? 
    (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 
    review.rating;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Movie",
      "name": movie.title,
      "datePublished": movie.releaseDate,
      "image": movie.coverPhoto,
      "description": movie.overview,
      "genre": movie.genres || [],
      "actor": movie.cast || [],
      "director": movie.director || "Unknown",
      "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
      "inLanguage": movie.originalLanguage,
      "url": reviewUrl
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": 10,
      "worstRating": 1
    },
    "author": {
      "@type": "Person",
      "name": "Movie Reviews Hub"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Movie Reviews Hub",
      "url": baseUrl
    },
    "datePublished": review.dateAdded,
    "headline": review.title || `Review of ${movie.title}`,
    "reviewBody": review.reviewText,
    "url": reviewUrl
  };

  // Add aggregate rating if multiple reviews exist
  if (ratings.length > 1) {
    structuredData.itemReviewed.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": ratings.length,
      "bestRating": 10,
      "worstRating": 1
    };
  }

  return structuredData;
};

export const generateArticleStructuredData = (article) => {
  if (!article) return null;

  const baseUrl = window.location.origin;
  const articleUrl = `${baseUrl}/#/articles/${article.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description || article.title,
    "image": article.image || `${baseUrl}/default-article-image.jpg`,
    "author": {
      "@type": "Person",
      "name": "Movie Reviews Hub"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Movie Reviews Hub",
      "url": baseUrl
    },
    "datePublished": article.dateAdded,
    "dateModified": article.dateAdded,
    "url": articleUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    }
  };
};

export const generateWebsiteStructuredData = () => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Movie Reviews Hub",
    "url": baseUrl,
    "description": "Discover detailed movie reviews, ratings, and insights from our comprehensive movie database.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/#/search_movies?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateBreadcrumbStructuredData = (items) => {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};
