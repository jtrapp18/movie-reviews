import { useState, useEffect } from 'react';
import { getMovieInfo } from '../helper';
import SearchBar from './SearchBar';
import { CardContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper'

const StyledContainer = styled.div``

function Movies() {
    const [showMovies, setShowMovies] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
          const movies = await getMovieInfo(); // Wait for the JSON
          setShowMovies(movies); // Set state with actual JSON
          console.log(movies); // Logs actual JSON, not a Promise
        };
      
        fetchMovies();
      }, []);

    const enterSearch = (text) => {
        const movies = getMovieInfo(text)
        setShowMovies(movies)
    }

    return (
        <StyledContainer>
            <SearchBar
                enterSearch={enterSearch}
            />
            <CardContainer>
                {showMovies.map((movie, index) =>
                    <MotionWrapper
                        key={movie.title}
                        index={index}
                    >
                        <MovieCard
                            {...movie}
                        />
                    </MotionWrapper>
                )}
            </CardContainer>
        </StyledContainer>
    );
}

export default Movies;