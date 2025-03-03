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
  const { user, setUser } = useContext(UserContext);

  console.log('reloading app page...')

  // Auto-login
  useEffect(() => {
    console.log('logging check session...')
    getJSON("check_session")
      .then((user) => {
        const userTransformed = snakeToCamel(user);
        if (JSON.stringify(userTransformed) !== JSON.stringify(user)) {
          setUser(userTransformed);
        }
      });
  }, []);

  // Fetching general graph data (available to everyone)
  useEffect(() => {
    console.log('logging graphs...')
    getJSON("graph_data")
      .then((data) => {
        setGraphData(snakeToCamel(data));
      });
  }, []);

  return (
    <>
      <Header/>
        <StyledMain isMobile={isMobile}>
          <Suspense fallback={<Loading />}>
            <Outlet
                context={{
                }}
              />
          </Suspense>
        </StyledMain>
      <Footer />
    </>
  );
}

export default App;