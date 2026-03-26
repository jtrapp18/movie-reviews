import { getMoviesByGenre, getMoviesByFilters } from '@helper';
import { useState, useEffect, useContext, useCallback } from 'react';
import MotionWrapper from '@styles/MotionWrapper';
import { MovieSwimlane, SearchResultsGrid, SearchPageFrame } from '@features/movies';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AdminContext } from '@context/adminProvider';
import SearchHeroBanner from '@components/shared-sections/SearchHeroBanner';
import styled from 'styled-components';
import { getAllGradingTiers } from '@utils/gradingTiers';

// Define genres we want to show
const GENRES = [
  { id: 28, name: 'Action', emoji: '🎬' },
  { id: 35, name: 'Comedy', emoji: '😂' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 27, name: 'Horror', emoji: '👻' },
  { id: 878, name: 'Sci-Fi', emoji: '🚀' },
  { id: 16, name: 'Animation', emoji: '🎨' },
];

const GENRE_LABEL_TO_ID = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  'Sci-Fi': 878,
  Animation: 16,
  Thriller: 53,
  Documentary: 99,
};

const LibraryStack = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const InlineModeToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px;
  border-radius: 9999px;
  background: rgba(248, 249, 250, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
`;

const ModeBtn = styled.button`
  padding: 6px 10px;
  border-radius: 9999px;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  letter-spacing: 0.04em;
  color: ${({ $active }) =>
    $active ? 'rgba(248, 249, 250, 0.95)' : 'rgba(248, 249, 250, 0.68)'};
  background: ${({ $active }) =>
    $active ? 'rgba(248, 249, 250, 0.16)' : 'transparent'};
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.22)' : 'transparent')};
  cursor: pointer;

  &:hover {
    background: rgba(248, 249, 250, 0.1);
    color: rgba(248, 249, 250, 0.92);
  }
