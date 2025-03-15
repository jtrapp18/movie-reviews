// routes.js
import App from "./App";
import Home from "./pages/Home";
import About from "./pages/About";
import AccountDetails from "./pages/AccountDetails";
import ErrorPage from "./pages/ErrorPage";
import Login from './pages/Login';
import SearchMovies from './pages/SearchMovies';
import MovieReview from './pages/MovieReview';

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "account_details",
        element: <AccountDetails />,
      },
      {
        path: "search_movies",
        element: <SearchMovies />,
      },
      {
        path: "movies/:id",
        element: <MovieReview />,
      }
    ],
  },
];

export default routes;
