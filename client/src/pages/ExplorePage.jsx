import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Import the Navbar component
import './ExplorePage.css'; // Import the CSS file

const ExplorePage = () => {
  // State variables for managing search functionality
  const [searchTerm, setSearchTerm] = useState(''); // The term to search for
  const [results, setResults] = useState([]); // The search results from the API
  const [searchType, setSearchType] = useState('anime'); // Type of search: 'anime' or 'manga'
  const [loading, setLoading] = useState(false); // Loading state for the search
  const [error, setError] = useState(null); // Error state for handling API errors
  const [addStatus, setAddStatus] = useState({}); // Status of adding items to inventory
  
  // New state variables for top anime and manga
  const [topAnime, setTopAnime] = useState([]);
  const [topManga, setTopManga] = useState([]);
  const [loadingTop, setLoadingTop] = useState({ anime: false, manga: false });

  // Modified useEffect with staggered API requests
  useEffect(() => {
    // Fetch top anime first
    fetchTopAnime().then(() => {
      // Wait 1 second before fetching manga to avoid rate limiting
      setTimeout(() => {
        fetchTopManga();
      }, 1000);
    });
  }, []);

  // Function to fetch top anime from Jikan API
  const fetchTopAnime = async () => {
    setLoadingTop(prev => ({ ...prev, anime: true }));
    try {
      const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=10');
      setTopAnime(response.data.data || []);
      return true;
    } catch (err) {
      console.error("Error fetching top anime:", err);
      // Handle rate limiting with exponential backoff
      if (err.response && err.response.status === 429) {
        console.log("Rate limited, retrying after delay...");
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchTopAnime(); // Retry the request
      }
      return false;
    } finally {
      setLoadingTop(prev => ({ ...prev, anime: false }));
    }
  };

  // Function to fetch top manga from Jikan API
  const fetchTopManga = async () => {
    setLoadingTop(prev => ({ ...prev, manga: true }));
    try {
      const response = await axios.get('https://api.jikan.moe/v4/top/manga?limit=10');
      setTopManga(response.data.data || []);
    } catch (err) {
      console.error("Error fetching top manga:", err);
      // Handle rate limiting with exponential backoff
      if (err.response && err.response.status === 429) {
        console.log("Rate limited, retrying after delay...");
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchTopManga(); // Retry the request
      }
    } finally {
      setLoadingTop(prev => ({ ...prev, manga: false }));
    }
  };

  // Function to handle the search form submission
  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!searchTerm.trim()) return; // Exit if the search term is empty

    setLoading(true); // Set loading state to true
    setError(null); // Reset any previous errors
    setResults([]); // Clear previous results

    // Construct the API URL for the Jikan API based on the search type
    const JIKAN_API_URL = `https://api.jikan.moe/v4/${searchType}?q=${encodeURIComponent(searchTerm)}&limit=20`;

    try {
      // Fetch data from the Jikan API
      const response = await axios.get(JIKAN_API_URL);
      setResults(response.data.data || []); // Set results to the data returned from the API
    } catch (err) {
      console.error("Error fetching data from Jikan API:", err);
      setError(`Failed to fetch ${searchType}. Please try again.`); // Set error message
      // Handle specific errors if needed (e.g., rate limiting 429)
      if (err.response && err.response.status === 429) {
        setError('Rate limited by Jikan API. Please wait a moment and try again.');
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Function to handle adding an item (anime or manga) to the inventory
  const handleAddItemToInventory = async (itemData, type = searchType) => {
    const mal_id = itemData.mal_id; // Get the mal_id of the item
    setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'adding' } })); // Set adding status

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
    };

    let endpoint = ''; // Endpoint for the API request

    // Determine the endpoint and payload based on the item type
    if (type === 'anime') {
      endpoint = 'http://localhost:5001/api/anime/create'; // API endpoint for creating anime
      payload = {
        ...payload,
        totalEpisodes: itemData.episodes || null,
        trailerUrl: itemData.trailer?.url || null,
        airedFrom: itemData.aired?.from || null,
        airedTo: itemData.aired?.to || null,
      };
    } else { // manga
      endpoint = 'http://localhost:5001/api/manga/create'; // API endpoint for creating manga
      payload = {
        ...payload,
        totalChapters: itemData.chapters || null,
        totalVolumes: itemData.volumes || null, // Jikan API provides 'volumes' for manga
        publishedFrom: itemData.published?.from || null, // Jikan uses 'published' for manga dates
        publishedTo: itemData.published?.to || null,
      };
    }

    try {
      // Send a POST request to add the item to the inventory
      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        // Update the add status to indicate success
        setAddStatus(prev => ({ 
          ...prev, 
          [mal_id]: { 
            status: 'added', 
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} added!` 
          } 
        }));
      } else {
        throw new Error(response.data.message || `Failed to add ${type}`);
      }
    } catch (err) {
      console.error(`Error adding ${type}:`, err);
      // Update the add status to indicate an error
      setAddStatus(prev => ({ 
        ...prev, 
        [mal_id]: { 
          status: 'error', 
          message: err.message || `Error adding ${type}` 
        } 
      }));
      // Clear the error message after a timeout
      setTimeout(() => {
        setAddStatus(prev => ({ ...prev, [mal_id]: undefined }));
      }, 3000);
    }
  };

  // Common card component for rendering anime/manga items
  const renderItemCard = (item, type) => (
    <div key={item.mal_id} className="result-card">
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        <img src={item.images?.jpg?.image_url} alt={item.title} />
        <h3>{item.title}</h3>
        {item.score && <p>Score: {item.score}</p>} {/* Display score if available */}
        {item.episodes && <p>Episodes: {item.episodes}</p>} {/* Display episodes if available */}
        {item.chapters && <p>Chapters: {item.chapters}</p>} {/* Display chapters if available */}
      </a>
      {/* Button to add item to inventory */}
      <button
        className={`add-inventory-button ${addStatus[item.mal_id]?.status || ''}`}
        onClick={() => handleAddItemToInventory(item, type)} // Call function to add item to inventory
        disabled={addStatus[item.mal_id]?.status === 'adding' || addStatus[item.mal_id]?.status === 'added'} // Disable button if adding or already added
      >
        {addStatus[item.mal_id]?.status === 'adding' ? `Adding ${type}...` :
         addStatus[item.mal_id]?.status === 'added' ? `${type.charAt(0).toUpperCase() + type.slice(1)} Added ✓` :
         addStatus[item.mal_id]?.status === 'error' ? 'Error' :
         `Add to ${type.charAt(0).toUpperCase() + type.slice(1)} Inventory`}
      </button>
      {addStatus[item.mal_id]?.status === 'error' && (
        <p className="add-error-message">{addStatus[item.mal_id]?.message}</p> // Display error message if adding failed
      )}
    </div>
  );

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
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
              className="search-input"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)} // Update search type on selection change
              className="search-type-select"
            >
              <option value="anime">Anime</option>
              <option value="manga">Manga</option>
            </select>
            <button type="submit" disabled={loading} className="search-button">
              {loading ? 'Searching...' : 'Search'} {/* Show loading text if searching */}
            </button>
          </div>
        </form>

        {error && <p className="error-message">{error}</p>} {/* Display error message if any */}

        {/* Display search results if available */}
        {results.length > 0 ? (
          <div className="search-results-section">
            <h2>Search Results</h2>
            <div className="results-grid">
              {results.map((item) => renderItemCard(item, searchType))}
            </div>
          </div>
        ) : (
          !loading && searchTerm && <p>No results found for "{searchTerm}".</p> // Show message if no results found
        )}

        {/* If no search has been performed, show top anime and manga */}
        {!searchTerm && (
          <>
            {/* Top Anime Section */}
            <div className="top-section">
              <h2>Top Anime</h2>
              {loadingTop.anime ? (
                <p>Loading top anime...</p>
              ) : (
                <div className="results-grid">
                  {topAnime.map(anime => renderItemCard(anime, 'anime'))}
                </div>
              )}
            </div>

            {/* Top Manga Section */}
            <div className="top-section">
              <h2>Top Manga</h2>
              {loadingTop.manga ? (
                <p>Loading top manga...</p>
              ) : (
                <div className="results-grid">
                  {topManga.map(manga => renderItemCard(manga, 'manga'))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ExplorePage;