import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MediaCard from '../components/MediaCard'; // Import MediaCard
import DetailsModal from '../components/DetailsModal'; // Import DetailsModal
import './InventoryPage.css'; // We can reuse the same CSS for now

const MangaInventoryPage = () => {
  const navigate = useNavigate();
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingManga, setEditingManga] = useState(null);
  const [viewingDetailsId, setViewingDetailsId] = useState(null);
  const [editMangaForm, setEditMangaForm] = useState({
    chaptersRead: '',
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

      const response = await fetch('http://localhost:5001/api/manga');
      if (!response.ok) {
        throw new Error(`Failed to fetch manga data: ${response.statusText}`);
      }
      const result = await response.json();

      if (result.success) {
        const formattedManga = result.data.map(manga => ({
          id: manga._id,
          title: manga.title,
          // Assuming backend model uses userStatus, userScore, userNotes
          status: manga.userStatus, // For display consistency if needed, or use manga.userStatus directly
          progress: `Chapter ${manga.chaptersRead}/${manga.totalChapters || '?'}`,
          rating: manga.userScore,  // For display consistency, maps to userScore
          chaptersRead: manga.chaptersRead,
          totalChapters: manga.totalChapters,
          notes: manga.userNotes,   // For display consistency, maps to userNotes
          coverImage: manga.coverImage,
          synopsis: manga.synopsis,
          apiStatus: manga.apiStatus,
          apiScore: manga.apiScore,
          source: manga.source,
          genres: manga.genres,
          airedFrom: manga.airedFrom,
          airedTo: manga.airedTo,
          mal_id: manga.mal_id,
          // Store the original user fields if needed for editing
          userStatus: manga.userStatus,
          userScore: manga.userScore,
          userNotes: manga.userNotes
        }));
        setMangaList(formattedManga);
      } else {
        throw new Error(result.message || 'Failed to fetch manga data');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching manga data:', err);
      setError(err.message);
      setLoading(false);
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

  const handleEditManga = (manga) => {
    setEditingManga(manga);
    setEditMangaForm({
      chaptersRead: manga.chaptersRead,
      userStatus: manga.userStatus, // Use the direct field from fetched manga
      userScore: manga.userScore,   // Use the direct field
      userNotes: manga.userNotes    // Use the direct field
    });
  };

  const handleEditMangaSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/manga/${editingManga.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chaptersRead: editMangaForm.chaptersRead,
            userStatus: editMangaForm.userStatus,
            userScore: editMangaForm.userScore,
            userNotes: editMangaForm.userNotes
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedManga = result.data;
        setMangaList(mangaList.map(manga =>
          manga.id === updatedManga._id
            ? { // Ensure updatedManga from backend has userStatus, userScore, userNotes
                ...manga,
                status: updatedManga.userStatus, // Update display field
                progress: `Chapter ${updatedManga.chaptersRead}/${manga.totalChapters || '?'}`,
                rating: updatedManga.userScore,  // Update display field
                chaptersRead: updatedManga.chaptersRead,
                notes: updatedManga.userNotes,   // Update display field
                // also update the direct user* fields on the local item
                userStatus: updatedManga.userStatus,
                userScore: updatedManga.userScore,
                userNotes: updatedManga.userNotes
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

  const handleEditMangaChange = (e) => {
    const { name, value } = e.target;
    setEditMangaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderEditMangaModal = () => {
    if (!editingManga) return null;

    return (
      <div className="modal-overlay" onClick={() => setEditingManga(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Edit Manga Entry - {editingManga.title}</h2>
          <form onSubmit={handleEditMangaSubmit}>
             {/* Title field removed */}
             <div className="form-group">
               <label>Chapters Read:</label>
               <input type="number" name="chaptersRead" value={editMangaForm.chaptersRead} onChange={handleEditMangaChange} required />
             </div>
             {/* Total Chapters field removed */}
            <div className="form-group">
              <label>Status:</label>
              <select name="userStatus" value={editMangaForm.userStatus} onChange={handleEditMangaChange} required>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
                <option value="Plan to Read">Plan to Read</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
            <div className="form-group">
              <label>Score:</label>
              <input type="number" name="userScore" value={editMangaForm.userScore ?? ''} onChange={handleEditMangaChange} min="0" max="10" />
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <textarea name="userNotes" value={editMangaForm.userNotes} onChange={handleEditMangaChange} />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingManga(null)}>Cancel</button>
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

    if (mangaList.length === 0) {
      return (
        <div className="no-data">
          <p>No manga entries found.</p>
        </div>
      );
    }

    return (
      <>
        <div className="results-grid">
          {mangaList.map((item) => (
            <MediaCard
              key={item.id}
              item={item} // Pass the manga item
              onClick={() => setViewingDetailsId(item.id)}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="inventory-page"> {/* Consider renaming class if specific styling is needed */}
      <Navbar />
      <div className="inventory-container">
        <h1>My Manga</h1>
        {renderContent()}
        <DetailsModal
          isOpen={!!viewingDetailsId}
          onClose={() => setViewingDetailsId(null)}
          item={mangaList.find(m => m.id === viewingDetailsId)}
          onEdit={handleEditManga}
          onDelete={handleDeleteManga}
          mediaType="manga"
        />
        {renderEditMangaModal()}
      </div>
    </div>
  );
};

export default MangaInventoryPage;