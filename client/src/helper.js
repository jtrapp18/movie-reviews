import { devDebug } from './utils/logger.js';

//****************************************************************************************************
// JSON-server CRUD functionality

const JSON_CACHE_TTL = 60 * 1000; // 60 seconds
const jsonCache = new Map(); // key -> { data, timestamp }

function makeJsonCacheKey(dbKey, Id) {
  return `${dbKey}:${Id != null ? Id : 'all'}`;
}

function invalidateJsonCache(dbKey) {
  if (!dbKey) return;
  for (const key of jsonCache.keys()) {
    if (key.startsWith(`${dbKey}:`)) {
      jsonCache.delete(key);
    }
  }
}

function userLogout() {
  fetch(`/api/logout`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      } else {
        devDebug('[helper] logout succeeded');
      }
    })
    .catch((e) => console.error(e));
}

async function getJSON(dbKey, Id = null) {
  const endpoint = Id ? `/api/${dbKey}/${Id}` : `/api/${dbKey}`;

  try {
    const cacheKey = makeJsonCacheKey(dbKey, Id);
    const cached = jsonCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < JSON_CACHE_TTL) {
      return cached.data;
    }

    const res = await fetch(endpoint, { credentials: 'include' });

    if (!res.ok) {
      console.error(`Error fetching ${dbKey} information! Status: ${res.status}`);
      return null;
    }

    // 204 No Content or empty body (e.g. check_session when not logged in)
    const contentLength = res.headers.get('content-length');
    if (res.status === 204 || contentLength === '0') {
      return null;
    }
    const text = await res.text();
    if (!text || !text.trim()) {
      return null;
    }
    const data = JSON.parse(text);
    const camelData = snakeToCamel(data);

    jsonCache.set(cacheKey, {
      data: camelData,
      timestamp: Date.now(),
    });

    return camelData;
  } catch (err) {
    console.error('Request failed', err);
    return null;
  }
}

function postJSONToDb(dbKey, jsonObj) {
  const snake_object = camelToSnake(jsonObj);
  const url = `/api/${dbKey}`;
  devDebug('[postJSONToDb] POST', url);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(snake_object),
  }).then(async (res) => {
    if (!res.ok) {
      let errorData = {};
      try {
        errorData = await res.json();
      } catch (err) {
        errorData = { error: `HTTP error! Status: ${res.status}` };
      }

      const errPayload = errorData.error;
      const err = new Error(
        typeof errPayload === 'string'
          ? errPayload
          : typeof errPayload === 'object' && errPayload !== null
            ? Object.values(errPayload).filter(Boolean).join(' ') || 'An error occurred'
            : 'An error occurred'
      );
      if (
        typeof errPayload === 'object' &&
        errPayload !== null &&
        !Array.isArray(errPayload)
      ) {
        err.serverErrors = errPayload;
      }
      devDebug('[postJSONToDb] Error response', res.status, errPayload);
      throw err;
    }
    const data = await res.json();
    devDebug('[postJSONToDb] Success', res.status, url);
    invalidateJsonCache(dbKey);
    return data;
  });
}

function patchJSONToDb(dbKey, Id, jsonObj) {
  const snake_object = camelToSnake(jsonObj);

  return fetch(`/api/${dbKey}/${Id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(snake_object),
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    invalidateJsonCache(dbKey);
    return res.json();
  });
}

function deleteJSONFromDb(dbKey, Id) {
  fetch(`/api/${dbKey}/${Id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      invalidateJsonCache(dbKey);
    })
    .catch((e) => console.error(e));
}

