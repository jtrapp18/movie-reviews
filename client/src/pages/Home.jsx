import { getJSON, getMovieInfo } from '../helper';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper'
import Movies from '../components/Movies';
import Articles from '../components/Articles';
import { useOutletContext, useNavigate } from 'react-router-dom';

const StyledContainer = styled.div`
  padding: 0;
  margin-top: 20px;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function Home() {
  const { movies } = useOutletContext();
  const navigate = useNavigate();
  
  const [showMovies, setShowMovies] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showArticles, setShowArticles] = useState([]);

  useEffect(() => {
    setShowMovies(movies);
  }, [movies]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getJSON('articles');
        setArticles(data);
        setShowArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
        setShowArticles([]);
      }
    };
    
    fetchArticles();
  }, []);

  const enterSearch = (text) => {
    // Filter movies based on the search text
    const filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(text.toLowerCase())
    );
    setShowMovies(filteredMovies);
  };

  const enterArticleSearch = (text) => {
    // Filter articles based on the search text
    const filteredArticles = articles.filter((article) =>
      article.title?.toLowerCase().includes(text.toLowerCase()) ||
      article.review_text?.toLowerCase().includes(text.toLowerCase()) ||
      article.tags?.some(tag => tag.name.toLowerCase().includes(text.toLowerCase()))
    );
    setShowArticles(filteredArticles);
  };


  return (
    <StyledContainer>
        <MotionWrapper index={1}>
          <h1>Movies</h1>
        </MotionWrapper>
        <MotionWrapper index={2}>
          <h3>Click movie to view review</h3>
        </MotionWrapper>
        <Movies
          showMovies={showMovies}
          enterSearch={enterSearch}
        />
        
        <MotionWrapper index={3}>
          <h1>Articles</h1>
        </MotionWrapper>
        <MotionWrapper index={4}>
          <h3>Browse theme-based articles and essays</h3>
        </MotionWrapper>
        <Articles
          showArticles={showArticles}
          enterSearch={enterArticleSearch}
        />
    </StyledContainer>
  );
}

export default Home;