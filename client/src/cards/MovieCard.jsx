import { useNavigate, useOutletContext } from "react-router-dom";
import { StyledCard } from '../MiscStyling';
import useCrudStateDB from "../hooks/useCrudStateDB";
import { useAdmin } from '../hooks/useAdmin';
import StarRatingOverlay from '../components/StarRatingOverlay';

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
            {rating && <StarRatingOverlay rating={rating} />}
            <h2>{title}</h2>

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