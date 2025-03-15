import {useState, useEffect, useContext, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Outlet } from 'react-router-dom';
import { getJSON, snakeToCamel } from './helper';
import { UserContext } from './context/userProvider';
import { WindowWidthContext } from './context/windowSize'
import Loading from './pages/Loading';
import { StyledMain } from './MiscStyling';

function App() {

  const { isMobile } = useContext(WindowWidthContext);
  const [movies, setMovies] = useState([]);

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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movies = await getJSON('movies'); // Wait for the JSON
        if (movies) {  // Ensure movies is not null or undefined
          console.log('all', movies);
          setMovies(movies); // Set state with actual JSON
        } else {
          console.error("No movies data available.");
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };
  
    fetchMovies();
  }, []);
  
  return (
    <>
      <Header/>
        <StyledMain isMobile={isMobile}>
          <Suspense fallback={<Loading />}>
            <Outlet
                context={{
                  movies,
                  setMovies
                }}
              />
          </Suspense>
        </StyledMain>
      <Footer />
    </>
  );
}

export default App;