async function getMovieInfo(searchQuery = null) {
  const queryText = searchQuery ? `?search=${searchQuery}` : '';
  const imgUrl = 'https://image.tmdb.org/t/p/w1280';
  const url = `/api/pull_movie_info${queryText}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Error fetching movies! Status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const camelData = snakeToCamel(data.results);
    const movieInfo = camelData.map((m) => ({
      externalId: m.id,
      originalLanguage: m.originalLanguage,
      originalTitle: m.originalTitle,
      overview: m.overview,
      title: m.title,
      releaseDate: m.releaseDate,
      coverPhoto: `${imgUrl}${m.posterPath}`,
      backdrop: m.backdropPath ? `${imgUrl}${m.backdropPath}` : null,
    }));
    return movieInfo;
  } catch (err) {
    console.error('Request failed', err);
    return null;
  }
}

async function getMoviesByGenre(genreId, searchQuery = null) {
  const params = new URLSearchParams();
  params.append('genre_id', genreId);
  if (searchQuery) {
    params.append('search', searchQuery);
  }

  const imgUrl = 'https://image.tmdb.org/t/p/w1280';
  const url = `/api/discover_movies?${params.toString()}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error(
        `Error fetching movies for genre ${genreId}! Status: ${res.status}`
      );
      return [];
    }

    const data = await res.json();
    const camelData = snakeToCamel(data.results || []);
    const movieInfo = camelData.map((m) => ({
      externalId: m.id, // Also store as externalId for clarity
      originalLanguage: m.originalLanguage,
      originalTitle: m.originalTitle,
      overview: m.overview,
      title: m.title,
      releaseDate: m.releaseDate,
      coverPhoto: `${imgUrl}${m.posterPath}`,
      backdrop: m.backdropPath ? `${imgUrl}${m.backdropPath}` : null,
      voteAverage: m.voteAverage,
      genreIds: m.genreIds,
    }));
    return movieInfo;
  } catch (err) {
    console.error('Request failed for genre', genreId, err);
    return [];
  }
}

