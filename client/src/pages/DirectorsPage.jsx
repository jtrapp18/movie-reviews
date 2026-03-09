import { useEffect, useMemo, useState } from 'react';
import { StyledContainer, Button } from '../styles';
import { getJSON } from '../helper';
import Loading from '../components/ui/Loading';
import DirectorCard from '../cards/DirectorCard';
import Movies from '../components/Movies';
import SearchBar from '../components/SearchBar';
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

const Layout = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AZColumn = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  font-size: 0.95rem;
  color: var(--font-color-2);

  button {
    background: transparent;
    border: none;
    text-align: left;
    padding: 2px 0;
    cursor: pointer;
    color: inherit;
  }

  button.active {
    font-weight: 600;
    color: var(--font-color-1);
  }
`;

const AccordionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Details = styled.details`
  border-radius: 8px;
  background: var(--background-secondary);
  padding: 8px 12px;
`;

const SummaryRow = styled.summary`
  list-style: none;
  display: flex;
  align-items: stretch;
  gap: 16px;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }
`;

const AccordionBody = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
`;

const ScaledMovies = styled.div`
  transform: scale(0.5);
  transform-origin: top left;
`;

function DirectorsPage() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [letterFilter, setLetterFilter] = useState(null);
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
    let list = directors;

    if (letterFilter) {
      list = list.filter((d) =>
        (d.name || '').toUpperCase().startsWith(letterFilter)
      );
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((d) =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.biography || '').toLowerCase().includes(q)
    );
  }, [directors, searchQuery, letterFilter]);

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

      <SearchBar
        enterSearch={(value) => setSearchQuery(value)}
        placeholder="Search directors by name or bio..."
      />

      <Layout>
        <AZColumn>
          <strong>A–Z</strong>
          <button
            type="button"
            className={!letterFilter ? 'active' : ''}
            onClick={() => setLetterFilter(null)}
          >
            All
          </button>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
            <button
              key={letter}
              type="button"
              className={letterFilter === letter ? 'active' : ''}
              onClick={() => setLetterFilter(letter)}
            >
              {letter}
            </button>
          ))}
        </AZColumn>

        <AccordionContainer>
          {filteredDirectors.map((director, index) => {
            const isExpanded = expandedId === director.id;
            const shortBio =
              (director.biography && director.biography.length > 220)
                ? `${director.biography.slice(0, 220)}…`
                : (director.biography || 'Director biography coming soon.');

            return (
              <Details
                key={director.id}
                open={isExpanded}
                onToggle={(e) =>
                  setExpandedId(e.target.open ? director.id : null)
                }
              >
                <SummaryRow>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/directors/${director.id}`);
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    <DirectorCard
                      director={director}
                      index={index}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, color: 'var(--font-color-2)', fontSize: '0.95rem' }}>
                      {shortBio}
                    </p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--font-color-3)' }}>
                        {isExpanded ? 'Hide movies ▲' : 'Show movies ▼'}
                      </span>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/directors/${director.id}`);
                        }}
                      >
                        View page
                      </Button>
                    </div>
                  </div>
                </SummaryRow>
                <AccordionBody>
                  <h3 style={{ marginBottom: '0.75rem' }}>
                    Movies by {director.name}
                  </h3>
                  <ScaledMovies>
                    <Movies
                      showMovies={director.movies || []}
                    />
                  </ScaledMovies>
                </AccordionBody>
              </Details>
            );
          })}
          {!filteredDirectors.length && (
            <p>No directors match your search.</p>
          )}
        </AccordionContainer>
      </Layout>
    </StyledContainer>
  );
}

export default DirectorsPage;

