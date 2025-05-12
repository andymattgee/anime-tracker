import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

const DetailsModal = ({ isOpen, onClose, item, onSave, onDelete, mediaType, onRecommendationAdded }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [recommendationAddStatus, setRecommendationAddStatus] = useState({}); // Tracks add status for each recommendation

  useEffect(() => {
    if (item) {
      const initialUserScore = item.userScore !== null && item.userScore !== undefined
        ? item.userScore
        : (item.rating !== null && item.rating !== undefined ? item.rating : '');

      setEditForm({
        episodesWatched: item.episodesWatched || '',
        chaptersRead: item.chaptersRead || '',
        userStatus: item.userStatus || item.status || '',
        userScore: initialUserScore,
        userNotes: item.userNotes || item.notes || ''
      });

      if (isOpen && item.mal_id) {
        fetchRecommendations(mediaType, item.mal_id);
      } else {
        setRecommendations([]); // Clear recommendations if modal is closed or no item
      }

      if (!isOpen) {
        setIsEditing(false);
        setRecommendations([]);
        setLoadingRecommendations(false);
        setRecommendationsError(null);
        setRecommendationAddStatus({});
      }
    } else {
      setIsEditing(false);
      setRecommendations([]);
      setLoadingRecommendations(false);
      setRecommendationsError(null);
      setRecommendationAddStatus({});
    }
  }, [item, isOpen, mediaType]);

  const handleAddRecommendedItemToInventory = async (recommendedItemEntry) => {
    const recMalId = recommendedItemEntry.mal_id;
    let recommendedItemType = 'anime'; // Default
    if (recommendedItemEntry.url && recommendedItemEntry.url.includes('/manga/')) {
      recommendedItemType = 'manga';
    }

    setRecommendationAddStatus(prev => ({
      ...prev,
      [recMalId]: { status: 'fetching_details', message: 'Fetching details...' }
    }));

    try {
      // Introduce a delay before fetching full details
      await new Promise(resolve => setTimeout(resolve, 300));
      const fullDetailsResponse = await axios.get(`https://api.jikan.moe/v4/${recommendedItemType}/${recMalId}`);
      const itemData = fullDetailsResponse.data.data;

      setRecommendationAddStatus(prev => ({
        ...prev,
        [recMalId]: { status: 'adding', message: 'Adding to inventory...' }
      }));

      let payload = {
        mal_id: itemData.mal_id,
        title: itemData.title,
        title_english: itemData.title_english || null,
        coverImage: itemData.images?.jpg?.image_url || null,
        synopsis: itemData.synopsis || null,
        apiStatus: itemData.status || null, // Jikan uses 'status' for airing/publishing status
        apiScore: itemData.score || null,
        source: itemData.source || null,
        genres: itemData.genres?.map(g => g.name) || [],
      };

      let endpoint = '';
      if (recommendedItemType === 'anime') {
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

      const addResponse = await axios.post(endpoint, payload);

      if (addResponse.data.success) {
        setRecommendationAddStatus(prev => ({
          ...prev,
          [recMalId]: { status: 'added', message: `${recommendedItemType.charAt(0).toUpperCase() + recommendedItemType.slice(1)} added!` }
        }));
        if (onRecommendationAdded) {
          onRecommendationAdded(); // Notify parent to refresh
        }
      } else {
        throw new Error(addResponse.data.message || `Failed to add ${recommendedItemType}`);
      }
    } catch (err) {
      console.error(`Error adding recommended ${recommendedItemType} ${recMalId}:`, err);
      let message = `Error adding.`;
      if (err.response) {
        if (err.response.status === 409) message = 'Already in inventory.';
        else if (err.response.status === 429) message = 'API rate limit. Try later.';
        else if (err.response.data && err.response.data.message) message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      setRecommendationAddStatus(prev => ({
        ...prev,
        [recMalId]: { status: 'error', message }
      }));
      // Optionally clear error after a few seconds
      setTimeout(() => {
        setRecommendationAddStatus(prev => {
          const newStatus = { ...prev };
          if (newStatus[recMalId]?.status === 'error') {
            // Reset to 'idle' to allow retry, or just clear the message
            newStatus[recMalId] = { status: 'idle', message: null };
          }
          return newStatus;
        });
      }, 4000);
    }
  };

  const fetchRecommendations = async (type, malId) => {
    setLoadingRecommendations(true);
    setRecommendationsError(null);
    setRecommendations([]);
    try {
      // Short delay to help with Jikan API rate limits if modals are opened rapidly
      await new Promise(resolve => setTimeout(resolve, 300));
      const response = await axios.get(`https://api.jikan.moe/v4/${type}/${malId}/recommendations`);
      setRecommendations(response.data.data.slice(0, 10) || []); // Take top 10
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      if (err.response && err.response.status === 429) {
        setRecommendationsError("Rate limited fetching recommendations. Please try again in a moment.");
      } else {
        setRecommendationsError("Could not fetch recommendations.");
      }
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (!isOpen || !item) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault(); 
    const saveData = {
      userStatus: editForm.userStatus,
      userScore: editForm.userScore === '' ? null : Number(editForm.userScore),
      userNotes: editForm.userNotes,
    };
    if (mediaType === 'anime') {
      saveData.episodesWatched = Number(editForm.episodesWatched);
    } else {
      saveData.chaptersRead = Number(editForm.chaptersRead);
    }
    onSave(item.id, saveData);
    setIsEditing(false); 
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (item) {
        const originalUserScore = item.userScore !== null && item.userScore !== undefined 
        ? item.userScore 
        : (item.rating !== null && item.rating !== undefined ? item.rating : '');
      setEditForm({
        episodesWatched: item.episodesWatched || '',
        chaptersRead: item.chaptersRead || '',
        userStatus: item.userStatus || item.status || '',
        userScore: originalUserScore,
        userNotes: item.userNotes || item.notes || ''
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const progressKey = mediaType === 'anime' ? 'episodesWatched' : 'chaptersRead';
  const progressLabel = mediaType === 'anime' ? 'Episodes Watched' : 'Chapters Read';
  const statusLabelApi = mediaType === 'anime' ? 'Airing Status' : 'Publishing Status';
  const airedLabel = mediaType === 'anime' ? 'Aired' : 'Published';
  
  const statusOptions = mediaType === 'anime' 
    ? ["Watching", "Completed", "Plan to Watch", "Dropped"]
    : ["Reading", "Completed", "Plan to Read", "Dropped"];

  const displayUserStatus = item.userStatus || item.status;
  const displayUserScore = item.userScore !== null && item.userScore !== undefined ? item.userScore : item.rating;
  const displayUserNotes = item.userNotes || item.notes;

  const linkStyle = {
    cursor: 'pointer',
    color: 'blue',
    textDecoration: 'underline',
    marginLeft: '10px',
    fontSize: '0.9em'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {item.title_english || item.title}
          {item.title_english && item.title && item.title_english !== item.title && (
            <span style={{ display: 'block', fontSize: '0.8em', fontWeight: 'normal', marginTop: '0.2em' }}>
              ({item.title})
            </span>
          )}
           - Details
        </h2>
        
        <div className="details-content">
          {item.coverImage && <img
            src={item.coverImage}
            alt={
              item.title_english
                ? (item.title && item.title_english !== item.title ? `${item.title_english} (${item.title}) cover` : `${item.title_english} cover`)
                : `${item.title} cover`
            }
            className="details-modal-image"
          />}
          <div className="details-text">
            <p><strong>Synopsis:</strong> {item.synopsis || 'N/A'}</p>
            <hr />
            <h4>Your Tracking: 
              {!isEditing &&
                <span
                  style={linkStyle}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </span>
              }
            </h4>
            {isEditing ? (
              <div> {/* Changed form to div to avoid nested forms if handleSave is called directly */}
                <div className="form-group">
                  <label>Status:</label>
                  <select name="userStatus" value={editForm.userStatus} onChange={handleInputChange} required>
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>{progressLabel}:</label>
                  <input type="number" name={progressKey} value={editForm[progressKey]} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Your Score (0-10):</label>
                  <input type="number" name="userScore" value={editForm.userScore} onChange={handleInputChange} min="0" max="10" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Notes:</label>
                  <textarea name="userNotes" value={editForm.userNotes} onChange={handleInputChange} />
                </div>
                <div style={{ marginTop: '10px' }}>
                  <span style={linkStyle} onClick={handleSave}>
                    Save Changes
                  </span>
                  <span style={{...linkStyle, marginLeft: '15px', color: 'gray' }} onClick={handleCancelEdit}>
                    Cancel
                  </span>
                </div>
              </div>
            ) : (
              <>
                <p><strong>Status:</strong> {displayUserStatus}</p>
                <p><strong>Progress:</strong> {item.progress}</p>
                <p><strong>Your Score:</strong> {displayUserScore !== null && displayUserScore !== undefined ? `${displayUserScore}/10` : 'N/A'}</p>
                <p><strong>Notes:</strong> {displayUserNotes || 'None'}</p>
              </>
            )}
            <hr />
            <h4>General Information:</h4>
            <p><strong>MAL ID:</strong> {item.mal_id || 'N/A'}</p>
            <p><strong>{statusLabelApi}:</strong> {item.apiStatus || 'N/A'}</p>
            <p><strong>Community Score:</strong> {item.apiScore || 'N/A'}</p>
            <p><strong>Source:</strong> {item.source || 'N/A'}</p>
            <p><strong>Genres:</strong> {item.genres?.join(', ') || 'N/A'}</p>
            <p><strong>{airedLabel}:</strong> {formatDate(item.airedFrom)} to {formatDate(item.airedTo)}</p>
            {mediaType === 'anime' && item.trailerUrl && <p><strong>Trailer:</strong> <a href={item.trailerUrl} target="_blank" rel="noopener noreferrer">Watch Here</a></p>}
            <hr />
            <h4>Recommendations:</h4>
            {loadingRecommendations && <p>Loading recommendations...</p>}
            {recommendationsError && <p className="error-message" style={{color: 'red'}}>{recommendationsError}</p>}
            {!loadingRecommendations && !recommendationsError && recommendations.length === 0 && <p>No recommendations found.</p>}
            {!loadingRecommendations && !recommendationsError && recommendations.length > 0 && (
              <div className="recommendations-grid" style={{ display: 'flex', overflowX: 'auto', paddingBottom: '10px', gap: '10px' }}>
                {recommendations.map(rec => {
                  const recMalId = rec.entry.mal_id;
                  const currentAddStatus = recommendationAddStatus[recMalId] || { status: 'idle', message: null };
                  let buttonText = 'Add to Inventory';
                  let buttonDisabled = false;

                  if (currentAddStatus.status === 'fetching_details') {
                    buttonText = 'Fetching...';
                    buttonDisabled = true;
                  } else if (currentAddStatus.status === 'adding') {
                    buttonText = 'Adding...';
                    buttonDisabled = true;
                  } else if (currentAddStatus.status === 'added') {
                    buttonText = 'Added ✓';
                    buttonDisabled = true;
                  } else if (currentAddStatus.status === 'error') {
                    buttonText = 'Error'; // Message shown below
                    // Keep button enabled to allow retry unless it's a 409 (already exists)
                    if (currentAddStatus.message === 'Already in inventory.') {
                        buttonDisabled = true;
                        buttonText = 'In Inventory';
                    }
                  }

                  let itemTypeForButton = 'Item';
                  if (rec.entry.url) {
                      if (rec.entry.url.includes('/anime/')) itemTypeForButton = 'Anime';
                      else if (rec.entry.url.includes('/manga/')) itemTypeForButton = 'Manga';
                  }

                  return (
                    <div key={recMalId} className="recommendation-card" style={{ border: '1px solid #eee', borderRadius: '4px', padding: '10px', minWidth: '130px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <a href={rec.entry.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img
                          src={rec.entry.images?.jpg?.image_url}
                          alt={rec.entry.title_english || rec.entry.title}
                          style={{ width: '100px', height: '140px', objectFit: 'cover', borderRadius: '4px', marginBottom: '5px' }}
                        />
                        <p style={{ fontSize: '0.8em', margin: '5px 0', wordBreak: 'break-word', minHeight: '2.4em' }}>
                          {rec.entry.title_english || rec.entry.title}
                        </p>
                      </a>
                      <button
                        onClick={() => handleAddRecommendedItemToInventory(rec.entry)}
                        disabled={buttonDisabled}
                        className={`btn btn-sm ${
                            currentAddStatus.status === 'added' || currentAddStatus.message === 'Already in inventory.' ? 'btn-success'
                            : currentAddStatus.status === 'error' ? 'btn-danger'
                            : 'btn-primary'
                        }`}
                        style={{ fontSize: '0.75em', padding: '3px 6px', width: '100%', marginTop: 'auto' }}
                      >
                        {buttonText === 'Error' && currentAddStatus.message !== 'Already in inventory.' ? 'Retry Add' : buttonText === 'Add to Inventory' ? `Add to ${itemTypeForButton}` : buttonText}
                      </button>
                      {currentAddStatus.status === 'error' && currentAddStatus.message && currentAddStatus.message !== 'Already in inventory.' && (
                          <p style={{ fontSize: '0.7em', color: 'red', marginTop: '3px', marginBottom: '0' }}>{currentAddStatus.message}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          {!isEditing && onDelete &&
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onClose(); 
                onDelete(item.id);
              }}
            >
              Delete
            </button>
          }
          {!isEditing &&
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          }
          {/* Save/Cancel for editing are now inline */}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;