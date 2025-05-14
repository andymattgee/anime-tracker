import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ExplorePageCard from '../components/ExplorePageCard';
import DetailsModal from '../components/DetailsModal';
import { useAuth } from '../context/AuthContext';
import './ExplorePage.css'; // Can reuse ExplorePage styles for grid and cards

const GenrePage = () => {
  const { genreName, genreId } = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addStatus, setAddStatus] = useState({});
  const { token, isAuthenticated } = useAuth();

  const [viewingDetailsItem, setViewingDetailsItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnimeByGenre();
    }, 1500); // 2-second delay to avoid hittin rate limits from jikan api

    return () => clearTimeout(timer); // Cleanup the timer if the component unmounts or genreId changes
  }, [genreId]);

  const fetchAnimeByGenre = async () => {
    setLoading(true);
    setError(null);
    setAnimeList([]);
    try {
      // Fetch top 50 anime for the genre, ordered by score
      // Jikan API limit is 25 per page, so we fetch two pages.
      const params = {
        genres: genreId,
        limit: 25,
        order_by: 'score',
        sort: 'desc',
        sfw: true,
      };

      const responsePage1 = await axios.get('https://api.jikan.moe/v4/anime', { params: { ...params, page: 1 } });
      // Add a small delay between API calls to respect rate limits if necessary,
      // though Jikan's rate limits are generally per endpoint per second.
      // For simplicity here, we'll proceed directly. If rate limiting becomes an issue,
      // a delay (e.g., await new Promise(resolve => setTimeout(resolve, 500));) can be added.

      const responsePage2 = await axios.get('https://api.jikan.moe/v4/anime', { params: { ...params, page: 2 } });

      const page1Data = responsePage1.data.data || [];
      const page2Data = responsePage2.data.data || [];
      
      setAnimeList([...page1Data, ...page2Data]);

    } catch (err) {
      console.error(`Error fetching anime for genre ID ${genreId}:`, err);
      let errorMessage = `Failed to fetch anime for ${decodeURIComponent(genreName)}.`;
      if (err.response && err.response.status === 429) {
        errorMessage = 'Rate limited by Jikan API. Please wait a moment and try again.';
      } else if (err.response && err.response.status === 400) {
        errorMessage = `Invalid request for genre ${decodeURIComponent(genreName)}. Please check the genre ID.`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemToInventory = async (itemData, type = 'anime') => { // Type is always anime here
    if (!isAuthenticated) {
      setAddStatus(prev => ({
        ...prev,
        [itemData.mal_id]: { status: 'error', message: 'Please log in to add items.' }
      }));
      setTimeout(() => setAddStatus(prev => ({ ...prev, [itemData.mal_id]: undefined })), 3000);
      return;
    }

    const { mal_id } = itemData;
    setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'adding' } }));

    const payload = {
      mal_id,
      title: itemData.title,
      title_english: itemData.title_english || null,
      coverImage: itemData.images?.jpg?.image_url || null,
      synopsis: itemData.synopsis || null,
      apiStatus: itemData.status || null,
      apiScore: itemData.score || null,
      source: itemData.source || null,
      genres: itemData.genres?.map(g => g.name) || [],
      totalEpisodes: itemData.episodes || null,
      trailerUrl: itemData.trailer?.url || null,
      airedFrom: itemData.aired?.from || null,
      airedTo: itemData.aired?.to || null,
    };

    const endpoint = 'http://localhost:5001/api/anime/create';

    try {
      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'added', message: 'Anime added!' } }));
      } else {
        throw new Error(response.data.message || 'Failed to add anime');
      }
    } catch (err) {
      console.error('Error adding anime:', err);
      let message = 'Error adding anime.';
      if (err.response) {
        if (err.response.status === 409) message = err.response.data.message || 'Already in inventory.';
        else if (err.response.status === 401) message = 'Please log in.';
        else if (err.response.data?.message) message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      setAddStatus(prev => ({ ...prev, [mal_id]: { status: 'error', message } }));
      setTimeout(() => setAddStatus(prev => ({ ...prev, [mal_id]: undefined })), 3000);
    }
  };

  const handleCardClick = (item, itemType = 'anime') => { // itemType is always 'anime' here
    const modalItem = {
      ...item,
      coverImage: item.images?.jpg?.image_url,
      synopsis: item.synopsis,
      apiStatus: item.status,
      apiScore: item.score,
      source: item.source,
      genres: item.genres?.map(g => g.name),
      airedFrom: item.aired?.from,
      airedTo: item.aired?.to,
      trailerUrl: item.trailer?.url,
      userStatus: '',
      episodesWatched: '',
      chaptersRead: '', // N/A for anime
      userScore: '',
      userNotes: '',
      progress: `Eps: ${item.episodes || '?'}`,
      itemType: 'anime', // Explicitly set
    };
    setViewingDetailsItem(modalItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setViewingDetailsItem(null);
  };
  
  // Optional: if adding recommendations from modal should refresh this page
  const handleRecommendationAdded = () => {
    // Could refetch genre list if needed, but likely not for this page's context
    console.log("Recommendation added, GenrePage notified.");
  };

  return (
    <>
      <Navbar />
      <div className="explore-page page-container" style={{ padding: '20px' }}> {/* Reusing explore-page class for layout consistency */}
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Top 50 Anime for Genre: {decodeURIComponent(genreName)}
        </h1>
        
        <Link to="/explore" style={{ display: 'inline-block', marginBottom: '2rem', color: '#007bff', textDecoration: 'none' }}>
          &larr; Back to Explore Page
        </Link>

        {loading && <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading anime...</p>}
        {error && <p className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
        
        {!loading && !error && animeList.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>No anime found for this genre, or the API limit might have been reached. Try again shortly.</p>
        )}

        {!loading && !error && animeList.length > 0 && (
          <div className="results-grid">
            {animeList.map((item) => (
              <ExplorePageCard
                key={item.mal_id}
                item={item}
                type="anime" // Explicitly "anime"
                addStatus={addStatus}
                handleAddItemToInventory={handleAddItemToInventory}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {isModalOpen && viewingDetailsItem && (
          <DetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            item={viewingDetailsItem}
            mediaType="anime" // Explicitly "anime"
            onRecommendationAdded={handleRecommendationAdded}
            onAddItem={handleAddItemToInventory}
            itemAddStatus={addStatus[viewingDetailsItem?.mal_id]}
            showAddButton={true}
          />
        )}
      </div>
    </>
  );
};

export default GenrePage;