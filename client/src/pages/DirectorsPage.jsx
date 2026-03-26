import { useMemo, useState, useEffect } from 'react';
import { DirectorCard } from '@features/directors';
import { SearchPageFrame } from '@features/movies';
import { MobilePageGutter } from '@styles';
import styled from 'styled-components';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useDirectorsList } from '@features/directors/useDirectorsList';
import SearchHeroBanner from '@components/sections/SearchHeroBanner';

const Layout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const LetterRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.22rem;
  padding: 0.15rem 0 0.35rem;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;

  &::-webkit-scrollbar {
    height: 4px;
  }
`;

const LetterBtn = styled.button`
  flex: 0 0 auto;
  padding: 0.15rem 0.28rem;
  border-radius: 8px;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: 0.66rem;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
  border: 1px solid transparent;
  background: transparent;
  color: ${({ $active }) =>
    $active ? 'rgba(248, 249, 250, 0.98)' : 'rgba(248, 249, 250, 0.78)'};
  text-decoration: ${({ $active }) => ($active ? 'underline' : 'none')};
  text-underline-offset: 0.22em;

  &:hover {
    color: rgba(248, 249, 250, 0.95);
    text-decoration: underline;
    text-underline-offset: 0.22em;
  }
`;

const AccordionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

function DirectorsPage() {
  const { directors: contextDirectors = [] } = useOutletContext();
  const { directors, loading, setDirectors } = useDirectorsList(contextDirectors);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [letterFilter, setLetterFilter] = useState(null);
  const navigate = useNavigate();

  const filteredDirectors = useMemo(() => {
    let list = directors;

    if (letterFilter) {
      list = list.filter((d) => {
        const name = (d.name || '').toUpperCase();
        if (letterFilter === 'XYZ') {
          return name.startsWith('X') || name.startsWith('Y') || name.startsWith('Z');
        }
        return name.startsWith(letterFilter);
      });
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (d) =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.biography || '').toLowerCase().includes(q)
    );
  }, [directors, searchQuery, letterFilter]);

  // Keep outlet context in sync once list is loaded
  useEffect(() => {
    if (!loading && directors && directors.length) {
      setDirectors(directors);
    }
  }, [directors, loading, setDirectors]);

  return (
    <SearchPageFrame
      title={null}
      subtitle={null}
      searchPlaceholder="Search directors by name or bio..."
      onSearch={(value) => setSearchQuery(value)}
      isLoading={loading}
      loadingText="Loading directors"
      showHeader={false}
      heroSearchPrimaryBand
      heroBandBackgroundImage="/images/spotlight.webp"
      searchBarVariant="hero"
      hero={
        <SearchHeroBanner
          title="Director Highlights"
          subtitle="A movie is only as good as its director."
        />
      }
      heroBandFooter={
        <LetterRow aria-label="Filter directors by letter">
          <LetterBtn
            type="button"
            $active={!letterFilter}
            onClick={() => setLetterFilter(null)}
          >
            All
          </LetterBtn>
          {'ABCDEFGHIJKLMNOPQRSTUVW'.split('').map((letter) => (
            <LetterBtn
              key={letter}
              type="button"
              $active={letterFilter === letter}
              onClick={() => setLetterFilter(letter)}
            >
              {letter}
            </LetterBtn>
          ))}
          <LetterBtn
            type="button"
            $active={letterFilter === 'XYZ'}
            onClick={() => setLetterFilter('XYZ')}
            aria-label="X Y Z"
          >
            XYZ
          </LetterBtn>
        </LetterRow>
      }
    >
      <MobilePageGutter>
        <Layout>
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
      </MobilePageGutter>
    </SearchPageFrame>
  );
}

export default DirectorsPage;
