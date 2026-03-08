import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StyledContainer } from '../styles';
import { getJSON } from '../helper';
import SEOHead from '../components/SEOHead';
import Loading from '../components/ui/Loading';
import DirectorBio from '../components/DirectorBio';
import SearchResultsGrid from '../components/SearchResultsGrid';

function Director() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [director, setDirector] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDirector = async () => {
      try {
        setLoading(true);
        const data = await getJSON('directors', id);
        if (data && !data.error) {
          setDirector(data);
          setMovies(data.movies || []);
        } else {
          setError(data?.error || 'Director not found');
        }
      } catch (err) {
        console.error('Error fetching director:', err);
        setError('Failed to load director details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDirector();
    }
  }, [id]);

  if (loading) {
    return (
      <StyledContainer>
        <Loading text="Loading director" compact={true} />
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <h1>Error: {error}</h1>
      </StyledContainer>
    );
  }

  if (!director) {
    return (
      <StyledContainer>
        <h1>Director not found</h1>
      </StyledContainer>
    );
  }

  const handleMovieClick = (movie) => {
    if (movie && movie.id) {
      navigate(`/movies/${movie.id}`);
    }
  };

  const pageTitle = `${director.name} - Director`;
  const pageDescription =
    director.biography && director.biography.length > 150
      ? `${director.biography.slice(0, 150)}…`
      : director.biography || `Films directed by ${director.name}.`;

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords={`${director.name}, film director, movies by ${director.name}`}
        image={director.coverPhoto}
        url={`/#/directors/${director.id}`}
        type="profile"
        structuredData={null}
      />
      <StyledContainer>
        <DirectorBio
          director={director}
        />

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          Movies by {director.name}
        </h2>
        <SearchResultsGrid
          searchQuery={`Films by ${director.name}`}
          movies={movies}
          onMovieClick={handleMovieClick}
        />
      </StyledContainer>
    </>
  );
}

export default Director;

