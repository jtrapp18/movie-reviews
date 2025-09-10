import { getJSON, getMovieInfo } from '../helper';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Movies from '../components/Movies';
import Articles from '../components/Articles';
import Section from '../components/Section';
import { useOutletContext, useNavigate } from 'react-router-dom';

const StyledContainer = styled.div`
  padding: 0;
  margin-top: 20px;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 100vh;
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
      <Section
        title="Movies"
        subtitle="Click movie to view review"
        searchPlaceholder="Search movies..."
        onSearch={enterSearch}
      >
        <Movies
          showMovies={showMovies}
          enterSearch={enterSearch}
        />
      </Section>
      
      <Section
        title="Articles"
        subtitle="Browse theme-based articles and essays"
        searchPlaceholder="Search articles by title, content, or tags..."
        onSearch={enterArticleSearch}
      >
        <Articles
          showArticles={showArticles}
          enterSearch={enterArticleSearch}
        />
      </Section>
    </StyledContainer>
  );
}

export default Home;