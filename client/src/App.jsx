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
import { useTheme } from './context/themeProvider';

function App() {

  const { isMobile } = useContext(WindowWidthContext);
  const [movies, setMovies] = useState([]);
  const [articles, setArticles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [coreDataLoaded, setCoreDataLoaded] = useState(false);

  // Restore user from session so comments (and any other auth) work after refresh
  const { setUser } = useContext(UserContext);
  const { setTheme } = useTheme();
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getJSON('check_session');
      if (user) {
        setUser(user);
        if (typeof user.darkMode === 'boolean') {
          setTheme(user.darkMode ? 'dark' : 'light');
        }
      }
    };
    fetchUser();
  }, [setUser]);

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
      {/* <ThemeToggle /> */}
    </div>
  );
}

export default App;