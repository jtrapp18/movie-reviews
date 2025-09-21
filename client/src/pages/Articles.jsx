import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MotionWrapper from '../styles/MotionWrapper';
import ArticleCard from '../cards/ArticleCard';
import SearchBar from '../components/SearchBar';
import PageContainer from '../components/PageContainer';
import { CardContainer } from '../styles';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


function Articles() {
  const { articles, setArticles } = useOutletContext();
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const fetchArticles = async (searchText = null) => {
    try {
      setIsSearching(true);
      let url = '/api/articles';
      if (searchText) {
        url += `?search=${encodeURIComponent(searchText)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      setArticles(data);
      setFilteredArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      setFilteredArticles([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = async (searchText) => {
    if (!searchText.trim()) {
      setFilteredArticles(articles);
    } else {
      // Use backend search which includes tags
      await fetchArticles(searchText);
    }
  };

  // Handle null or undefined articles
  if (!filteredArticles || !Array.isArray(filteredArticles)) {
    return (
      <PageContainer fullHeight>
        <MotionWrapper index={1}>
          <h1>Articles</h1>
        </MotionWrapper>
        <MotionWrapper index={2}>
          <h3>Loading articles...</h3>
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
            placeholder={isSearching ? "Searching..." : "Search articles by title, content, or tags (e.g., 'horror', 'analysis', 'hitchcock')..."}
          />
        </MotionWrapper>

        {/* Articles Carousel */}
        <div style={{ width: '100%', margin: '0 auto', height: '300px', overflow: 'hidden' }}>
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
                <div style={{ 
                  margin: '0',
                  width: '200px',
                  height: '100%',
                  flexShrink: 0
                }}>
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
