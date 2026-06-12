import { useState, useEffect } from 'react';
import './App.css';

interface Movie {
  poster_path: string | null;
  title: string;
  release_date: string;
  overview: string;
}

const fetchMovies = async (): Promise<Movie[]> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/discover/movie?sort_by=vote_average.desc&api_key=${import.meta.env.VITE_MOVIE_API_KEY}`,
  );
  if (!response.ok) {
    throw new Error(`Movies request failed: ${response.status}`);
  }

  const movies = await response.json();
  return movies.results.map(
    ({ poster_path, title, release_date, overview }: Movie) => ({
      poster_path,
      title,
      release_date,
      overview,
    }),
  );
};

const fetchConfig = async (): Promise<string> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/configuration?api_key=${import.meta.env.VITE_MOVIE_API_KEY}`,
  );
  if (!response.ok) {
    throw new Error(`Configuration request failed: ${response.status}`);
  }

  const config = await response.json();
  return config.images.secure_base_url;
};

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [configBaseUrl, setConfigBaseUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [movieList, baseUrl] = await Promise.all([
          fetchMovies(),
          fetchConfig(),
        ]);
        setMovies(movieList);
        setConfigBaseUrl(baseUrl);
      } catch (e) {
        console.error('Failed to load TMDB data:', e);
        setError('Failed to fetch data. Please try again later.');
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="title">Movies</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <ul className="movies">
          {movies.map(movie => (
            <li key={movie.title} className="movie">
              <h2>{movie.title}</h2>
              <p>Release Date: {movie.release_date}</p>
              {movie.poster_path && configBaseUrl && (
                <div className="poster">
                  <img
                    src={`${configBaseUrl}w342${movie.poster_path}`}
                    alt={movie.title}
                  />
                  <p className="overlay">{movie.overview}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
