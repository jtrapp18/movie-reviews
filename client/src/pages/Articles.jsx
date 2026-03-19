import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MotionWrapper from '@styles/MotionWrapper';
import ArticleCard from '@components/cards/ArticleCard';
import SearchBar from '@components/shared-sections/SearchBar';
import PageContainer from '@components/layout/PageContainer';
import { CardContainer } from '@styles';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useArticlesList } from '@features/articles/useArticlesList';

function Articles() {
  const { articles: contextArticles, setArticles: setContextArticles, coreDataLoaded } =
    useOutletContext();
  const { articles, loading, fetchArticles } = useArticlesList(contextArticles);
  const [filteredArticles, setFilteredArticles] = useState(articles ?? []);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setFilteredArticles(articles ?? []);
  }, [articles]);

  // Slick carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    centerMode: false,
    variableWidth: true,
    adaptiveHeight: false,
    arrows: true,
  };

  const handleSearch = async (searchText) => {
    if (!searchText.trim()) {
      setFilteredArticles(articles);
    } else {
      // Use backend search which includes tags
      setIsSearching(true);
      const data = await fetchArticles(searchText);
      setFilteredArticles(data);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // keep outlet context in sync with cached list (base list only)
    if (!loading && articles && articles.length && setContextArticles) {
      setContextArticles(articles);
    }
  }, [articles, loading, setContextArticles]);

  const isLoading =
    (!coreDataLoaded && (!articles || articles.length === 0)) || loading;
  if (!filteredArticles || !Array.isArray(filteredArticles) || isLoading) {
    return (
      <PageContainer fullHeight>
        <MotionWrapper index={1}>
          <h1>Articles</h1>
        </MotionWrapper>
        <MotionWrapper index={2}>
          <h3>{isLoading ? 'Loading articles...' : 'No articles yet.'}</h3>
        </MotionWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer fullHeight>
      <MotionWrapper index={1}>
        <h1>Articles</h1>
      </MotionWrapper>
      <MotionWrapper index={2}>
        <h3>Browse theme-based articles and essays</h3>
      </MotionWrapper>

      <CardContainer>
        <MotionWrapper index={0}>
          <SearchBar
            key="articles-search"
            enterSearch={handleSearch}
            placeholder={
              isSearching
                ? 'Searching...'
                : "Search articles by title, content, or tags (e.g., 'horror', 'analysis', 'hitchcock')..."
            }
          />
        </MotionWrapper>

        {/* Articles Carousel */}
        <div
          style={{
            width: '100%',
            margin: '0 auto',
            height: '300px',
            overflow: 'hidden',
          }}
        >
          <style>
            {`
              .slick-slide > div {
                margin: 0 6px;
              }

              /* Arrow styles */
              .slick-prev,
              .slick-next {
                z-index: 10;
                width: 40px;
                height: 40px;
                background-color: rgba(255, 255, 255, 0.9);
                border: 2px solid #333;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              }

              .slick-prev {
                left: 10px;
              }

              .slick-next {
                right: 10px;
              }

              .slick-prev:hover,
              .slick-next:hover {
                background-color: #007bff !important;
                border-color: #007bff;
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                transition: all 0.2s ease;
              }

              .slick-prev:before,
              .slick-next:before {
                font-size: 18px;
                color: #333;
                font-weight: bold;
              }

              .slick-prev:hover:before,
              .slick-next:hover:before {
                color: white;
              }

              .slick-disabled {
                opacity: 0.3;
              }
            `}
          </style>
          <Slider {...settings}>
            {filteredArticles.map((article, index) => (
              <MotionWrapper key={article.id} index={index}>
                <div
                  style={{
                    margin: '0',
                    width: '200px',
                    height: '100%',
                    flexShrink: 0,
                  }}
                >
                  <ArticleCard article={article} />
                </div>
              </MotionWrapper>
            ))}
          </Slider>
        </div>
      </CardContainer>
    </PageContainer>
  );
}

export default Articles;
