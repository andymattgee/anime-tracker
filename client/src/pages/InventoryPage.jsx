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
  const [editForm, setEditForm] = useState({
    title: '',
    episodesWatched: '',
    totalEpisodes: '',
    status: '',
    score: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/anime');
      if (!response.ok) {
        throw new Error('Failed to fetch anime data');
      }
      const result = await response.json();
      
      if (result.success) {
        const formattedAnime = result.data.map(anime => ({
          id: anime._id,
          title: anime.title,
          status: anime.status,
          progress: `Episode ${anime.episodesWatched}/${anime.totalEpisodes}`,
          rating: anime.score,
          episodesWatched: anime.episodesWatched,
          totalEpisodes: anime.totalEpisodes,
          notes: anime.notes
        }));
        setAnimeList(formattedAnime);
      } else {
        throw new Error(result.message || 'Failed to fetch anime data');
      }
      
      setMangaList([]); // Empty array for manga until implemented
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
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

  const handleEdit = (anime) => {
    setEditingAnime(anime);
    setEditForm({
      title: anime.title,
      episodesWatched: anime.episodesWatched,
      totalEpisodes: anime.totalEpisodes,
      status: anime.status,
      score: anime.rating,
      notes: anime.notes
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/anime/${editingAnime.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (result.success) {
        const updatedAnime = result.data;
        setAnimeList(animeList.map(anime => 
          anime.id === updatedAnime._id 
            ? {
                ...anime,
                title: updatedAnime.title,
                status: updatedAnime.status,
                progress: `Episode ${updatedAnime.episodesWatched}/${updatedAnime.totalEpisodes}`,
                rating: updatedAnime.score,
                episodesWatched: updatedAnime.episodesWatched,
                totalEpisodes: updatedAnime.totalEpisodes,
                notes: updatedAnime.notes
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderEditModal = () => {
    if (!editingAnime) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Anime Entry</h2>
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Episodes Watched:</label>
              <input
                type="number"
                name="episodesWatched"
                value={editForm.episodesWatched}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Total Episodes:</label>
              <input
                type="number"
                name="totalEpisodes"
                value={editForm.totalEpisodes}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                required
              >
                <option value="Watching">Watching</option>
                <option value="Completed">Completed</option>
                <option value="Plan to Watch">Plan to Watch</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
            <div className="form-group">
              <label>Score:</label>
              <input
                type="number"
                name="score"
                value={editForm.score}
                onChange={handleEditChange}
                min="0"
                max="10"
                required
              />
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                name="notes"
                value={editForm.notes}
                onChange={handleEditChange}
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setEditingAnime(null)}
              >
                Cancel
              </button>
            </div>
          </form>
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

    const list = activeTab === 'anime' ? animeList : mangaList;
    const progressLabel = activeTab === 'anime' ? 'Episodes' : 'Chapters';

    if (list.length === 0) {
      return (
        <div className="no-data">
          <p>No {activeTab} entries found.</p>
          {activeTab === 'anime' && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/add-anime')}
            >
              Add New Anime
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="inventory-header">
          {activeTab === 'anime' && (
            <button 
              className="btn btn-primary add-button"
              onClick={() => navigate('/add-anime')}
            >
              Add New Anime
            </button>
          )}
        </div>
        <div className="inventory-grid">
          {list.map((item) => (
            <div key={item.id} className="inventory-card">
              <h3>{item.title}</h3>
              <div className="inventory-details">
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Progress:</strong> {item.progress}</p>
                <p><strong>Rating:</strong> {item.rating}/10</p>
              </div>
              <div className="inventory-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleDelete(item.id)}
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
        {renderEditModal()}
      </div>
    </div>
  );
};

export default InventoryPage; 