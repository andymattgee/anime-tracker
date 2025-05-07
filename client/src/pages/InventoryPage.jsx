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
  const [editForm, setEditForm] = useState({
    title: '',
    episodesWatched: '',
    totalEpisodes: '',
    status: '',
    score: '',
    notes: ''
  });
  const [editMangaForm, setEditMangaForm] = useState({
    title: '',
    chaptersRead: '',
    totalChapters: '',
    status: '',
    score: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'anime') {
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
      } else {
        // Fetch manga data
        const response = await fetch('http://localhost:5001/api/manga');
        if (!response.ok) {
          throw new Error('Failed to fetch manga data');
        }
        const result = await response.json();
        
        if (result.success) {
          const formattedManga = result.data.map(manga => ({
            id: manga._id,
            title: manga.title,
            status: manga.status,
            progress: `Chapter ${manga.chaptersRead}/${manga.totalChapters}`,
            rating: manga.score,
            chaptersRead: manga.chaptersRead,
            totalChapters: manga.totalChapters,
            notes: manga.notes
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
      status: anime.status,
      score: anime.rating,
      notes: anime.notes
    });
  };

  const handleEditManga = (manga) => {
    setEditingManga(manga);
    setEditMangaForm({
      title: manga.title,
      chaptersRead: manga.chaptersRead,
      totalChapters: manga.totalChapters,
      status: manga.status,
      score: manga.rating,
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

  const handleEditMangaSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/manga/${editingManga.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editMangaForm),
      });

      const result = await response.json();

      if (result.success) {
        const updatedManga = result.data;
        setMangaList(mangaList.map(manga => 
          manga.id === updatedManga._id 
            ? {
                ...manga,
                title: updatedManga.title,
                status: updatedManga.status,
                progress: `Chapter ${updatedManga.chaptersRead}/${updatedManga.totalChapters}`,
                rating: updatedManga.score,
                chaptersRead: updatedManga.chaptersRead,
                totalChapters: updatedManga.totalChapters,
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
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditAnimeChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Episodes Watched:</label>
              <input
                type="number"
                name="episodesWatched"
                value={editForm.episodesWatched}
                onChange={handleEditAnimeChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Total Episodes:</label>
              <input
                type="number"
                name="totalEpisodes"
                value={editForm.totalEpisodes}
                onChange={handleEditAnimeChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={editForm.status}
                onChange={handleEditAnimeChange}
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
                onChange={handleEditAnimeChange}
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
                onChange={handleEditAnimeChange}
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

  const renderEditMangaModal = () => {
    if (!editingManga) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Manga Entry</h2>
          <form onSubmit={handleEditMangaSubmit}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={editMangaForm.title}
                onChange={handleEditMangaChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Chapters Read:</label>
              <input
                type="number"
                name="chaptersRead"
                value={editMangaForm.chaptersRead}
                onChange={handleEditMangaChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Total Chapters:</label>
              <input
                type="number"
                name="totalChapters"
                value={editMangaForm.totalChapters}
                onChange={handleEditMangaChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={editMangaForm.status}
                onChange={handleEditMangaChange}
                required
              >
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
                <option value="Plan to Read">Plan to Read</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
            <div className="form-group">
              <label>Score:</label>
              <input
                type="number"
                name="score"
                value={editMangaForm.score}
                onChange={handleEditMangaChange}
                min="0"
                max="10"
                required
              />
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                name="notes"
                value={editMangaForm.notes}
                onChange={handleEditMangaChange}
              />
            </div>
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
          {activeTab === 'anime' ? (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/add-anime')}
            >
              Add New Anime
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/add-manga')}
            >
              Add New Manga
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="inventory-header">
          {activeTab === 'anime' ? (
            <button 
              className="btn btn-primary add-button"
              onClick={() => navigate('/add-anime')}
            >
              Add New Anime
            </button>
          ) : (
            <button 
              className="btn btn-primary add-button"
              onClick={() => navigate('/add-manga')}
            >
              Add New Manga
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
                  onClick={() => activeTab === 'anime' ? handleEditAnime(item) : handleEditManga(item)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => activeTab === 'anime' ? handleDeleteAnime(item.id) : handleDeleteManga(item.id)}
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
      </div>
    </div>
  );
};

export default InventoryPage; 