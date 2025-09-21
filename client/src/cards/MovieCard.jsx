import { useNavigate, useOutletContext } from "react-router-dom";
import styled from 'styled-components';
import useCrudStateDB from "../hooks/useCrudStateDB";
import { useAdmin } from '../hooks/useAdmin';
import StarRatingOverlay from '../components/StarRatingOverlay';

const StyledCard = styled.article`
  position: relative;
  width: 200px;
  height: 280px;
  max-height: 90vh;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  h2 {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    color: white;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.7) 50%,
      rgba(0, 0, 0, 0.3) 80%,
      transparent 100%
    );
    padding: 0.6rem 0;
    margin: 0;
    text-align: center;
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(1px);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-height: fit-content;
    box-sizing: border-box;
    word-wrap: break-word;
    hyphens: auto;
    line-height: 1.2;
  }

  &:hover h2 {
    opacity: 0;
  }

  img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  .movie-details {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    padding: 3%;
    align-items: start;
    font-size: clamp(0.7rem, 2vw, 0.9rem);
    line-height: 1.3;
    transition: all 0.3s ease;

    .movie-metadata {
      padding: 0;
      align-items: start;

      p {
        margin: 0;
        font-size: clamp(0.65rem, 1.8vw, 0.8rem);
      }
    }

    p {
      font-size: clamp(0.6rem, 1.5vw, 0.75rem);
      line-height: 1.2;
    }
  }

  &:hover .movie-details {
    opacity: 1;
    background: rgba(0, 0, 0, .8);
  }
`;

function MovieCard({ movie, rating = null }) {

    const { originalLanguage, originalTitle, overview, 
        title, releaseDate, coverPhoto } = movie;

    const navigate = useNavigate();
    const { setMovies } = useOutletContext();
    const { isAdmin } = useAdmin();

    const handleClick = async () => {  // Mark handleClick as async
        console.log('MovieCard handleClick called with movie:', movie);
        console.log('movie.id:', movie.id);
        console.log('rating:', rating);
        
        // If we have a rating, this movie exists locally - navigate to it
        if (rating) {
            console.log('Movie has local rating - navigating to existing review');
            navigate(`/movies/${movie.id}`);
            return;
        }
        
        // External movie without local review - check if admin
        if (!isAdmin) {
            console.log('Non-admin user clicked external movie - showing no reviews message');
            alert(`No reviews available for "${title}".`);
            return;
        }
        
        console.log('Admin user - showing confirmation dialog');
        const confirmed = window.confirm(`Do you want to add a review for "${title}"?`);
        if (confirmed) {
            console.log('User confirmed - creating new movie');
            const { addItem } = useCrudStateDB(setMovies, "movies");
            // Add externalId to the movie data for backend
            const movieData = {
                ...movie,
            };
            const newId = await addItem(movieData); // Use await correctly
            console.log('Created movie with newId:', newId);
            navigate(`/movies/${newId}`);
        } else {
            console.log('User cancelled - not creating movie');
        }
    };

    return (
        <StyledCard onClick={handleClick}>
            <img
                src={coverPhoto}
                alt={`${title} poster`}
            />
            <h2>
                {title}
                {rating && <StarRatingOverlay rating={rating} />}
            </h2>

            <div className='movie-details'>
                <div className='movie-metadata'>
                    <p><b>Release Date: </b>{releaseDate}</p>
                    <p><b>Original Language: </b>{originalLanguage}</p>
                    <p><b>Original Title: </b>{originalTitle}</p>
                </div>
                <br />
                <p>{overview}</p>
            </div>
        </StyledCard>
    );
}

export default MovieCard;