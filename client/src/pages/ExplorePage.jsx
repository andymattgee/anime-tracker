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

  // Function to handle adding item (anime or manga) to inventory
  const handleAddItemToInventory = async (itemData) => {
    const mal_id = itemData.mal_id;
    setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'adding' } }));

    // Base payload common to both anime and manga
    let payload = {
      mal_id: mal_id,
      title: itemData.title,
      coverImage: itemData.images?.jpg?.image_url || null,
      synopsis: itemData.synopsis || null,
      apiStatus: itemData.status || null, // Jikan's 'status' field (e.g., "Finished Airing", "Publishing")
      apiScore: itemData.score || null,
      source: itemData.source || null,
      genres: itemData.genres?.map(g => g.name) || [],
      // User-specific fields can be defaulted by the backend or passed if needed
      // userStatus: 'Plan to Watch/Read', // Example, backend handles defaults
      // episodesWatched: 0,
      // chaptersRead: 0,
      // userScore: null,
      // userNotes: '',
    };

    let endpoint = '';

    if (searchType === 'anime') {
      endpoint = 'http://localhost:5001/api/anime/create';
      payload = {
        ...payload,
        totalEpisodes: itemData.episodes || null,
        trailerUrl: itemData.trailer?.url || null,
        airedFrom: itemData.aired?.from || null,
        airedTo: itemData.aired?.to || null,
      };
    } else { // manga
      endpoint = 'http://localhost:5001/api/manga/create';
      payload = {
        ...payload,
        totalChapters: itemData.chapters || null,
        totalVolumes: itemData.volumes || null, // Jikan API provides 'volumes' for manga
        publishedFrom: itemData.published?.from || null, // Jikan uses 'published' for manga dates
        publishedTo: itemData.published?.to || null,
      };
    }

    try {
      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'added', message: `${searchType.charAt(0).toUpperCase() + searchType.slice(1)} added!` } }));
      } else {
        throw new Error(response.data.message || `Failed to add ${searchType}`);
      }
    } catch (err) {
      console.error(`Error adding ${searchType}:`, err);
      setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'error', message: err.message || `Error adding ${searchType}` } }));
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
              {/* Button to add item to inventory, works for both anime and manga */}
              <button
                className={`add-inventory-button ${addStatus[item.mal_id]?.status || ''}`}
                onClick={() => handleAddItemToInventory(item)}
                disabled={addStatus[item.mal_id]?.status === 'adding' || addStatus[item.mal_id]?.status === 'added'}
              >
                {addStatus[item.mal_id]?.status === 'adding' ? `Adding ${searchType}...` :
                 addStatus[item.mal_id]?.status === 'added' ? `${searchType.charAt(0).toUpperCase() + searchType.slice(1)} Added ✓` :
                 addStatus[item.mal_id]?.status === 'error' ? 'Error' :
                 `Add ${searchType.charAt(0).toUpperCase() + searchType.slice(1)} to Inventory`}
              </button>
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