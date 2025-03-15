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

export {userLogout, getJSON, postJSONToDb, patchJSONToDb, deleteJSONFromDb, 
  getMovieInfo, snakeToCamel, camelToProperCase, formattedTime, scrollToTop};