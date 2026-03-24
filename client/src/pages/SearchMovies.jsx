import { getMoviesByGenre, getMoviesByFilters } from '@helper';
import { useState, useEffect, useContext } from 'react';
import MotionWrapper from '@styles/MotionWrapper';
import { MovieSwimlane, SearchResultsGrid, SearchPageFrame } from '@features/movies';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '@context/adminProvider';
import SearchHeroBanner from '@components/shared-sections/SearchHeroBanner';

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

function SearchMovies() {
  const navigate = useNavigate();
  const { isAdmin } = useContext(AdminContext);
  const [genreData, setGenreData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeGenreId, setActiveGenreId] = useState(null);
  const [activeDecade, setActiveDecade] = useState(null);
  const [activeFiltersByGroup, setActiveFiltersByGroup] = useState({
    Genre: 'All',
    Decade: 'All',
  });

  const fetchAllGenres = async () => {
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
  };

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
    fetchAllGenres();
  }, []);

  const enterSearch = (text) => {
    setSearchQuery(text);
    const hasFilters = Boolean(activeGenreId || activeDecade);
    if ((text && text.trim()) || hasFilters) {
      setIsSearchMode(true);
      fetchSearchResults(text, activeGenreId, activeDecade);
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  const handleMovieClick = (movie) => {
    // Navigate to movie review page - MovieReview will handle creating the movie if needed
    navigate(`/movies/${movie.id}`);
  };

  const introText = isAdmin
    ? 'Click any movie card to add a new review'
    : 'Click any movie card to view review';
  const quickGroups = [
    { title: 'Genre', labels: ['All', ...GENRES.map((g) => g.name), 'Thriller', 'Documentary'] },
    { title: 'Decade', labels: ['All', 'Pre-1960s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'] },
  ];

  const activeSearchContextText = (() => {
    const parts = [];
    if (searchQuery && searchQuery.trim()) {
      parts.push(searchQuery.trim());
    }
    if (activeFiltersByGroup.Genre && activeFiltersByGroup.Genre !== 'All') {
      parts.push(`Genre: ${activeFiltersByGroup.Genre}`);
    }
    if (activeFiltersByGroup.Decade && activeFiltersByGroup.Decade !== 'All') {
      parts.push(`Decade: ${activeFiltersByGroup.Decade}`);
    }
    return parts.join(' • ') || 'All Movies';
  })();

  return (
    <SearchPageFrame
      title={null}
      subtitle={null}
      searchPlaceholder={loading ? 'Searching...' : 'Search movies by title, director, year...'}
      onSearch={enterSearch}
      isLoading={loading}
      loadingText="Loading movies"
      wide
      showHeader={false}
      heroSearchPrimaryBand
      heroBandBackgroundImage="/images/spotlight.jpeg"
      searchBarVariant="hero"
      hero={
        <SearchHeroBanner
          title="Search Movies"
          subtitle={introText}
        />
      }
      heroBandFooter={
        <SearchHeroBanner
          buttonGroups={quickGroups}
          activeButtonsByGroup={activeFiltersByGroup}
          onButtonClick={(label, groupTitle) => {
            let nextGenreId = activeGenreId;
            let nextDecade = activeDecade;
            const nextActiveByGroup = { ...activeFiltersByGroup };

            if (groupTitle === 'Genre') {
              nextGenreId = label === 'All' ? null : (GENRE_LABEL_TO_ID[label] ?? null);
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
      }
    >
      {isSearchMode ? (
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
