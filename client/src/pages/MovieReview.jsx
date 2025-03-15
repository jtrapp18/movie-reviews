import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import { getJSON } from '../helper';
import ReviewForm from '../forms/ReviewForm';

function MovieReview() {
    const [movie, setMovie] = useState(null);
    const { id } = useParams();
    const movieId = parseInt(id);

    useEffect(()=>{
        const fetchMovie = async () => {
            const movie = await getJSON('movies', movieId); // Wait for the JSON
            setMovie(movie); // Set state with actual JSON
          };
        
          fetchMovie();
    }, [])

    if (!movie) return <h1>Loading...</h1>

    const review = movie.reviews.length === 0 ? null : movie.reviews[0];

    return (
        <StyledContainer>
            <MovieCard movie={movie} />
            <ReviewForm initObj={review}/>
        </StyledContainer>
    );
}

export default MovieReview;