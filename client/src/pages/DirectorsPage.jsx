import { useMemo, useState } from 'react';
import DirectorCard from '@components/cards/DirectorCard';
import { SearchPageFrame } from '@features/movies';
import styled from 'styled-components';
import { useNavigate, useOutletContext } from 'react-router-dom';

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

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding-top: 0;
    margin-bottom: 0.75rem;
    overflow-x: auto;
    padding-bottom: 4px;

    &::-webkit-scrollbar {
      height: 4px;
    }

    & > strong {
      flex-shrink: 0;
    }

    button {
      flex-shrink: 0;
      padding: 2px 6px;
      font-size: 0.85rem;
    }
  }
`;

const AccordionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

function DirectorsPage() {
  const { directors = [], coreDataLoaded } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [letterFilter, setLetterFilter] = useState(null);
  const navigate = useNavigate();
  const loading = !coreDataLoaded;

  const filteredDirectors = useMemo(() => {
    let list = directors;

    if (letterFilter) {
      list = list.filter((d) => (d.name || '').toUpperCase().startsWith(letterFilter));
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (d) =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.biography || '').toLowerCase().includes(q)
    );
  }, [directors, searchQuery, letterFilter]);

  return (
    <SearchPageFrame
      title="Director Highlights"
      subtitle="A movie is only as good as its director."
      searchPlaceholder="Search directors by name or bio..."
      onSearch={(value) => setSearchQuery(value)}
      isLoading={loading}
      loadingText="Loading directors"
    >
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
          {filteredDirectors.map((director, index) => (
            <DirectorCard
              key={director.id}
              director={director}
              index={index}
              variant="detail"
              movies={director.movies || []}
              isExpanded={expandedId === director.id}
              onToggle={(open) => setExpandedId(open ? director.id : null)}
              onViewPage={() => navigate(`/directors/${director.id}`)}
            />
          ))}
          {!filteredDirectors.length && <p>No directors match your search.</p>}
        </AccordionContainer>
      </Layout>
    </SearchPageFrame>
  );
}

export default DirectorsPage;
