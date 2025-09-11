import { useNavigate, useOutletContext } from "react-router-dom";
import { StyledCard } from '../MiscStyling';
import useCrudStateDB from "../hooks/useCrudStateDB";
import { useAdmin } from '../hooks/useAdmin';

function MovieCard({ movie }) {

    const { originalLanguage, originalTitle, overview, 
        title, releaseDate, coverPhoto } = movie;

    const navigate = useNavigate();
    const { setMovies } = useOutletContext();
    const { isAdmin } = useAdmin();

    const handleClick = async () => {  // Mark handleClick as async
        console.log('MovieCard handleClick called with movie:', movie);
        console.log('movie.id:', movie.id);
        console.log('!movie.id:', !movie.id);
        
        if (!movie.id) {
            // External movie - check if admin
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
                const newId = await addItem(movie); // Use await correctly
                console.log('Created movie with newId:', newId);
                navigate(`/movies/${newId}`);
            } else {
                console.log('User cancelled - not creating movie');
            }
        }
        else {
            console.log('Navigating to existing movie with id:', movie.id);
            navigate(`/movies/${movie.id}`);
        }
    };

    return (
        <StyledCard onClick={handleClick}>
            <h2>{title}</h2>
            <img
                src={coverPhoto}
                alt={`${title} poster`}
            />

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