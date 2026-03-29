import { getMoviesByGenre, getMoviesByFilters } from '@helper';
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { WindowWidthContext } from '@context/windowSize';
import MotionWrapper from '@styles/MotionWrapper';
import { MovieSwimlane, SearchResultsGrid, SearchPageFrame } from '@features/movies';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AdminContext } from '@context/adminProvider';
import SearchHeroBanner from '@components/sections/SearchHeroBanner';
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
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 6px;
  padding: 3px;
  border-radius: 9999px;
  background: rgba(248, 249, 250, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
`;

const ModeDropdownRoot = styled.div`
  position: relative;
  width: auto;
  max-width: 100%;
  min-width: 0;
`;

/**
 * Closed state matches the old flat <select> look (padding + BG chevron).
 * Open list stays the custom portaled menu.
 */
const ModeTriggerButton = styled.button`
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  width: auto;
  max-width: 100%;
  background-color: transparent;
  border: none;
  border-radius: 0;
  color: rgba(248, 249, 250, 0.96);
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  /* Tight right inset: chevron is 10px at right:2px — no extra dead space like full-width stretch */
  padding: 12px 20px 12px 2px;
  cursor: pointer;
  line-height: 1.3;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(248,249,250,0.55)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 2px center;
  background-size: 10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }

  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.35);
    outline-offset: 2px;
  }
`;

/** Portaled so it isn’t clipped by the hero pill’s overflow:hidden; themed (not OS native) */
const ModeMenuPanel = styled.div`
  position: fixed;
  z-index: 10002;
  background: rgba(22, 24, 30, 0.98);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(0, 0, 0, 0.25) inset;
  padding: 6px;
`;

const ModeMenuItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  background: ${({ $active }) =>
    $active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  color: rgba(248, 249, 250, 0.95);
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: 0.82rem;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  letter-spacing: 0.02em;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.35);
    outline-offset: 0;
  }
`;

function DesktopModeDropdown({ mode, goLibrary, goDiscover }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 160 });
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onScrollResize = () => updatePosition();
    window.addEventListener('resize', onScrollResize);
    window.addEventListener('scroll', onScrollResize, true);
    return () => {
      window.removeEventListener('resize', onScrollResize);
      window.removeEventListener('scroll', onScrollResize, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      const t = e.target;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const label = mode === 'library' ? 'Library' : 'Discover';

  const menuPortal =
    open &&
    createPortal(
      <ModeMenuPanel
        ref={menuRef}
        role="listbox"
        aria-label="Search mode"
        style={{
          top: coords.top,
          left: coords.left,
          minWidth: Math.max(coords.width, 148),
        }}
      >
        <ModeMenuItem
          type="button"
          role="option"
          aria-selected={mode === 'library'}
          $active={mode === 'library'}
          onClick={() => {
            goLibrary();
            setOpen(false);
          }}
        >
          Library
        </ModeMenuItem>
        <ModeMenuItem
          type="button"
          role="option"
          aria-selected={mode === 'discover'}
          $active={mode === 'discover'}
          onClick={() => {
            goDiscover();
            setOpen(false);
          }}
        >
          Discover
        </ModeMenuItem>
      </ModeMenuPanel>,
      document.body
    );

  return (
    <>
      <ModeDropdownRoot ref={rootRef}>
        <ModeTriggerButton
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Search mode"
          onClick={() => setOpen((o) => !o)}
        >
          {label}
        </ModeTriggerButton>
      </ModeDropdownRoot>
      {menuPortal}
    </>
  );
}

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
  const { isMobile } = useContext(WindowWidthContext) || { isMobile: false };
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

  const goLibrary = () => {
    if (mode === 'library') return;
    setMode('library');
    setSearchQuery('');
    setActiveGenreId(null);
    setActiveDecade(null);
    setActiveFiltersByGroup({ Genre: 'All', Decade: 'All' });
    setSearchResults([]);
    setIsSearchMode(false);
    setLibraryRatingTier(null);
    setLibraryReleaseBucket('All');
    setLoading(false);
  };

  const goDiscover = () => {
    if (mode === 'discover') return;
    setMode('discover');
    setSearchQuery('');
    setActiveGenreId(null);
    setActiveDecade(null);
    setActiveFiltersByGroup({ Genre: 'All', Decade: 'All' });
    setSearchResults([]);
    setIsSearchMode(false);
    setLibraryRatingTier(null);
    setLibraryReleaseBucket('All');
    setLoading(true);
  };

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
      searchBarAccessory={
        isMobile ? (
          <InlineModeToggle aria-label="Mode toggle">
            <ModeBtn type="button" $active={mode === 'library'} onClick={goLibrary}>
              Library
            </ModeBtn>
            <ModeBtn type="button" $active={mode === 'discover'} onClick={goDiscover}>
              Discover
            </ModeBtn>
          </InlineModeToggle>
        ) : (
          <DesktopModeDropdown mode={mode} goLibrary={goLibrary} goDiscover={goDiscover} />
        )
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
