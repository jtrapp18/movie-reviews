import { useEffect, useMemo, useState } from 'react';
import { StyledContainer, Button } from '../styles';
import { getJSON } from '../helper';
import Loading from '../components/ui/Loading';
import DirectorCard from '../cards/DirectorCard';
import MoviesGrid from '../components/MoviesGrid';
import DirectorBio from '../components/DirectorBio';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const PageHeader = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  margin: 0 0 0.25rem 0;
  text-align: left;
`;

const Intro = styled.p`
  margin: 0;
  color: var(--font-color-2);
`;

const SearchRow = styled.div`
  margin: 1.5rem 0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  input {
    max-width: 260px;
  }
`;

const AccordionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AccordionHeader = styled.div`
  cursor: pointer;
`;

const AccordionBody = styled.div`
  margin-top: 8px;
  padding: 12px 16px 16px;
  border-radius: 8px;
  background: var(--background-secondary);
`;

function DirectorsPage() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        setLoading(true);
        const data = await getJSON('directors');
        setDirectors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching directors:', err);
        setError('Failed to load directors');
      } finally {
        setLoading(false);
      }
    };

    fetchDirectors();
  }, []);

  const filteredDirectors = useMemo(() => {
    if (!searchQuery.trim()) return directors;
    const q = searchQuery.toLowerCase();
    return directors.filter((d) =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.biography || '').toLowerCase().includes(q)
    );
  }, [directors, searchQuery]);

  if (loading) {
    return (
      <StyledContainer>
        <Loading text="Loading directors" compact={true} />
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

  return (
    <StyledContainer>
      <PageHeader>
        <Title>Directors</Title>
        <Intro>Explore the filmmakers behind the reviews and articles.</Intro>
      </PageHeader>

      <SearchRow>
        <input
          type="text"
          placeholder="Search directors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchRow>

      <AccordionContainer>
        {filteredDirectors.map((director, index) => {
          const isExpanded = expandedId === director.id;
          return (
            <div key={director.id}>
              <AccordionHeader
                onClick={() =>
                  setExpandedId(isExpanded ? null : director.id)
                }
              >
                <DirectorCard
                  director={director}
                  index={index}
                  onClick={() => setExpandedId(isExpanded ? null : director.id)}
                />
              </AccordionHeader>
              {isExpanded && (
                <AccordionBody>
                  <DirectorBio director={director} />
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.75rem' }}>
                      Movies by {director.name}
                    </h3>
                    <MoviesGrid
                      movies={director.movies || []}
                      onMovieClick={(movie) => {
                        if (movie && movie.id) {
                          navigate(`/movies/${movie.id}`);
                        }
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <Button onClick={() => navigate(`/directors/${director.id}`)}>
                      View full page
                    </Button>
                  </div>
                </AccordionBody>
              )}
            </div>
          );
        })}
        {!filteredDirectors.length && (
          <p>No directors match your search.</p>
        )}
      </AccordionContainer>
    </StyledContainer>
  );
}

export default DirectorsPage;

