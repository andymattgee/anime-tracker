import React from 'react';
import { Link } from 'react-router-dom';
import './GenreList.css'; // We'll create this CSS file next

const genres = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 5, name: 'Avant Garde' },
  { id: 46, name: 'Award Winning' },
  { id: 28, name: 'Boys Love' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 26, name: 'Girls Love' },
  { id: 47, name: 'Gourmet' },
  { id: 14, name: 'Horror' },
  { id: 7, name: 'Mystery' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 30, name: 'Sports' },
  { id: 37, name: 'Supernatural' },
  { id: 41, name: 'Suspense' }, 
];

const GenreList = () => {
  return (
    <div className="genre-list-section">
      <h2>Browse by Genre - Top 50 Anime (Top 50 Manga Coming Soon)</h2>
      <div className="genre-grid">
        {genres.map(genre => (
          <Link
            key={genre.id}
            to={`/genre/${encodeURIComponent(genre.name)}/${genre.id}`}
            className="genre-link"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GenreList;