`;

function SearchMovies() {
  const navigate = useNavigate();
  const { movies: libraryMovies = [] } = useOutletContext();
  const { isAdmin } = useContext(AdminContext);
  const [genreData, setGenreData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeGenreId, setActiveGenreId] = useState(null);
  const [activeDecade, setActiveDecade] = useState(null);
  const [mode, setMode] = useState('library'); // 'discover' | 'library'
  const [libraryRatingTier, setLibraryRatingTier] = useState(null); // number (1..7) or null
  const [libraryReleaseBucket, setLibraryReleaseBucket] = useState('All'); // All | Pre-1960s | 1960s...
  const [activeFiltersByGroup, setActiveFiltersByGroup] = useState({
    Genre: 'All',
    Decade: 'All',
  });

  const fetchAllGenres = useCallback(async () => {
    setLoading(true);
    try {
      const promises = GENRES.map(async (genre) => {
        const movies = await getMoviesByGenre(genre.id);
        return {
          ...genre,
          movies: movies,
        };
      });

      const results = await Promise.all(promises);
      // Filter out empty genres (no movies found)
      const nonEmptyResults = results.filter((genre) => genre.movies.length > 0);
      setGenreData(nonEmptyResults);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      setGenreData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearchResults = async (searchText, genreId = null, decade = null) => {
    setLoading(true);
    try {
      const movies = await getMoviesByFilters({
        genreId,
        decade,
        searchQuery: searchText || null,
      });
      setSearchResults(movies || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'discover') {
      fetchAllGenres();
      return;
    }
    setLoading(false);
  }, [mode, fetchAllGenres]);

  const enterSearch = (text) => {
    setSearchQuery(text);
    if (mode === 'library') {
      setIsSearchMode(true);
      return;
    }

    const hasFilters = Boolean(activeGenreId || activeDecade);
    if ((text && text.trim()) || hasFilters) {
      setIsSearchMode(true);
      fetchSearchResults(text, activeGenreId, activeDecade);
      return;
    }

    setIsSearchMode(false);
    setSearchResults([]);
  };

  const handleMovieClick = (movie) => {
    // Navigate to movie review page - MovieReview will handle creating the movie if needed
    navigate(`/movies/${movie.id}`);
  };

  const introText = isAdmin
    ? 'Click any movie card to add a new review'
    : 'Click any movie card to view review';
  const quickGroups = [
    {
      title: 'Genre',
      labels: ['All', ...GENRES.map((g) => g.name), 'Thriller', 'Documentary'],
    },
    {
      title: 'Decade',
      labels: [
        'All',
        'Pre-1960s',
        '1960s',
        '1970s',
        '1980s',
        '1990s',
        '2000s',
        '2010s',
        '2020s',
      ],
    },
  ];

  const libraryTierButtons = (() => {
    // already sorted desc in util; we want highest tier first
    return getAllGradingTiers().map((t) => ({ label: t.grade, tier: t.tier }));
  })();

  const libraryReleaseButtons = [
    'All',
    'Pre-1960s',
    '1960s',
    '1970s',
    '1980s',
    '1990s',
    '2000s',
    '2010s',
    '2020s',
  ];

  const activeSearchContextText = (() => {
    const parts = [];
    if (searchQuery && searchQuery.trim()) {
      parts.push(searchQuery.trim());
    }
    if (
      mode === 'discover' &&
      activeFiltersByGroup.Genre &&
      activeFiltersByGroup.Genre !== 'All'
    ) {
      parts.push(`Genre: ${activeFiltersByGroup.Genre}`);
    }
    if (
      mode === 'discover' &&
      activeFiltersByGroup.Decade &&
      activeFiltersByGroup.Decade !== 'All'
    ) {
      parts.push(`Decade: ${activeFiltersByGroup.Decade}`);
    }
    if (mode === 'library' && libraryRatingTier != null) {
      const label = libraryTierButtons.find((t) => t.tier === libraryRatingTier)?.label;
      if (label) parts.push(`Rating: ${label}`);
    }
    if (mode === 'library' && libraryReleaseBucket && libraryReleaseBucket !== 'All') {
      parts.push(`Release: ${libraryReleaseBucket}`);
    }
    return parts.join(' • ') || (mode === 'library' ? 'My Library' : 'All Movies');
  })();

  const filteredLibraryMovies = (() => {
    if (!Array.isArray(libraryMovies)) return [];
    const q = (searchQuery || '').trim().toLowerCase();
    const out = q
      ? libraryMovies.filter((m) => {
          const directorName =
            typeof m?.director === 'object' ? m.director?.name : m?.director;
          return (
            (m?.title || '').toLowerCase().includes(q) ||
            (m?.originalTitle || '').toLowerCase().includes(q) ||
            (m?.overview || '').toLowerCase().includes(q) ||
            (directorName || '').toLowerCase().includes(q)
          );
        })
      : libraryMovies;

    const byRating =
      libraryRatingTier == null
        ? out
        : out.filter((m) => {
            const r =
              Array.isArray(m?.reviews) && m.reviews.length ? m.reviews[0] : null;
            return Number(r?.rating) === Number(libraryRatingTier);
          });

    const bucket = (libraryReleaseBucket || 'All').toLowerCase();
    const byRelease =
      bucket === 'all'
        ? byRating
        : byRating.filter((m) => {
            const rd = String(m?.releaseDate || m?.release_date || '');
            if (!rd || rd.length < 4) return false;
            const year = Number(rd.slice(0, 4));
            if (!Number.isFinite(year)) return false;
            if (bucket === 'pre-1960s') return year <= 1959;
            if (bucket.endsWith('s') && /^\d{4}/.test(bucket)) {
              const start = Number(bucket.slice(0, 4));
              return year >= start && year <= start + 9;
            }
            return false;
          });

    return [...byRelease].sort((a, b) =>
      String(a?.title || '').localeCompare(String(b?.title || ''))
    );
  })();

  const libraryRecentlyAdded = (() => {
    const list = Array.isArray(libraryMovies) ? libraryMovies : [];
    const withReview = list.filter(
      (m) => Array.isArray(m?.reviews) && m.reviews.length > 0
    );
    const sorted = [...withReview].sort((a, b) => {
      const aDate = a.reviews?.[0]?.dateAdded || a.reviews?.[0]?.date_added || null;
      const bDate = b.reviews?.[0]?.dateAdded || b.reviews?.[0]?.date_added || null;
      return new Date(bDate || 0) - new Date(aDate || 0);
    });
    return sorted.slice(0, 20);
  })();

  const isLibrarySearchActive = (() => {
    if (mode !== 'library') return false;
    const hasQuery = Boolean(searchQuery && searchQuery.trim());
    const hasRating = libraryRatingTier != null;
    const hasRelease = Boolean(libraryReleaseBucket && libraryReleaseBucket !== 'All');
    return hasQuery || hasRating || hasRelease;
  })();

  return (
    <SearchPageFrame
      title={null}
      subtitle={null}
      searchPlaceholder={
        loading
          ? 'Searching...'
          : mode === 'library'
            ? 'Search your library by title, director, overview...'
            : 'Search movies by title, director, year...'
      }
      onSearch={enterSearch}
      isLoading={loading}
      loadingText="Loading movies"
      wide
      containerSize="full"
      showHeader={false}
      heroSearchPrimaryBand
      heroBandBackgroundImage="/images/spotlight.webp"
      searchBarVariant="hero"
      hero={<SearchHeroBanner title="Search Movies" subtitle={introText} />}
      searchBarRightSlot={
        <InlineModeToggle aria-label="Mode toggle">
          <ModeBtn
            type="button"
            $active={mode === 'library'}
            onClick={() => {
              if (mode === 'library') return;
              const nextMode = 'library';
              setMode(nextMode);
              setSearchQuery('');
              setActiveGenreId(null);
              setActiveDecade(null);
              setActiveFiltersByGroup({ Genre: 'All', Decade: 'All' });
              setSearchResults([]);
              setIsSearchMode(false);
              setLibraryRatingTier(null);
              setLibraryReleaseBucket('All');
              setLoading(false);
            }}
          >
            Library
          </ModeBtn>
          <ModeBtn
            type="button"
            $active={mode === 'discover'}
            onClick={() => {
              if (mode === 'discover') return;
              const nextMode = 'discover';
              setMode(nextMode);
              setSearchQuery('');
              setActiveGenreId(null);
              setActiveDecade(null);
              setActiveFiltersByGroup({ Genre: 'All', Decade: 'All' });
              setSearchResults([]);
              setIsSearchMode(false);
              setLibraryRatingTier(null);
              setLibraryReleaseBucket('All');
              setLoading(true);
            }}
          >
            Discover
          </ModeBtn>
        </InlineModeToggle>
      }
      heroBandFooter={
        <>
          {mode === 'discover' ? (
            <SearchHeroBanner
              buttonGroups={quickGroups}
              showDivider={false}
              activeButtonsByGroup={activeFiltersByGroup}
              onButtonClick={(label, groupTitle) => {
                let nextGenreId = activeGenreId;
                let nextDecade = activeDecade;
                const nextActiveByGroup = { ...activeFiltersByGroup };

                if (groupTitle === 'Genre') {
                  nextGenreId =
                    label === 'All' ? null : (GENRE_LABEL_TO_ID[label] ?? null);
                  setActiveGenreId(nextGenreId);
                  nextActiveByGroup.Genre = label;
                } else if (groupTitle === 'Decade') {
                  nextDecade = label === 'All' ? null : label.toLowerCase();
                  setActiveDecade(nextDecade);
                  nextActiveByGroup.Decade = label;
                }
                setActiveFiltersByGroup(nextActiveByGroup);

                const hasSearchText = Boolean(searchQuery && searchQuery.trim());
                const hasFilters = Boolean(nextGenreId || nextDecade);

                if (hasSearchText || hasFilters) {
                  setIsSearchMode(true);
                  fetchSearchResults(searchQuery, nextGenreId, nextDecade);
                } else {
                  setIsSearchMode(false);
                  setSearchResults([]);
                }
              }}
            />
          ) : (
            <>
              <SearchHeroBanner
                buttonGroups={[
                  {
                    title: 'Rating',
                    labels: ['All', ...libraryTierButtons.map((t) => t.label)],
                  },
                ]}
                showDivider={false}
                activeButtonsByGroup={{
                  Rating:
                    libraryRatingTier == null
                      ? 'All'
                      : (libraryTierButtons.find((t) => t.tier === libraryRatingTier)
                          ?.label ?? 'All'),
                }}
                onButtonClick={(label) => {
                  if (label === 'All') {
                    setLibraryRatingTier(null);
                    setIsSearchMode(true);
                    return;
                  }
                  const found = libraryTierButtons.find((t) => t.label === label);
                  setLibraryRatingTier(found?.tier ?? null);
                  setIsSearchMode(true);
                }}
              />
              <SearchHeroBanner
                buttonGroups={[
                  { title: 'Release Date', labels: libraryReleaseButtons },
                ]}
                showDivider={false}
                activeButtonsByGroup={{ 'Release Date': libraryReleaseBucket }}
                onButtonClick={(label) => {
                  setLibraryReleaseBucket(label);
                  setIsSearchMode(true);
                }}
              />
            </>
          )}
        </>
      }
    >
      {mode === 'library' ? (
        <MotionWrapper index={1}>
          <LibraryStack>
            {isLibrarySearchActive ? null : (
              <MovieSwimlane
                genre={{ name: 'Recently added' }}
                movies={libraryRecentlyAdded}
                onMovieClick={handleMovieClick}
              />
            )}
            <SearchResultsGrid
              searchQuery={isLibrarySearchActive ? searchQuery : null}
              searchContextText={isLibrarySearchActive ? activeSearchContextText : null}
              movies={filteredLibraryMovies}
              onMovieClick={handleMovieClick}
            />
          </LibraryStack>
        </MotionWrapper>
      ) : isSearchMode ? (
        <MotionWrapper index={1}>
          <SearchResultsGrid
            searchQuery={searchQuery}
            searchContextText={activeSearchContextText}
            movies={searchResults}
            onMovieClick={handleMovieClick}
          />
        </MotionWrapper>
      ) : (
        genreData.map((genre, index) => (
          <MotionWrapper key={genre.id} index={index + 1}>
            <MovieSwimlane
              genre={genre}
              movies={genre.movies}
              onMovieClick={handleMovieClick}
            />
          </MotionWrapper>
        ))
      )}
    </SearchPageFrame>
  );
}

export default SearchMovies;
