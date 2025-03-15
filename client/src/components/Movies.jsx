import SearchBar from './SearchBar';
import { CardContainer } from '../MiscStyling';
import MovieCard from '../cards/MovieCard';
import styled from 'styled-components';
import MotionWrapper from '../styles/MotionWrapper'

const StyledContainer = styled.div``

function Movies({ showMovies, enterSearch }) {

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
                            movie={movie}
                        />
                    </MotionWrapper>
                )}
            </CardContainer>
        </StyledContainer>
    );
}

export default Movies;