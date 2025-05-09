import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './InventoryPage.css';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('anime');
  const [animeList, setAnimeList] = useState([]);
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAnime, setEditingAnime] = useState(null);
  const [editingManga, setEditingManga] = useState(null);
  const [viewingDetailsId, setViewingDetailsId] = useState(null); // State to track which item's details to view
  const [editForm, setEditForm] = useState({
    title: '',
    episodesWatched: '',
    totalEpisodes: '',
    userStatus: '', // Renamed
    userScore: '',  // Renamed
    userNotes: ''   // Renamed
  });
  const [editMangaForm, setEditMangaForm] = useState({
    title: '',
    chaptersRead: '',
    totalChapters: '',
    status: '', // Keep original manga status field name for now, assuming manga model wasn't changed
    score: '',  // Keep original manga score field name
    notes: ''   // Keep original manga notes field name
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error on new fetch

      if (activeTab === 'anime') {
        const response = await fetch('http://localhost:5001/api/anime');
        if (!response.ok) {
          throw new Error(`Failed to fetch anime data: ${response.statusText}`);
        }
        const result = await response.json();

        if (result.success) {
          const formattedAnime = result.data.map(anime => ({
            id: anime._id,
            title: anime.title,
            userStatus: anime.userStatus,
            progress: `Episode ${anime.episodesWatched}/${anime.totalEpisodes || '?'}`,
            userScore: anime.userScore,
            episodesWatched: anime.episodesWatched,
            totalEpisodes: anime.totalEpisodes,
            userNotes: anime.userNotes,
            coverImage: anime.coverImage,
            synopsis: anime.synopsis,
            apiStatus: anime.apiStatus,
            apiScore: anime.apiScore,
            trailerUrl: anime.trailerUrl,
            source: anime.source,
            genres: anime.genres,
            airedFrom: anime.airedFrom,
            airedTo: anime.airedTo,
            mal_id: anime.mal_id
          }));
          setAnimeList(formattedAnime);
        } else {
          throw new Error(result.message || 'Failed to fetch anime data');
        }
      } else {
        // Fetch manga data
        const response = await fetch('http://localhost:5001/api/manga');
        if (!response.ok) {
          throw new Error(`Failed to fetch manga data: ${response.statusText}`);
        }
        const result = await response.json();

        if (result.success) {
          // Assuming manga schema also has coverImage, adjust if needed
          const formattedManga = result.data.map(manga => ({
            id: manga._id,
            title: manga.title,
            status: manga.status, // Keep original field name for manga display
            progress: `Chapter ${manga.chaptersRead}/${manga.totalChapters || '?'}`,
            rating: manga.score, // Keep original field name for manga display
            chaptersRead: manga.chaptersRead,
            totalChapters: manga.totalChapters,
            notes: manga.notes, // Keep original field name for manga display
            coverImage: manga.coverImage,
             // Add other manga fields if they exist in the model and are needed for details view
            synopsis: manga.synopsis,
            apiStatus: manga.apiStatus, // Example, adjust if manga model differs
            apiScore: manga.apiScore,   // Example, adjust if manga model differs
            source: manga.source,     // Example, adjust if manga model differs
            genres: manga.genres,     // Example, adjust if manga model differs
            airedFrom: manga.airedFrom, // Example, adjust if manga model differs - manga usually uses 'published'
            airedTo: manga.airedTo,     // Example, adjust if manga model differs
            mal_id: manga.mal_id      // Example, adjust if manga model differs
          }));
          setMangaList(formattedManga);
        } else {
          throw new Error(result.message || 'Failed to fetch manga data');
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteAnime = async (id) => {
    if (window.confirm('Are you sure you want to delete this anime entry?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/anime/${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          setAnimeList(animeList.filter(anime => anime.id !== id));
        } else {
          throw new Error(result.message || 'Failed to delete anime');
        }
      } catch (err) {
        console.error('Error deleting anime:', err);
        setError(err.message);
      }
    }
  };

  const handleDeleteManga = async (id) => {
    if (window.confirm('Are you sure you want to delete this manga entry?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/manga/${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          setMangaList(mangaList.filter(manga => manga.id !== id));
        } else {
          throw new Error(result.message || 'Failed to delete manga');
        }
      } catch (err) {
        console.error('Error deleting manga:', err);
        setError(err.message);
      }
    }
  };

  const handleEditAnime = (anime) => {
    setEditingAnime(anime);
    setEditForm({
      title: anime.title,
      episodesWatched: anime.episodesWatched,
      totalEpisodes: anime.totalEpisodes,
      userStatus: anime.userStatus,
      userScore: anime.userScore,
      userNotes: anime.userNotes
    });
  };

  const handleEditManga = (manga) => {
    setEditingManga(manga);
    // Use original field names for manga edit form state
    setEditMangaForm({
      title: manga.title,
      chaptersRead: manga.chaptersRead,
      totalChapters: manga.totalChapters,
      status: manga.status,
      score: manga.rating, // Use 'rating' as fetched
      notes: manga.notes
    });
  };

  const handleEditAnimeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/anime/${editingAnime.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send renamed fields to backend
        body: JSON.stringify({
            title: editForm.title,
            episodesWatched: editForm.episodesWatched,
            totalEpisodes: editForm.totalEpisodes,
            userStatus: editForm.userStatus,
            userScore: editForm.userScore,
            userNotes: editForm.userNotes
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedAnime = result.data;
        // Update list with correct fields
        setAnimeList(animeList.map(anime =>
          anime.id === updatedAnime._id
            ? {
                ...anime, // Keep existing API data
                title: updatedAnime.title,
                userStatus: updatedAnime.userStatus,
                progress: `Episode ${updatedAnime.episodesWatched}/${updatedAnime.totalEpisodes || '?'}`,
                userScore: updatedAnime.userScore,
                episodesWatched: updatedAnime.episodesWatched,
                totalEpisodes: updatedAnime.totalEpisodes, // Update this if backend sends it back
                userNotes: updatedAnime.userNotes
              }
            : anime
        ));
        setEditingAnime(null);
      } else {
        throw new Error(result.message || 'Failed to update anime');
      }
    } catch (err) {
      console.error('Error updating anime:', err);
      setError(err.message);
    }
  };

  const handleEditMangaSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/manga/${editingManga.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send original field names for manga
        body: JSON.stringify({
            title: editMangaForm.title,
            chaptersRead: editMangaForm.chaptersRead,
            totalChapters: editMangaForm.totalChapters,
            status: editMangaForm.status,
            score: editMangaForm.score,
            notes: editMangaForm.notes
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedManga = result.data;
        // Update list with correct fields
        setMangaList(mangaList.map(manga =>
          manga.id === updatedManga._id
            ? {
                ...manga, // Keep existing API data if fetched
                title: updatedManga.title,
                status: updatedManga.status,
                progress: `Chapter ${updatedManga.chaptersRead}/${updatedManga.totalChapters || '?'}`,
                rating: updatedManga.score,
                chaptersRead: updatedManga.chaptersRead,
                totalChapters: updatedManga.totalChapters, // Update this if backend sends it back
                notes: updatedManga.notes
              }
            : manga
        ));
        setEditingManga(null);
      } else {
        throw new Error(result.message || 'Failed to update manga');
      }
    } catch (err) {
      console.error('Error updating manga:', err);
      setError(err.message);
    }
  };

  const handleEditAnimeChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditMangaChange = (e) => {
    const { name, value } = e.target;
    setEditMangaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderEditAnimeModal = () => {
    if (!editingAnime) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Anime Entry</h2>
          <form onSubmit={handleEditAnimeSubmit}>
            {/* Title */}
            <div className="form-group">
              <label>Title:</label>
              <input type="text" name="title" value={editForm.title} onChange={handleEditAnimeChange} required />
            </div>
            {/* Episodes Watched */}
            <div className="form-group">
              <label>Episodes Watched:</label>
              <input type="number" name="episodesWatched" value={editForm.episodesWatched} onChange={handleEditAnimeChange} required />
            </div>
            {/* Total Episodes */}
            <div className="form-group">
               <label>Total Episodes:</label>
               <input type="number" name="totalEpisodes" value={editForm.totalEpisodes} onChange={handleEditAnimeChange} required />
             </div>
            {/* User Status */}
            <div className="form-group">
              <label>Status:</label>
              <select name="userStatus" value={editForm.userStatus} onChange={handleEditAnimeChange} required>
                <option value="Watching">Watching</option>
                <option value="Completed">Completed</option>
                <option value="Plan to Watch">Plan to Watch</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
            {/* User Score */}
            <div className="form-group">
              <label>Score:</label>
              <input type="number" name="userScore" value={editForm.userScore ?? ''} onChange={handleEditAnimeChange} min="0" max="10" /> {/* Handle null score */}
            </div>
            {/* User Notes */}
            <div className="form-group">
              <label>Notes:</label>
              <textarea name="userNotes" value={editForm.userNotes} onChange={handleEditAnimeChange} />
            </div>
            {/* Actions */}
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingAnime(null)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditMangaModal = () => {
    if (!editingManga) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Manga Entry</h2>
          <form onSubmit={handleEditMangaSubmit}>
             {/* Title */}
             <div className="form-group">
               <label>Title:</label>
               <input type="text" name="title" value={editMangaForm.title} onChange={handleEditMangaChange} required />
             </div>
             {/* Chapters Read */}
             <div className="form-group">
               <label>Chapters Read:</label>
               <input type="number" name="chaptersRead" value={editMangaForm.chaptersRead} onChange={handleEditMangaChange} required />
             </div>
             {/* Total Chapters */}
             <div className="form-group">
               <label>Total Chapters:</label>
               <input type="number" name="totalChapters" value={editMangaForm.totalChapters} onChange={handleEditMangaChange} required />
             </div>
             {/* Status */}
            <div className="form-group">
              <label>Status:</label>
              <select name="status" value={editMangaForm.status} onChange={handleEditMangaChange} required>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
                <option value="Plan to Read">Plan to Read</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
             {/* Score */}
            <div className="form-group">
              <label>Score:</label>
              <input type="number" name="score" value={editMangaForm.score ?? ''} onChange={handleEditMangaChange} min="0" max="10" /> {/* Handle null score */}
            </div>
             {/* Notes */}
            <div className="form-group">
              <label>Notes:</label>
              <textarea name="notes" value={editMangaForm.notes} onChange={handleEditMangaChange} />
            </div>
             {/* Actions */}
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingManga(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Render Details Modal Function ---
  const renderDetailsModal = () => {
    if (!viewingDetailsId) return null;

    // Find the item (anime or manga) based on activeTab and viewingDetailsId
    const item = activeTab === 'anime'
      ? animeList.find(a => a.id === viewingDetailsId)
      : mangaList.find(m => m.id === viewingDetailsId);

    if (!item) return null; // Should not happen if ID is set correctly

    // Helper to format date strings nicely
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        // Use options for a clearer date format
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      } catch (e) {
        return 'Invalid Date';
      }
    };

    // Determine if it's anime or manga for specific fields
    const isAnime = activeTab === 'anime';

    return (
      <div className="modal-overlay" onClick={() => setViewingDetailsId(null)}>
        {/* Prevent closing when clicking inside the modal */}
        <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
          <h2>{item.title} - Details</h2>
          <div className="details-content">
            {item.coverImage && <img src={item.coverImage} alt={`${item.title} cover`} className="details-modal-image" />}
            <div className="details-text">
              <p><strong>Synopsis:</strong> {item.synopsis || 'N/A'}</p>
              <hr />
              <h4>Your Tracking:</h4>
              <p><strong>Status:</strong> {isAnime ? item.userStatus : item.status}</p>
              <p><strong>Progress:</strong> {item.progress}</p>
              <p><strong>Your Score:</strong> {(isAnime ? item.userScore : item.rating) !== null && (isAnime ? item.userScore : item.rating) !== undefined ? `${isAnime ? item.userScore : item.rating}/10` : 'N/A'}</p>
              <p><strong>Notes:</strong> {(isAnime ? item.userNotes : item.notes) || 'None'}</p>
              <hr />
              <h4>General Information:</h4>
              <p><strong>MAL ID:</strong> {item.mal_id || 'N/A'}</p>
              {isAnime && <p><strong>Airing Status:</strong> {item.apiStatus || 'N/A'}</p>}
              {/* Add manga specific status if available, e.g., Publishing Status */}
              {!isAnime && item.apiStatus && <p><strong>Publishing Status:</strong> {item.apiStatus}</p>} {/* Example for Manga */}
              <p><strong>Community Score:</strong> {item.apiScore || 'N/A'}</p>
              <p><strong>Source:</strong> {item.source || 'N/A'}</p>
              <p><strong>Genres:</strong> {item.genres?.join(', ') || 'N/A'}</p>
              <p><strong>{isAnime ? 'Aired' : 'Published'}:</strong> {formatDate(item.airedFrom)} to {formatDate(item.airedTo)}</p>
              {isAnime && item.trailerUrl && <p><strong>Trailer:</strong> <a href={item.trailerUrl} target="_blank" rel="noopener noreferrer">Watch Here</a></p>}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setViewingDetailsId(null)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  // --- End Render Details Modal Function ---


  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    const list = activeTab === 'anime' ? animeList : mangaList;
    const isAnime = activeTab === 'anime';

    if (list.length === 0) {
      return (
        <div className="no-data">
          <p>No {activeTab} entries found.</p>
        </div>
      );
    }

    return (
      <>
        <div className="inventory-grid">
          {list.map((item) => (
            <div key={item.id} className="inventory-card" onClick={() => setViewingDetailsId(item.id)} style={{ cursor: 'pointer' }}>
              {item.coverImage && (
                <img src={item.coverImage} alt={`${item.title} cover`} className="inventory-card-image" />
              )}
              <h3>{item.title}</h3>
              <div className="inventory-details">
                 {/* Display user status for anime, original status for manga */}
                <p><strong>Status:</strong> {isAnime ? item.userStatus : item.status}</p>
                <p><strong>Progress:</strong> {item.progress}</p>
                 {/* Display user score for anime, original rating for manga */}
                <p><strong>Rating:</strong> {(isAnime ? item.userScore : item.rating) !== null && (isAnime ? item.userScore : item.rating) !== undefined ? `${isAnime ? item.userScore : item.rating}/10` : 'N/A'}</p>
              </div>
              <div className="inventory-actions">
                <button
                  className="btn btn-primary"
                  onClick={(e) => { e.stopPropagation(); isAnime ? handleEditAnime(item) : handleEditManga(item); }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={(e) => { e.stopPropagation(); isAnime ? handleDeleteAnime(item.id) : handleDeleteManga(item.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="inventory-page">
      <Navbar />
      <div className="inventory-container">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'anime' ? 'active' : ''}`}
            onClick={() => setActiveTab('anime')}
          >
            Anime
          </button>
          <button
            className={`tab-button ${activeTab === 'manga' ? 'active' : ''}`}
            onClick={() => setActiveTab('manga')}
          >
            Manga
          </button>
        </div>
        {renderContent()}
        {renderEditAnimeModal()}
        {renderEditMangaModal()}
        {renderDetailsModal()} {/* Call the new details modal here */}
      </div>
    </div>
  );
};

export default InventoryPage;