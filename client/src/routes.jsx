// routes.js
import App from "./App";
import Home from "./pages/Home";
import About from "./pages/About";
import ErrorPage from "./pages/ErrorPage";
import Login from './pages/Login';
import SearchMovies from './pages/SearchMovies';
import MovieReview from './pages/MovieReview';
import Articles from './pages/Articles';
import Article from './pages/Article';
import NewArticle from './pages/NewArticle';
import Admin from './pages/Admin';

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
        path: "search_movies",
        element: <SearchMovies />,
      },
      {
        path: "movies/:id",
        element: <MovieReview />,
      },
      {
        path: "articles",
        element: <Articles />,
      },
      {
        path: "articles/:id",
        element: <Article />,
      },
      {
        path: "articles/new",
        element: <NewArticle />,
      },
      {
        path: "admin",
        element: <Admin />,
      }
    ],
  },
];

export default routes;
