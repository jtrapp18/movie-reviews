//****************************************************************************************************
// JSON-server CRUD functionality

function userLogout() {

  fetch(`/api/logout`, {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json'
    }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      else {
        console.log('Successfully logged out')
      }
    })
    .catch(e => console.error(e));
  }

  async function getJSON(dbKey, Id=null) {
    const endpoint = Id ? `/api/${dbKey}/${Id}` : `/api/${dbKey}`;

    try {
      const res = await fetch(endpoint);
  
      if (!res.ok) {
        console.error(`Error fetching ${dbKey} information! Status: ${res.status}`);
        return null;  // Return null on error
      }
  
      const data = await res.json();
  
      // Ensure 'results' exists before attempting to transform it
      const camelData = snakeToCamel(data);
      
      return camelData;
    } catch (err) {
      console.error('Request failed', err);
      return null;  // Return null if an error occurs
    }
  }  

  function postJSONToDb(dbKey, jsonObj) {
    const snake_object = camelToSnake(jsonObj);
  
    return fetch(`/api/${dbKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snake_object),
    })
      .then(async (res) => {
        if (!res.ok) {
          let errorData = {};
          try {
            // Attempt to parse JSON if the response is not OK
            errorData = await res.json();
          } catch (err) {
            // If there is no JSON or invalid JSON, set a default error message
            errorData = { error: `HTTP error! Status: ${res.status}` };
          }
  
          // If the error response contains an error message, flatten it
          const errorMessages = [];
  
          // Check for specific error fields like username or email
          if (errorData.error.username) {
            errorMessages.push(errorData.error.username);
          }
          if (errorData.error.email) {
            errorMessages.push(errorData.error.email);
          }
  
          // If no specific error, use a generic error message
          if (errorMessages.length > 0) {
            // If there are multiple error messages, join them into one string
            throw new Error(errorMessages.join(', '));
          } else {
            throw new Error(errorData.error || 'An error occurred');
          }
        }
        return res.json(); // Return the JSON if response is OK
      });
  }

function patchJSONToDb(dbKey, Id, jsonObj) {

    const snake_object = camelToSnake(jsonObj);

    return fetch(`/api/${dbKey}/${Id}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(snake_object)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
}

function deleteJSONFromDb(dbKey, Id) {

  fetch(`/api/${dbKey}/${Id}`, {
  method: 'DELETE',
  headers: {
      'Content-Type': 'application/json'
  }
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
  })
  .catch(e => console.error(e));
}

async function getMovieInfo(searchQuery=null) {
  const queryText = searchQuery ? `?search=${searchQuery}` : "";
  const imgUrl = "https://image.tmdb.org/t/p/w1280"
  const url = `/api/pull_movie_info${queryText}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Error fetching movies! Status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const camelData = snakeToCamel(data.results)
    const movieInfo = camelData.map(m => ({
      externalId: m.id,
      originalLanguage: m.originalLanguage,
      originalTitle: m.originalTitle,
      overview: m.overview,
      title: m.title,
      releaseDate: m.releaseDate,
      coverPhoto: `${imgUrl}${m.posterPath}`,
      // backdropPath: `${imgUrl}${m.backdropPath}`
    }));
    return movieInfo;
  } catch (err) {
    console.error('Request failed', err);
    return null;
  }
}


async function getMoviesByGenre(genreId, searchQuery=null) {
  const params = new URLSearchParams();
  params.append('genre_id', genreId);
  if (searchQuery) {
    params.append('search', searchQuery);
  }
  
  const imgUrl = "https://image.tmdb.org/t/p/w1280"
  const url = `/api/discover_movies?${params.toString()}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Error fetching movies for genre ${genreId}! Status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const camelData = snakeToCamel(data.results || [])
    const movieInfo = camelData.map(m => ({
      externalId: m.id, // Also store as externalId for clarity
      originalLanguage: m.originalLanguage,
      originalTitle: m.originalTitle,
      overview: m.overview,
      title: m.title,
      releaseDate: m.releaseDate,
      coverPhoto: `${imgUrl}${m.posterPath}`,
      voteAverage: m.voteAverage,
      genreIds: m.genreIds
    }));
    return movieInfo;
  } catch (err) {
    console.error('Request failed for genre', genreId, err);
    return [];
  }
}

//****************************************************************************************************
// Conversion between cases

// Utility to convert snake_case to camelCase
const snakeToCamel = (obj) => {
  const singleReplace = (str) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

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
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(' '); // Rejoin words
};

//****************************************************************************************************
// Other utilities

const formattedTime = (messageDate) => new Date(messageDate).toLocaleString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true
});

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Smooth scroll to the top
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
    
    movies.forEach(movie => {
      if (movie.reviews && movie.reviews.length > 0) {
        // Get the first review's rating (assuming one review per movie)
        const rating = movie.reviews[0].rating;
        if (rating && rating > 0) {
          // Always store by local ID
          ratingsMap[movie.id] = {
            rating: rating,
            localId: movie.id
          };
          
          // Also store by external ID if it exists (for search results)
          if (movie.externalId) {
            ratingsMap[movie.externalId] = {
              rating: rating,
              localId: movie.id
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
      body: JSON.stringify({ external_ids: externalIds })
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
    const movie = movies.find(m => m.external_id === externalId);
    return movie ? movie.id : null;
  } catch (err) {
    console.error('Error fetching local movie by external ID:', err);
    return null;
  }
}

// Helper function to get ratings for a list of movies (handles both local and external)
async function getMovieRatings(movies) {
  if (!movies || movies.length === 0) return {};
  
  // Separate local and external movies
  const localMovies = movies.filter(movie => !movie.externalId);
  const externalMovies = movies.filter(movie => movie.externalId);
  
  const ratingsMap = {};
  
  // Get ratings for local movies
  if (localMovies.length > 0) {
    const localRatings = await getLocalMovieRatings();
    localMovies.forEach(movie => {
      const localData = localRatings[movie.id];
      if (localData) {
        ratingsMap[movie.id] = localData;
      }
    });
  }
  
  // Get ratings for external movies
  if (externalMovies.length > 0) {
    const externalIds = externalMovies.map(movie => movie.externalId);
    const externalRatings = await getMovieRatingsByExternalIds(externalIds);
    Object.assign(ratingsMap, externalRatings);
  }
  
  return ratingsMap;
}

export {userLogout, getJSON, postJSONToDb, patchJSONToDb, deleteJSONFromDb, 
  getMovieInfo, getMoviesByGenre, getLocalMovieRatings, getMovieRatingsByExternalIds, getMovieRatings, getIdFromExternalId, snakeToCamel, camelToProperCase, formattedTime, scrollToTop};