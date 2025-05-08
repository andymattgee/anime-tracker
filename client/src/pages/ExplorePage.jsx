import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Import the Navbar component
import './ExplorePage.css'; // Import the CSS file

const ExplorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('anime'); // 'anime' or 'manga'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addStatus, setAddStatus] = useState({}); // { [mal_id]: 'adding' | 'added' | 'error', message?: string }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    const JIKAN_API_URL = `https://api.jikan.moe/v4/${searchType}?q=${encodeURIComponent(searchTerm)}&limit=20`;

    try {
      const response = await axios.get(JIKAN_API_URL);
      setResults(response.data.data || []); // Jikan API wraps results in a 'data' object
    } catch (err) {
      console.error("Error fetching data from Jikan API:", err);
      setError(`Failed to fetch ${searchType}. Please try again.`);
      // Handle specific errors if needed (e.g., rate limiting 429)
      if (err.response && err.response.status === 429) {
        setError('Rate limited by Jikan API. Please wait a moment and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding anime to inventory
  const handleAddAnime = async (animeData) => {
    const mal_id = animeData.mal_id;
    setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'adding' } }));

    try {
      // Construct payload with all required and new fields from the animeData (Jikan item)
      const payload = {
        mal_id: mal_id,
        title: animeData.title,
        totalEpisodes: animeData.episodes || null,
        coverImage: animeData.images?.jpg?.image_url || null,
        synopsis: animeData.synopsis || null,
        apiStatus: animeData.status || null, // Airing status from Jikan
        apiScore: animeData.score || null,   // Community score from Jikan
        trailerUrl: animeData.trailer?.url || null,
        source: animeData.source || null,
        genres: animeData.genres?.map(g => g.name) || [], // Extract genre names
        airedFrom: animeData.aired?.from || null,
        airedTo: animeData.aired?.to || null,
      };

      const response = await axios.post('http://localhost:5001/api/search/add', payload);

      if (response.data.success) {
        setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'added', message: 'Added!' } }));
        // Optionally disable button or show success state permanently after adding
        // setTimeout(() => {
        //   setAddStatus(prev => ({ ...prev, [mal_id]: undefined })); // Reset status after a delay
        // }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to add anime');
      }
    } catch (err) {
      console.error('Error adding anime:', err);
      setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'error', message: err.message || 'Error adding' } }));
       // Optionally reset status after a delay
       setTimeout(() => {
         setAddStatus(prev => ({ ...prev, [mal_id]: undefined }));
       }, 3000);
    }
  };


  return (
    <> {/* Use a Fragment to wrap multiple elements */}
      <Navbar /> {/* Render the Navbar */}
      <div className="explore-page">
        <h1>Explore Anime & Manga</h1>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
          <input
            type="text"
            placeholder={`Search for ${searchType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="search-type-select"
          >
            <option value="anime">Anime</option>
            <option value="manga">Manga</option>
          </select>
          <button type="submit" disabled={loading} className="search-button">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="results-grid">
        {results.length > 0 ? (
          results.map((item) => (
            <div key={item.mal_id} className="result-card">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <img src={item.images?.jpg?.image_url} alt={item.title} />
                <h3>{item.title}</h3>
                {item.score && <p>Score: {item.score}</p>}
                {item.episodes && <p>Episodes: {item.episodes}</p>}
                {item.chapters && <p>Chapters: {item.chapters}</p>}
              </a>
              {/* Add button only if it's an anime search result */}
              {searchType === 'anime' && (
                <button
                  className={`add-inventory-button ${addStatus[item.mal_id]?.status || ''}`}
                  onClick={() => handleAddAnime(item)}
                  disabled={addStatus[item.mal_id]?.status === 'adding' || addStatus[item.mal_id]?.status === 'added'}
                >
                  {addStatus[item.mal_id]?.status === 'adding' ? 'Adding...' :
                   addStatus[item.mal_id]?.status === 'added' ? 'Added ✓' :
                   addStatus[item.mal_id]?.status === 'error' ? 'Error' :
                   'Add to Inventory'}
                </button>
              )}
               {addStatus[item.mal_id]?.status === 'error' && (
                 <p className="add-error-message">{addStatus[item.mal_id]?.message}</p>
               )}
            </div>
          ))
        ) : (
          !loading && searchTerm && <p>No results found for "{searchTerm}".</p>
        )}
      </div>
    </div>
  </>
  );
};

export default ExplorePage;