async function getMoviesByFilters({
  genreId = null,
  decade = null,
  searchQuery = null,
} = {}) {
  const params = new URLSearchParams();
  if (genreId) params.append('genre_id', genreId);
  if (decade) params.append('decade', decade);
  if (searchQuery) params.append('search', searchQuery);

  const imgUrl = 'https://image.tmdb.org/t/p/w1280';
  const url = `/api/discover_movies?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Error fetching filtered movies! Status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const camelData = snakeToCamel(data.results || []);
    return camelData.map((m) => ({
      externalId: m.id,
      originalLanguage: m.originalLanguage,
      originalTitle: m.originalTitle,
      overview: m.overview,
      title: m.title,
      releaseDate: m.releaseDate,
      coverPhoto: `${imgUrl}${m.posterPath}`,
      backdrop: m.backdropPath ? `${imgUrl}${m.backdropPath}` : null,
      voteAverage: m.voteAverage,
      genreIds: m.genreIds,
    }));
  } catch (err) {
    console.error('Request failed for filters', { genreId, decade, searchQuery, err });
    return [];
  }
}

//****************************************************************************************************
// Conversion between cases

// Utility to convert snake_case to camelCase
const snakeToCamel = (obj) => {
  const singleReplace = (str) =>
    str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelCaseKey = singleReplace(key);
      result[camelCaseKey] = snakeToCamel(obj[key]);
      return result;
    }, {});
  }

  if (obj && typeof obj === 'string') {
    // Ensure we don't try to change an already camelCase string
    return obj !== singleReplace(obj) ? singleReplace(obj) : obj;
  }

  return obj;
};

// Utility to convert camelCase to snake_case
const camelToSnake = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeCaseKey] = camelToSnake(obj[key]);
      return result;
    }, {});
  }

  return obj;
};

const camelToProperCase = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (match) => match.toUpperCase()) // Capitalize the first letter
    .split(' ') // Split into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(' '); // Rejoin words
};

//****************************************************************************************************
// Other utilities

const formattedTime = (messageDate) =>
  new Date(messageDate).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth', // Smooth scroll to the top
  });
};

async function getLocalMovieRatings() {
  try {
    const res = await fetch('/api/movies');
    if (!res.ok) {
      console.error(`Error fetching local movies! Status: ${res.status}`);
      return {};
    }

    const movies = await res.json();
    const ratingsMap = {};

    movies.forEach((movie) => {
      if (movie.reviews && movie.reviews.length > 0) {
        // Get the first review's rating (assuming one review per movie)
        const rating = movie.reviews[0].rating;
        if (rating && rating > 0) {
          // Always store by local ID
          ratingsMap[movie.id] = {
            rating: rating,
            localId: movie.id,
          };

          // Also store by external ID if it exists (for search results)
          if (movie.externalId) {
            ratingsMap[movie.externalId] = {
              rating: rating,
              localId: movie.id,
            };
          }
        }
      }
    });

    return ratingsMap;
  } catch (err) {
    console.error('Error fetching local movie ratings:', err);
    return {};
  }
}

async function getMovieRatingsByExternalIds(externalIds) {
  try {
    const res = await fetch('/api/movie-ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ external_ids: externalIds }),
    });

    if (!res.ok) {
      console.error(`Error fetching movie ratings! Status: ${res.status}`);
      return {};
    }

    const ratingsMap = await res.json();
    return ratingsMap;
  } catch (err) {
    console.error('Error fetching movie ratings by external IDs:', err);
    return {};
  }
}

async function getIdFromExternalId(externalId) {
  try {
    const res = await fetch('/api/movies');
    if (!res.ok) {
      console.error(`Error fetching local movies! Status: ${res.status}`);
      return null;
    }

    const movies = await res.json();
    const movie = movies.find((m) => m.external_id === externalId);
    return movie ? movie.id : null;
  } catch (err) {
    console.error('Error fetching local movie by external ID:', err);
    return null;
  }
}

// Cache for ratings to avoid repeated API calls
const ratingsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Generate cache key from movie list
function generateCacheKey(movies) {
  return movies
    .map((m) => `${m.id || 'null'}-${m.externalId || 'null'}`)
    .sort()
    .join('|');
}

// Check if cache entry is still valid
function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION;
}

// Invalidate ratings cache (call when ratings are updated)
function invalidateRatingsCache() {
  ratingsCache.clear();
  devDebug('ratings cache invalidated');
}

// Optimized function to get ratings for a list of movies (handles both local and external)
async function getMovieRatings(movies) {
  if (!movies || movies.length === 0) return {};

  // Check cache first
  const cacheKey = generateCacheKey(movies);
  const cached = ratingsCache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    devDebug('[helper] ratings cache hit', { movieCount: movies.length });
    return cached.data;
  }

  // Separate local and external movies
  const localMovies = movies.filter((movie) => !movie.externalId);
  const externalMovies = movies.filter((movie) => movie.externalId);

  let ratingsMap = {};

  // Use the new bulk endpoint if we have both types of movies
  if (localMovies.length > 0 && externalMovies.length > 0) {
    const localIds = localMovies.map((movie) => movie.id);
    const externalIds = externalMovies.map((movie) => movie.externalId);
    ratingsMap = await getMovieRatingsBulk(localIds, externalIds);
  } else if (localMovies.length > 0) {
    // Only local movies - use optimized approach
    const localIds = localMovies.map((movie) => movie.id);
    ratingsMap = await getMovieRatingsBulk(localIds, []);
  } else if (externalMovies.length > 0) {
    // Only external movies - use existing optimized endpoint
    const externalIds = externalMovies.map((movie) => movie.externalId);
    ratingsMap = await getMovieRatingsByExternalIds(externalIds);
  }

  // Cache the results
  ratingsCache.set(cacheKey, {
    data: ratingsMap,
    timestamp: Date.now(),
  });

  devDebug('[helper] ratings fetched', { movieCount: movies.length });
  return ratingsMap;
}

// New function to use the bulk ratings endpoint
async function getMovieRatingsBulk(localIds, externalIds) {
  try {
    const res = await fetch('/api/movie-ratings-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        local_ids: localIds,
        external_ids: externalIds,
      }),
    });

    if (!res.ok) {
      console.error(`Error fetching bulk movie ratings! Status: ${res.status}`);
      return {};
    }

    const ratingsMap = await res.json();
    return ratingsMap;
  } catch (err) {
    console.error('Error fetching bulk movie ratings:', err);
    return {};
  }
}

export {
  userLogout,
  getJSON,
  postJSONToDb,
  patchJSONToDb,
  deleteJSONFromDb,
  getMovieInfo,
  getMoviesByGenre,
  getMoviesByFilters,
  getLocalMovieRatings,
  getMovieRatingsByExternalIds,
  getMovieRatings,
  getMovieRatingsBulk,
  invalidateRatingsCache,
  getIdFromExternalId,
  snakeToCamel,
  camelToProperCase,
  formattedTime,
  scrollToTop,
};
