import { useState, useEffect } from 'react';
import { getMovieInfo } from '../helper';
import { StyledCard } from '../MiscStyling';

function MovieCard({ originalLanguage, originalTitle, overview, 
    title, releaseDate, posterPath, backdropPath }) {

    return (
        <StyledCard>
            <h2>{title}</h2>
            <img
                src={posterPath}
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