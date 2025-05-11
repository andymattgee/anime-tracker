import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './InventoryPage.css'; // We can reuse the same CSS for now

const AnimeInventoryPage = () => {
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAnime, setEditingAnime] = useState(null);
  const [viewingDetailsId, setViewingDetailsId] = useState(null);
  const [editForm, setEditForm] = useState({
    episodesWatched: '',
    userStatus: '',
    userScore: '',
    userNotes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

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
      setLoading(false);
    } catch (err) {
      console.error('Error fetching anime data:', err);
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

  const handleEditAnime = (anime) => {
    setEditingAnime(anime);
    setEditForm({
      episodesWatched: anime.episodesWatched,
      userStatus: anime.userStatus,
      userScore: anime.userScore,
      userNotes: anime.userNotes
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
        body: JSON.stringify({
            episodesWatched: editForm.episodesWatched,
            userStatus: editForm.userStatus,
            userScore: editForm.userScore,
            userNotes: editForm.userNotes
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedAnime = result.data;
        setAnimeList(animeList.map(anime =>
          anime.id === updatedAnime._id
            ? {
                ...anime,
                userStatus: updatedAnime.userStatus,
                progress: `Episode ${updatedAnime.episodesWatched}/${anime.totalEpisodes || '?'}`,
                userScore: updatedAnime.userScore,
                episodesWatched: updatedAnime.episodesWatched,
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

  const handleEditAnimeChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderEditAnimeModal = () => {
    if (!editingAnime) return null;

    return (
      <div className="modal-overlay" onClick={() => setEditingAnime(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Edit Anime Entry - {editingAnime.title}</h2>
          <form onSubmit={handleEditAnimeSubmit}>
            <div className="form-group">
              <label>Episodes Watched:</label>
              <input type="number" name="episodesWatched" value={editForm.episodesWatched} onChange={handleEditAnimeChange} required />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select name="userStatus" value={editForm.userStatus} onChange={handleEditAnimeChange} required>
                <option value="Watching">Watching</option>
                <option value="Completed">Completed</option>
                <option value="Plan to Watch">Plan to Watch</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
            <div className="form-group">
              <label>Score:</label>
              <input type="number" name="userScore" value={editForm.userScore ?? ''} onChange={handleEditAnimeChange} min="0" max="10" />
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <textarea name="userNotes" value={editForm.userNotes} onChange={handleEditAnimeChange} />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingAnime(null)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDetailsModal = () => {
    if (!viewingDetailsId) return null;

    const item = animeList.find(a => a.id === viewingDetailsId);

    if (!item) return null;

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      } catch (e) {
        return 'Invalid Date';
      }
    };

    return (
      <div className="modal-overlay" onClick={() => setViewingDetailsId(null)}>
        <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
          <h2>{item.title} - Details</h2>
          <div className="details-content">
            {item.coverImage && <img src={item.coverImage} alt={`${item.title} cover`} className="details-modal-image" />}
            <div className="details-text">
              <p><strong>Synopsis:</strong> {item.synopsis || 'N/A'}</p>
              <hr />
              <h4>Your Tracking: <span
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', marginLeft: '10px' }}
                onClick={() => handleEditAnime(item)}
              >
                Edit
              </span></h4>
              <p><strong>Status:</strong> {item.userStatus}</p>
              <p><strong>Progress:</strong> {item.progress}</p>
              <p><strong>Your Score:</strong> {item.userScore !== null && item.userScore !== undefined ? `${item.userScore}/10` : 'N/A'}</p>
              <p><strong>Notes:</strong> {item.userNotes || 'None'}</p>
              <hr />
              <h4>General Information:</h4>
              <p><strong>MAL ID:</strong> {item.mal_id || 'N/A'}</p>
              <p><strong>Airing Status:</strong> {item.apiStatus || 'N/A'}</p>
              <p><strong>Community Score:</strong> {item.apiScore || 'N/A'}</p>
              <p><strong>Source:</strong> {item.source || 'N/A'}</p>
              <p><strong>Genres:</strong> {item.genres?.join(', ') || 'N/A'}</p>
              <p><strong>Aired:</strong> {formatDate(item.airedFrom)} to {formatDate(item.airedTo)}</p>
              {item.trailerUrl && <p><strong>Trailer:</strong> <a href={item.trailerUrl} target="_blank" rel="noopener noreferrer">Watch Here</a></p>}
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setViewingDetailsId(null);
                handleDeleteAnime(item.id);
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setViewingDetailsId(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (animeList.length === 0) {
      return (
        <div className="no-data">
          <p>No anime entries found.</p>
        </div>
      );
    }

    return (
      <>
        <div className="results-grid">
          {animeList.map((item) => (
            <div key={item.id} className="result-card">
              <div className="card-content" onClick={() => setViewingDetailsId(item.id)}>
                {item.coverImage && (
                  <img
                    src={item.coverImage}
                    alt={`${item.title} cover`}
                  />
                )}
                <h3>{item.title}</h3>
                <div className="inventory-details">
                  <p><strong>Status:</strong> {item.userStatus}</p>
                  <p><strong>Community Score:</strong> {item.apiScore || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="inventory-page"> {/* Consider renaming class if specific styling is needed */}
      <Navbar />
      <div className="inventory-container">
        <h1>My Anime</h1>
        {renderContent()}
        {renderDetailsModal()}
        {renderEditAnimeModal()}
      </div>
    </div>
  );
};

export default AnimeInventoryPage;