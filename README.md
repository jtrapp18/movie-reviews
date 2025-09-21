# Jamie Trapp Movie Articles
[Click to Navigate to Deployed Project](https://jamie-trapp-movie-articles.up.railway.app/)

## About this project

**Jamie Trapp Movie Articles** is a comprehensive platform for movie reviews, ratings, and film analysis. Users can browse detailed movie reviews, rate films, read in-depth articles about cinema, and discover new movies through an intuitive search interface. 

## Demo

See this gif for an example of how the app works.

![demo](https://raw.githubusercontent.com/jtrapp18/jamie-trapp-movie-articles/refs/heads/main/client/public/images/movie-articles-demo.gif)

## Features

- **Movie Reviews**: Comprehensive movie reviews with detailed analysis and ratings
- **Star Ratings**: Interactive star rating system for user feedback
- **Movie Search**: Advanced search functionality to find movies by title, genre, or other criteria
- **Article System**: In-depth articles about film analysis, cinema history, and movie culture
- **User Authentication**: Secure login system for personalized experiences
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **SEO Optimized**: Proper meta tags and structured data for search engine visibility
- **Rich Text Editor**: Advanced text editing capabilities for articles and reviews

## Technical Details

- **Full-Stack Development**: Built with React on the frontend and Flask on the backend for a modern, responsive user experience.
- **Full CRUD Actions**: Supports Create, Read, Update, and Delete functionality for hive data, users, and inspections.
- **Machine Learning Integration**: Models stored using `joblib` to analyze hive health and predict honey production.
- **RESTful API**: Flask-based backend providing structured API endpoints for seamless communication with the React frontend.
- **SQLAlchemy ORM**: Manages database interactions efficiently with full support for relational data.
- **Secure Authentication**: Implements JWT authentication for user login and session management.
- **Data Cleaning & Processing**: Python scripts clean and structure beekeeping data for analysis.
- **Graphing & Analytics**: Uses Plotly in React to visualize hive trends, with interactive features such as zooming and dynamic filtering.
- **Docker Deployment**: The project is containerized for easy deployment using Docker.
- **Cloud Hosting**: Deployed on Railway for scalability and efficient management.
- **State Management**: Uses React Context API to handle global application state.

## File Structure

### Client (Frontend - React)

- **`src/cards/`** - Contains JSX components for displaying movie and article information in card format.
- **`src/components/`** - Reusable UI elements such as buttons, modals, navbar, and search functionality.
- **`src/context/`** - Manages global state, including user authentication and UI preferences.
- **`src/forms/`** - Components for handling user input, such as login, article creation, and reviews.
- **`src/pages/`** - Main route components such as `Home`, `MovieReview`, `Articles`, and `SearchMovies`.
- **`src/styles/`** - Reusable UI elements such as error messages, forms, and modals.
- **`App.jsx`** - Root component handling routing and global context providers.
- **`helper.js`** - Utility functions used throughout the frontend.
- **`routes.jsx`** - Defines frontend route structure.
- **`index.css`** - Global styles.
- **`main.jsx`** - Application entry point.

### Server (Backend - Flask)

- **`lib/models/`** - SQLAlchemy models defining the database schema for movies, articles, users, and reviews.
- **`lib/seeding/`** - Scripts for database seeding, including sample movie data and article content.
- **`lib/config.py`** - Configuration file for database and application settings.
- **`lib/migrations/`** - Handles database schema migrations.
- **`app.py`** - Main Flask application file handling API routes and business logic.
- **`Dockerfile`** - Defines containerization setup for deployment.
- **`requirements.txt`** - Lists dependencies for the backend.

## Contributors

**Jamie Trapp**  
GitHub: [JTrapp18](https://github.com/jtrapp18)
