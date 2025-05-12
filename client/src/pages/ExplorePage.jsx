import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Import the Navbar component
  import ExplorePageCard from '../components/ExplorePageCard'; // Import the InventoryPageCard component
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
      const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=25');
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
      const response = await axios.get('https://api.jikan.moe/v4/top/manga?limit=25');
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
    const mal_id = itemData.mal_id;
    setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'adding' } }));

    // Base payload common to both anime and manga
    let payload = {
      mal_id: mal_id,
      title: itemData.title,
      coverImage: itemData.images?.jpg?.image_url || null,
      synopsis: itemData.synopsis || null,
      apiStatus: itemData.status || null,
      apiScore: itemData.score || null,
      source: itemData.source || null,
      genres: itemData.genres?.map(g => g.name) || [],
    };

    let endpoint = '';

    // Determine the endpoint and payload based on the item type
    if (type === 'anime') {
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
        totalVolumes: itemData.volumes || null,
        publishedFrom: itemData.published?.from || null,
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
      
      // Check if this is a duplicate error from the backend
      if (err.response && err.response.status === 409) {
        // Use the specific message from the backend
        setAddStatus(prev => ({ 
          ...prev, 
          [mal_id]: { 
            status: 'error', 
            message: err.response.data.message || 'This item is already in your inventory'
          } 
        }));
      } else {
        // Handle other types of errors
        setAddStatus(prev => ({ 
          ...prev, 
          [mal_id]: { 
            status: 'error', 
            message: err.message || `Error adding ${type}` 
          } 
        }));
      }
      
      // Clear the error message after a timeout
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
              {results.map((item) => (
                <ExplorePageCard
                  key={item.mal_id}
                  item={item}
                  type={searchType}
                  addStatus={addStatus}
                  handleAddItemToInventory={handleAddItemToInventory}
                />
              ))}
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
              <h2>Top 25 Anime - Voted by Community</h2>
              {loadingTop.anime ? (
                <p>Loading top anime...</p>
              ) : (
                <div className="results-grid">
                  {topAnime.map(anime => (
                    <ExplorePageCard
                      key={anime.mal_id}
                      item={anime}
                      type="anime"
                      addStatus={addStatus}
                      handleAddItemToInventory={handleAddItemToInventory}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Top Manga Section */}
            <div className="top-section">
              <h2>Top 25 Manga - Voted by Community</h2>
              {loadingTop.manga ? (
                <p>Loading top manga...</p>
              ) : (
                <div className="results-grid">
                  {topManga.map(manga => (
                    <ExplorePageCard
                      key={manga.mal_id}
                      item={manga}
                      type="manga"
                      addStatus={addStatus}
                      handleAddItemToInventory={handleAddItemToInventory}
                    />
                  ))}
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