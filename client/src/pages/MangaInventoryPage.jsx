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
  // const [editingManga, setEditingManga] = useState(null); // No longer needed
  const [viewingDetailsId, setViewingDetailsId] = useState(null);
  const [selectedMangaIds, setSelectedMangaIds] = useState(new Set());
  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  // const [editMangaForm, setEditMangaForm] = useState({ // Form state will be managed by DetailsModal
  //   chaptersRead: '',
  //   userStatus: '',
  //   userScore: '',
  //   userNotes: ''
  // });

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
          title_english: manga.title_english,
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

  const handleToggleSelectManga = (mangaId) => {
    setSelectedMangaIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(mangaId)) {
        newSelectedIds.delete(mangaId);
      } else {
        newSelectedIds.add(mangaId);
      }
      return newSelectedIds;
    });
  };

  const toggleSelectMode = () => {
    setIsSelectModeActive(prevMode => {
      if (prevMode) { // If turning off select mode
        setSelectedMangaIds(new Set()); // Clear selections
      }
      return !prevMode;
    });
  };

  const handleBulkDeleteManga = async () => {
    if (selectedMangaIds.size === 0) {
      alert("No manga selected for deletion.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedMangaIds.size} selected manga entries?`)) {
      try {
        const idsToDelete = Array.from(selectedMangaIds);
        const response = await fetch(`http://localhost:5001/api/manga/bulk-delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: idsToDelete }),
        });
        const result = await response.json();
        if (result.success) {
          setMangaList(prevList => prevList.filter(manga => !idsToDelete.includes(manga.id)));
          setSelectedMangaIds(new Set()); // Clear selection
          setIsSelectModeActive(false); // Exit select mode after deletion
          alert(`${result.deletedCount} manga entries deleted successfully.`);
        } else {
          throw new Error(result.message || 'Failed to bulk delete manga');
        }
      } catch (err) {
        console.error('Error bulk deleting manga:', err);
        setError(err.message);
      }
    }
  };

  const handleSaveChanges = async (mangaId, updatedData) => {
    // updatedData from DetailsModal contains { chaptersRead, userStatus, userScore, userNotes }
    try {
      const response = await fetch(`http://localhost:5001/api/manga/${mangaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (result.success) {
        const updatedMangaBackend = result.data; // Full updated manga object from backend
        setMangaList(prevList => prevList.map(manga =>
          manga.id === updatedMangaBackend._id
            ? {
                ...manga, // Preserve existing non-editable fields
                chaptersRead: updatedMangaBackend.chaptersRead,
                userStatus: updatedMangaBackend.userStatus,
                userScore: updatedMangaBackend.userScore,
                userNotes: updatedMangaBackend.userNotes,
                totalChapters: updatedMangaBackend.totalChapters || manga.totalChapters, // Preserve totalChapters

                // Update aliases for display consistency within the list item
                status: updatedMangaBackend.userStatus,
                rating: updatedMangaBackend.userScore,
                notes: updatedMangaBackend.userNotes,
                
                // Recompute progress string
                progress: `Chapter ${updatedMangaBackend.chaptersRead}/${updatedMangaBackend.totalChapters || manga.totalChapters || '?'}`,
              }
            : manga
        ));
        // setViewingDetailsId(null); // Optional: Close modal upon successful save
      } else {
        throw new Error(result.message || 'Failed to update manga');
      }
    } catch (err) {
      console.error('Error updating manga:', err);
      setError(err.message);
    }
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
        <div className="inventory-controls" style={{ marginBottom: '20px', textAlign: 'right' }}>
          <button onClick={toggleSelectMode} className={`btn ${isSelectModeActive ? 'btn-warning' : 'btn-primary'}`}>
            {isSelectModeActive ? 'Cancel Selection' : 'Select Items to Delete'}
          </button>
          {isSelectModeActive && selectedMangaIds.size > 0 && (
            <button onClick={handleBulkDeleteManga} className="btn btn-danger" style={{ marginLeft: '10px' }}>
              Delete Selected ({selectedMangaIds.size})
            </button>
          )}
        </div>
        <div className="results-grid">
          {mangaList.map((item) => (
            <MediaCard
              key={item.id}
              item={item} // Pass the manga item
              onClick={() => {
                if (isSelectModeActive) {
                  handleToggleSelectManga(item.id);
                } else {
                  setViewingDetailsId(item.id);
                }
              }}
              isSelected={selectedMangaIds.has(item.id)}
              onSelectToggle={isSelectModeActive ? handleToggleSelectManga : undefined}
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
          onSave={handleSaveChanges} // Use the new save handler
          onDelete={handleDeleteManga}
          mediaType="manga"
          onRecommendationAdded={fetchData} // Add this prop
        />
        {/* renderEditMangaModal() is no longer called */}
      </div>
    </div>
  );
};

export default MangaInventoryPage;