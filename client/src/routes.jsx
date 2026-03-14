// routes.js
import App from "./App";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ErrorPage from "./pages/ErrorPage";
import Login from './pages/Login';
import SearchMovies from './pages/SearchMovies';
import MovieReview from './pages/MovieReview';
import Articles from './pages/Articles';
import Article from './pages/Article';
import NewArticle from './pages/NewArticle';
import Director from './pages/Director';
import DirectorsPage from './pages/DirectorsPage';
import Account from './pages/Account';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "search_movies",
        element: <SearchMovies />,
      },
      {
        path: "directors",
        element: <DirectorsPage />,
      },
      {
        path: "movies/:id",
        element: <MovieReview />,
      },
      {
        path: "directors/:id",
        element: <Director />,
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
        path: "account",
        element: <Account />,
      },
    ],
  },
];

export default routes;
