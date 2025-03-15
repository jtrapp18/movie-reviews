import { useNavigate, useOutletContext } from "react-router-dom";
import { StyledCard } from '../MiscStyling';
import useCrudStateDB from "../hooks/useCrudStateDB";

function MovieCard({ movie }) {

    const { originalLanguage, originalTitle, overview, 
        title, releaseDate, coverPhoto } = movie;

    const navigate = useNavigate();
    const { setMovies } = useOutletContext();

    const handleClick = async () => {  // Mark handleClick as async
        if (!movie.id) {
            const { addItem } = useCrudStateDB(setMovies, "movies");
            const newId = await addItem(movie); // Use await correctly
    
            navigate(`/movies/${newId}`);
        }
        else {
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