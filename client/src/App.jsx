import {useState, useEffect, useContext, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Outlet } from 'react-router-dom';
import { getJSON, snakeToCamel } from './helper';
import { UserContext } from './context/userProvider';
import { WindowWidthContext } from './context/windowSize'
import Loading from './components/ui/Loading';
import { StyledMain } from './styles';
import ThemeToggle from './components/ThemeToggle';

function App() {

  const { isMobile } = useContext(WindowWidthContext);
  const [movies, setMovies] = useState([]);
  const [articles, setArticles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [coreDataLoaded, setCoreDataLoaded] = useState(false);

  // Auto-login
  useEffect(() => {
    console.log('logging check session...')
    const fetchUser = async () => {
      const user = await getJSON('check_session'); // Wait for the JSON
      if (JSON.stringify(user) !== JSON.stringify(user)) {
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  // Load core data early so Home, Articles, Directors feel instant
  useEffect(() => {
    const fetchMovies = async () => getJSON('movies');
    const fetchReviews = async () => getJSON('reviews');
    const fetchArticles = async () => getJSON('articles');
    const fetchDirectors = async () => getJSON('directors');

    const loadAll = async () => {
      try {
        const [moviesData, reviewsData, articlesData, directorsData] =
          await Promise.all([
            fetchMovies(),
            fetchReviews(),
            fetchArticles(),
            fetchDirectors(),
          ]);

        if (moviesData) setMovies(moviesData);
        if (Array.isArray(reviewsData)) {
          setPosts(
            [...reviewsData].sort(
              (a, b) =>
                new Date(b.dateAdded || b.date_added || 0) -
                new Date(a.dateAdded || a.date_added || 0)
            )
          );
        }
        if (articlesData != null) setArticles(Array.isArray(articlesData) ? articlesData : []);
        if (Array.isArray(directorsData)) setDirectors(directorsData);
      } catch (err) {
        console.error('Error loading app data:', err);
      } finally {
        setCoreDataLoaded(true);
      }
    };

    loadAll();
  }, []);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header/>
      <StyledMain isMobile={isMobile} style={{ flex: 1 }}>
        <Suspense fallback={<Loading />}>
          <Outlet
              context={{
                movies,
                setMovies,
                articles,
                setArticles,
                posts,
                setPosts,
                directors,
                setDirectors,
                coreDataLoaded,
              }}
            />
        </Suspense>
      </StyledMain>
      <Footer />
      <ThemeToggle />
    </div>
  );
}

export default App;