import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Import the Navbar component
import ExplorePageCard from '../components/ExplorePageCard'; // Import the InventoryPageCard component
import DetailsModal from '../components/DetailsModal'; // Import DetailsModal
import './ExplorePage.css'; // Import the CSS file
import { useAuth } from '../context/AuthContext'; // Import auth context

const ExplorePage = () => {
  // State variables for managing search functionality
  const [searchTerm, setSearchTerm] = useState(''); // The term to search for
  const [results, setResults] = useState([]); // The search results from the API
  const [searchType, setSearchType] = useState('anime'); // Type of search: 'anime' or 'manga'
  const [loading, setLoading] = useState(false); // Loading state for the search
  const [error, setError] = useState(null); // Error state for handling API errors
  const [addStatus, setAddStatus] = useState({}); // Status of adding items to inventory
  const { token, isAuthenticated } = useAuth(); // Get token from auth context

  // State for DetailsModal
  const [viewingDetailsItem, setViewingDetailsItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for predictive search suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false); // Controls visibility of suggestions
  
  // Ref for the search input wrapper
  const searchWrapperRef = useRef(null);

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

  // Debounced effect for fetching suggestions
  useEffect(() => {
    const currentSearchTerm = searchTerm.trim();

    if (!currentSearchTerm) {
      setSuggestions([]);
      setShowSuggestions(false); // Hide suggestions if search term is cleared
      return;
    }

    // If main search is loading, don't fetch suggestions to avoid conflicts
    if (loading) {
      return;
    }

    const debounceTimer = setTimeout(async () => {
      // Ensure the term hasn't changed during the debounce period
      if (searchTerm.trim() === currentSearchTerm) {
        setLoadingSuggestions(true);
        try {
          const response = await axios.get(
            `https://api.jikan.moe/v4/${searchType}?q=${encodeURIComponent(currentSearchTerm)}&limit=7` // Fetch 7 suggestions
          );
          // Only update suggestions if the search term is still the same
          if (searchTerm.trim() === currentSearchTerm) {
            setSuggestions(response.data.data || []);
          }
        } catch (err) {
          console.error("Error fetching suggestions:", err);
          if (searchTerm.trim() === currentSearchTerm) {
            setSuggestions([]); // Clear suggestions on error
          }
        } finally {
          if (searchTerm.trim() === currentSearchTerm) {
            setLoadingSuggestions(false);
          }
        }
      }
    }, 300); // 300ms debounce time

    return () => clearTimeout(debounceTimer); // Cleanup timer
  }, [searchTerm, searchType, loading]); // Re-run on searchTerm, searchType, or main loading state change

  // Function to execute the main search (for full results)
  const executeSearch = async (termToSearch, typeToSearch) => {
    if (!termToSearch.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true); // Set main loading state to true
    setError(null); // Reset any previous errors
    setResults([]); // Clear previous main results
    // setSuggestions([]); // Suggestions are cleared by setShowSuggestions(false) or naturally
    setShowSuggestions(false); // Hide suggestions when a main search is performed

    const JIKAN_API_URL = `https://api.jikan.moe/v4/${typeToSearch}?q=${encodeURIComponent(termToSearch)}&limit=20`;

    try {
      const response = await axios.get(JIKAN_API_URL);
      setResults(response.data.data || []);
    } catch (err) {
      console.error(`Error fetching data for ${typeToSearch} from Jikan API:`, err);
      setError(`Failed to fetch ${typeToSearch}. Please try again.`);
      if (err.response && err.response.status === 429) {
        setError('Rate limited by Jikan API. Please wait a moment and try again.');
      }
      setResults([]); // Clear results on error
    } finally {
      setLoading(false); // Reset main loading state
    }
  };
 
  // Function to handle the search form submission
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setShowSuggestions(false); // Hide suggestions on form submit
    executeSearch(searchTerm, searchType);
  };

  // Function to handle clicking a suggestion
  const handleSuggestionClick = (suggestion) => {
    const mainTitle = suggestion.title;
    const englishTitle = suggestion.title_english;
    let displayTerm = mainTitle;
    if (englishTitle && englishTitle !== mainTitle) {
      displayTerm = `${mainTitle} / ${englishTitle}`;
    }
    setSearchTerm(displayTerm); // Update the input field
    // setSuggestions([]); // No longer needed, setShowSuggestions(false) handles hiding
    setShowSuggestions(false); // Hide suggestions after click
    executeSearch(mainTitle, searchType); // Perform a full search for the main title
  };

  // Effect to handle clicks outside the search wrapper to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  // Function to handle adding an item (anime or manga) to the inventory
  const handleAddItemToInventory = async (itemData, type = searchType) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setAddStatus(prev => ({ 
        ...prev, 
        [itemData.mal_id]: { 
          status: 'error', 
          message: 'Please log in to add items to your list' 
        } 
      }));
      
      // Clear the error message after a timeout
      setTimeout(() => {
        setAddStatus(prev => ({ ...prev, [itemData.mal_id]: undefined }));
      }, 3000);
      
      return;
    }
    
    const mal_id = itemData.mal_id;
    setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'adding' } }));

    // Base payload common to both anime and manga
    let payload = {
      mal_id: mal_id,
      title: itemData.title,
      title_english: itemData.title_english || null,
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
      // Send a POST request to add the item to the inventory with the auth token
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

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
      } else if (err.response && err.response.status === 401) {
        // Authentication error
        setAddStatus(prev => ({ 
          ...prev, 
          [mal_id]: { 
            status: 'error', 
            message: 'Please log in to add items to your list'
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

  // Handlers for DetailsModal
  const handleCardClick = (item, itemType) => {
    // The item from ExplorePageCard is directly from Jikan API
    // We need to map it to the structure expected by DetailsModal if it's different
    // For now, let's assume DetailsModal can handle the Jikan item structure
    // or that we will adjust DetailsModal or this mapping later if needed.
    // A key difference is that inventory items have an `id` (MongoDB _id),
    // while Jikan items have `mal_id`. DetailsModal uses `item.id` for onSave/onDelete.
    // For ExplorePage, onSave/onDelete are not directly applicable in the same way
    // as they are for inventory items. We might not pass onSave/onDelete or pass stubs.

    // Map Jikan item to a structure DetailsModal might expect for display
    // This mapping is basic and might need adjustment based on DetailsModal's exact needs
    // and what data is available from the Jikan 'item' object.
    const modalItem = {
      ...item,
      // Jikan specific fields that DetailsModal might use or we can map
      coverImage: item.images?.jpg?.image_url,
      // title_english: item.title_english, // already there
      // title: item.title, // already there
      synopsis: item.synopsis,
      apiStatus: item.status, // Jikan 'status' (e.g., "Finished Airing")
      apiScore: item.score,
      source: item.source,
      genres: item.genres?.map(g => g.name),
      airedFrom: itemType === 'anime' ? item.aired?.from : item.published?.from,
      airedTo: itemType === 'anime' ? item.aired?.to : item.published?.to,
      trailerUrl: itemType === 'anime' ? item.trailer?.url : null,
      // Fields DetailsModal expects for user tracking (will be empty/default for explore items)
      userStatus: '',
      episodesWatched: '',
      chaptersRead: '',
      userScore: '',
      userNotes: '',
      progress: itemType === 'anime' ? `Eps: ${item.episodes || '?'}` : `Ch: ${item.chapters || '?'}`,
      // mal_id is already present in item
      itemType: itemType // explicitly pass itemType to modalItem
    };
    setViewingDetailsItem(modalItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setViewingDetailsItem(null);
  };

  // This function might be needed if DetailsModal's "Add to Inventory" for recommendations
  // needs to refresh something on the ExplorePage, though typically it would refresh an inventory page.
  // For now, a stub or a function that refetches top items if a recommendation was added from there.
  const handleRecommendationAdded = () => {
    // Potentially refetch top anime/manga if the modal was opened from those sections
    // Or, more simply, do nothing specific on ExplorePage for now, as the primary
    // action of adding to inventory happens and the user would see it in their inventory.
    console.log("Recommendation added, ExplorePage notified.");
  };


  return (
    <> {/* Use a Fragment to wrap multiple elements */}
      <Navbar /> {/* Render the Navbar */}
      <div className="explore-page">
        <h1>Explore Anime & Manga</h1>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <div className="search-input-wrapper" ref={searchWrapperRef}>
              <input
                type="text"
                placeholder={`Search for ${searchType}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.trim()) {
                    setShowSuggestions(true); // Show suggestions when user types
                  } else {
                    setShowSuggestions(false); // Hide if input is cleared
                  }
                }}
                onFocus={() => {
                  // Show suggestions on focus if there's text and (either suggestions exist or loading is not for main search)
                  if (searchTerm.trim() && (suggestions.length > 0 || !loading)) {
                     setShowSuggestions(true);
                  } else if (searchTerm.trim()) {
                    // If there's a search term but no suggestions yet (e.g., after a full search cleared them, or initial focus),
                    // still set to true to allow the debounced effect to fetch them if applicable.
                    setShowSuggestions(true);
                  }
                }}
                className="search-input"
                autoComplete="off" // Disable browser's default autocomplete
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && searchTerm.trim() && !loading && (
                <ul className="suggestions-list">
                  {loadingSuggestions && <li className="suggestion-item-loading">Loading...</li>}
                  {!loadingSuggestions && suggestions.length > 0 && suggestions.map((suggestion) => (
                    <li
                      key={suggestion.mal_id}
                      className="suggestion-item"
                      // Using onMouseDown to ensure click registers before input blur hides list
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.images?.jpg?.small_image_url && (
                        <img
                          src={suggestion.images.jpg.small_image_url}
                          alt={suggestion.title_english && suggestion.title_english !== suggestion.title ? `${suggestion.title} / ${suggestion.title_english}` : suggestion.title}
                          className="suggestion-thumbnail"
                        />
                      )}
                      <span>
                        {suggestion.title}
                        {suggestion.title_english && suggestion.title_english !== suggestion.title && ` / ${suggestion.title_english}`}
                      </span>
                    </li>
                  ))}
                  {/* Show "No suggestions found" only if not loading suggestions, suggestions array is empty, and there is a search term */}
                  {!loadingSuggestions && suggestions.length === 0 && searchTerm.trim() && (
                     <li className="suggestion-item-none">No suggestions found.</li>
                  )}
                </ul>
              )}
            </div>
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
                  onCardClick={handleCardClick} // Pass the click handler
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
                      onCardClick={handleCardClick} // Pass the click handler
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
                      onCardClick={handleCardClick} // Pass the click handler
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {isModalOpen && viewingDetailsItem && (
          <DetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            item={viewingDetailsItem}
            mediaType={viewingDetailsItem.itemType} // Use the itemType from the clicked card
            // onSave, onDelete are not applicable here as these items are not in user's inventory yet
            // onSave={() => {}} // Placeholder or remove if not needed
            // onDelete={() => {}} // Placeholder or remove if not needed
            onRecommendationAdded={handleRecommendationAdded} // Handle if a recommended item is added
            // Props for the new "Add to Inventory" button from within the modal
            onAddItem={handleAddItemToInventory}
            itemAddStatus={addStatus[viewingDetailsItem?.mal_id]}
            showAddButton={true}
          />
        )}
      </div>
    </>
  );
};

export default ExplorePage;